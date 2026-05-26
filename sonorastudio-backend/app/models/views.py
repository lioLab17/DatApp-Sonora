from sqlalchemy import Column, Integer, String, Date, Float
from app.db.conexion import Base

class DashboardClienteModel(Base):
    __tablename__ = "v_dashboard_cliente"
    id_episodio = Column(Integer, primary_key=True)
    ruc_cliente = Column(String)
    razon_social = Column(String)
    id_proyecto = Column(Integer)
    nombre_proyecto = Column(String)
    titulo_episodio = Column(String)
    estado_episodio = Column(String)
    fecha_grabacion = Column(Date)

class DashboardIngenieroModel(Base):
    __tablename__ = "v_dashboard_ingeniero"
    id_episodio = Column(Integer, primary_key=True)
    id_ingeniero = Column(Integer)
    nombre_ingeniero = Column(String)
    titulo_episodio = Column(String)
    estado_episodio = Column(String)
    fecha_grabacion = Column(Date)
    id_proyecto = Column(Integer)
    nombre_proyecto = Column(String)

class DashboardProductorModel(Base):
    __tablename__ = "v_dashboard_productor"
    id_proyecto = Column(Integer, primary_key=True)
    nombre_proyecto = Column(String)
    ruc_cliente = Column(String)
    nombre_cliente = Column(String)
    total_episodios = Column(Integer)

class DashboardFinanzasModel(Base):
    __tablename__ = "v_dashboard_finanzas"
    id_control = Column(Integer, primary_key=True)
    ingresos_mes = Column(Float)
    cuentas_por_cobrar = Column(Float)
    facturas_pendientes = Column(Integer)