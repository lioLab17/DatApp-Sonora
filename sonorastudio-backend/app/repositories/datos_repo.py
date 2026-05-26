from sqlalchemy.orm import Session
from sqlalchemy import or_, cast, String, text
from app.queries.sql_queries import *
from app.models.views import (
    DashboardFinanzasModel, 
    DashboardClienteModel, 
    DashboardIngenieroModel, 
    DashboardProductorModel
)

def repo_login(db: Session, usuario: str):
    return db.execute(text(Q_LOGIN), {"ruc": usuario}).fetchone()

def repo_obtener_dashboard_productor(db: Session, busqueda: str, filtro_estado: str):
    consulta = db.query(DashboardProductorModel)
    if busqueda:
        termino = f"%{busqueda}%"
        consulta = consulta.filter(
            or_(
                DashboardProductorModel.nombre_proyecto.ilike(termino),
                DashboardProductorModel.nombre_cliente.ilike(termino),
                cast(DashboardProductorModel.id_proyecto, String).ilike(termino)
            )
        )
    if filtro_estado == "Pendientes":
        consulta = consulta.filter(DashboardProductorModel.total_episodios == 0)
    elif filtro_estado == "En Proceso":
        consulta = consulta.filter(DashboardProductorModel.total_episodios > 0)
        
    return consulta.order_by(DashboardProductorModel.id_proyecto.desc()).all()

def repo_obtener_dashboard_cliente(db: Session, ruc_cliente: str):
    return db.query(DashboardClienteModel).filter(DashboardClienteModel.ruc_cliente == ruc_cliente).all()

def repo_obtener_dashboard_ingeniero(db: Session, id_ingeniero: int):
    return db.query(DashboardIngenieroModel).filter(DashboardIngenieroModel.id_ingeniero == id_ingeniero).all()

def repo_obtener_dashboard_finanzas(db: Session):
    return db.query(DashboardFinanzasModel).first()

def repo_obtener_lista_clientes(db: Session):
    resultados = db.execute(text(Q_LISTA_CLIENTES)).fetchall()
    if not resultados:
        return [{"ruc": "20100200300", "nombre": "Cliente Demo (Sin DB)"}]
    return [{"ruc": str(r[0]), "nombre": str(r[1])} for r in resultados]

def repo_registrar_ficha(db: Session, id_episodio: int, data: dict):
    resultado = db.execute(text(Q_UPDATE_FICHA), {
        "plugins": data["cadena_plugins"],
        "lufs": data["nivel_lufs"],
        "obs": data["observaciones"],
        "estado": data["estado_episodio"],
        "id": id_episodio
    })
    db.commit()
    return resultado.rowcount

def repo_bi_tendencia(db: Session):
    resultados = db.execute(text(Q_BI_TENDENCIA)).fetchall()
    return [{"mes": r[0], "total": float(r[1]) if r[1] else 0} for r in resultados]

def repo_bi_top_clientes(db: Session):
    resultados = db.execute(text(Q_BI_TOP_CLIENTES)).fetchall()
    return [{"nombre": r[0], "facturado": float(r[1]) if r[1] else 0} for r in resultados]

def repo_bi_distribucion(db: Session):
    resultados = db.execute(text(Q_BI_DISTRIBUCION)).fetchall()
    return [{"name": r[0], "value": int(r[1])} for r in resultados]

def repo_bi_equipo(db: Session):
    resultados = db.execute(text(Q_BI_EQUIPO)).fetchall()
    equipo = []
    for r in resultados:
        partes = str(r[1]).split(" ")
        iniciales = (partes[0][0] + (partes[1][0] if len(partes)>1 else "")).upper()
        carga = int(r[7])
        limite = 5 
        estado = "Sobrecargado" if carga >= limite else ("Ocupada" if carga > 0 else "Disponible")
        equipo.append({
            "id": r[0], "nombre": r[1], "especialidad": r[2] if r[2] else "Ingeniero", 
            "seniority": r[3] if r[3] else "Junior", "software": r[4] if r[4] else "Pro Tools", 
            "qc": float(r[5]) if r[5] else 5.0, "velocidad": int(r[6]) if r[6] else 100, 
            "carga": carga, "limite": limite, "estado": estado, "iniciales": iniciales
        })
    return equipo