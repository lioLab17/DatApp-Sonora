from conexion import engine
import pandas as pd

try:
    df = pd.read_sql("SELECT NOW()", engine)
    print("✅ Conexión exitosa")
    print(df)
except Exception as e:
    print("❌ Error de conexión")
    print(e)
