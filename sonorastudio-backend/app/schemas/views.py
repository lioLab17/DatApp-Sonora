from pydantic import BaseModel
from typing import Optional
from datetime import date

class DashboardClienteSchema(BaseModel):
    ruc_cliente: str
    razon_social: str
    id_proyecto: int
    nombre_proyecto: str
    id_episodio: Optional[int] = None
    titulo_episodio: Optional[str] = None
    estado_episodio: Optional[str] = None
    fecha_grabacion: Optional[date] = None

    class Config:
        from_attributes = True

class DashboardIngenieroSchema(BaseModel):
    id_ingeniero: int
    nombre_ingeniero: str
    id_episodio: int
    titulo_episodio: str
    estado_episodio: Optional[str] = None
    fecha_grabacion: Optional[date] = None
    id_proyecto: int
    nombre_proyecto: str

    class Config:
        from_attributes = True

class DashboardProductorSchema(BaseModel):
    id_proyecto: int
    nombre_proyecto: str
    ruc_cliente: str
    nombre_cliente: str
    total_episodios: int

    class Config:
        from_attributes = True

class DashboardFinanzasSchema(BaseModel):
    ingresos_mes: float
    cuentas_por_cobrar: float
    facturas_pendientes: int

    class Config:
        from_attributes = True

class RegistrarFichaSchema(BaseModel):
    cadena_plugins: str
    nivel_lufs: float
    observaciones: str
    estado_episodio: str = "Revisión"




class TendenciaSchema(BaseModel):
    mes: str
    total: float

class TopClienteSchema(BaseModel):
    nombre: str
    facturado: float

class DistribucionServicioSchema(BaseModel):
    name: str
    value: int

class EquipoSchema(BaseModel):
    id: int
    nombre: str
    especialidad: str
    carga: int
    limite: int
    estado: str
    iniciales: str
    seniority: str
    software: str
    qc: float
    velocidad: int