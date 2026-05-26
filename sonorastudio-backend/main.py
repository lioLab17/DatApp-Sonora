# main.py
from fastapi import FastAPI, Depends, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List

from app.db.conexion import get_db
from app.schemas.views import (
    RegistrarFichaSchema, DashboardFinanzasSchema, DashboardClienteSchema, 
    DashboardIngenieroSchema, DashboardProductorSchema, TendenciaSchema,
    TopClienteSchema, DistribucionServicioSchema, EquipoSchema
)

from app.repositories.datos_repo import *

app = FastAPI(title="Sonora Studio API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class LoginRequest(BaseModel):
    usuario: str 
    contrasena: str

@app.post("/api/login")
def iniciar_sesion(data: LoginRequest, db: Session = Depends(get_db)):
    result = repo_login(db, data.usuario)
    if not result:
        raise HTTPException(status_code=401, detail="Usuario no encontrado")
    
    ruc_db, nombre_db, pass_db = result
    if pass_db != data.contrasena:
        raise HTTPException(status_code=401, detail="Contraseña incorrecta")

    return {
        "status": "success", "rol": "cliente",
        "ruc": str(ruc_db), "nombre": str(nombre_db)
    }

@app.get("/")
def read_root():
    return {"status": "ok", "mensaje": "API de Sonora Studio conectada a Supabase"}

@app.get("/api/dashboard/productor", response_model=List[DashboardProductorSchema])
def obtener_dashboard_productor(
    busqueda: str = Query(None, description="Término para buscar por ID, proyecto o cliente"),
    filtro_estado: str = Query("Todos", description="Filtro por estado de producción"),
    db: Session = Depends(get_db)
):
    return repo_obtener_dashboard_productor(db, busqueda, filtro_estado)

@app.get("/api/dashboard/cliente/{ruc_cliente}", response_model=List[DashboardClienteSchema])
def obtener_dashboard_cliente(ruc_cliente: str, db: Session = Depends(get_db)):
    datos = repo_obtener_dashboard_cliente(db, ruc_cliente)
    if not datos:
        raise HTTPException(status_code=404, detail="No se encontraron proyectos para este cliente")
    return datos

@app.get("/api/dashboard/ingeniero/{id_ingeniero}", response_model=List[DashboardIngenieroSchema])
def obtener_dashboard_ingeniero(id_ingeniero: int, db: Session = Depends(get_db)):
    datos = repo_obtener_dashboard_ingeniero(db, id_ingeniero)
    if not datos:
        raise HTTPException(status_code=404, detail="No se encontraron episodios para este ingeniero")
    return datos

@app.get("/api/dashboard/finanzas", response_model=DashboardFinanzasSchema)
def obtener_dashboard_finanzas(db: Session = Depends(get_db)):
    finanzas = repo_obtener_dashboard_finanzas(db)
    if not finanzas:
        return {"ingresos_mes": 0.0, "cuentas_por_cobrar": 0.0, "facturas_pendientes": 0}
    return finanzas

@app.get("/api/clientes")
def obtener_lista_clientes(db: Session = Depends(get_db)):
    return repo_obtener_lista_clientes(db)

@app.put("/api/episodio/{id_episodio}/ficha")
def registrar_ficha_tecnica(id_episodio: int, data: RegistrarFichaSchema, db: Session = Depends(get_db)):
    filas_afectadas = repo_registrar_ficha(db, id_episodio, data.model_dump())
    if filas_afectadas == 0:
        raise HTTPException(status_code=404, detail="Episodio no encontrado en el sistema")
    return {"status": "success", "mensaje": "Ficha técnica grabada y track enviado a revisión"}

@app.get("/api/dashboard/bi/tendencia", response_model=List[TendenciaSchema])
def bi_tendencia(db: Session = Depends(get_db)):
    return repo_bi_tendencia(db)

@app.get("/api/dashboard/bi/top-clientes", response_model=List[TopClienteSchema])
def bi_top_clientes(db: Session = Depends(get_db)):
    return repo_bi_top_clientes(db)

@app.get("/api/dashboard/bi/distribucion", response_model=List[DistribucionServicioSchema])
def bi_distribucion(db: Session = Depends(get_db)):
    return repo_bi_distribucion(db)

@app.get("/api/dashboard/bi/equipo", response_model=List[EquipoSchema])
def bi_equipo(db: Session = Depends(get_db)):
    return repo_bi_equipo(db)