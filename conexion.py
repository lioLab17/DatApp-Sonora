"""
Conexión a PostgreSQL usando Supabase.
"""

# Crear conexión SQL
from sqlalchemy import create_engine

# Cargar variables desde .env
from dotenv import load_dotenv

# Manejo de variables del sistema
import os

# Cargar variables de entorno
load_dotenv()


# Credenciales de la base de datos
DB_USER = os.getenv("DB_USER")
DB_PASSWORD = os.getenv("DB_PASSWORD")
DB_HOST = os.getenv("DB_HOST")
DB_PORT = os.getenv("DB_PORT")
DB_NAME = os.getenv("DB_NAME")


# Crear conexión hacia PostgreSQL/Supabase
engine = create_engine(
    f"postgresql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}?sslmode=require"
)