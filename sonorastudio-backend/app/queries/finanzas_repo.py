from sqlalchemy.orm import Session
from sqlalchemy import text
from app.queries.sql_finanzas import Q_TENDENCIA_MENSUAL

def obtener_tendencias(db: Session):
    resultados = db.execute(text(Q_TENDENCIA_MENSUAL)).fetchall()

    return [{"mes": r[0], "total": float(r[1]) if r[1] else 0} for r in resultados]