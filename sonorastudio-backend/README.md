# 📊 Conexión a Base de Datos Supabase con Python

Proyecto para conectar y consultar una base de datos PostgreSQL alojada en Supabase desde Python.

---

## 📋 Requisitos Previos

- Python 3.8 o superior instalado en tu máquina
- Git (opcional, para clonar el proyecto)

---

## 🚀 Instalación y Configuración

### **Paso 1: Clonar o Descargar el Proyecto**

```bash
# Con Git
git clone <URL-del-repositorio>
cd test_equipo

# O descargar el ZIP y extraer
```

---

### **Paso 2: Crear un Entorno Virtual**

Un entorno virtual aísla las dependencias del proyecto. Así no interfiere con otros proyectos.

#### **En Windows:**
```bash
python -m venv venv_test
```

#### **En Linux/Mac:**
```bash
python3 -m venv venv_test
```

---

### **Paso 3: Activar el Entorno Virtual**

#### **En Windows:**
```bash
venv_test\Scripts\activate
```
*Deberías ver `(venv_test)` al inicio de la línea de comando*

#### **En Linux/Mac:**
```bash
source venv_test/bin/activate
```
*Deberías ver `(venv_test)` al inicio de la terminal*

---

### **Paso 4: Instalar las Dependencias**

Con el entorno virtual activado, ejecuta:

```bash
pip install -r requirements.txt
```

**Dependencias que se instalan:**
- `python-dotenv` - Para manejar variables de entorno
- `sqlalchemy` - Para conexiones a base de datos
- `psycopg2-binary` - Driver PostgreSQL
- `pandas` - Para manejo de datos

---

### **Paso 5: Configurar las Credenciales de Supabase**

Abre el archivo `.env` y completa tus credenciales de Supabase:

```env
DB_USER=tu_usuario_supabase
DB_PASSWORD=tu_contraseña
DB_HOST=tu_host_supabase
DB_PORT=6543
DB_NAME=postgres
```

> **⚠️ Importante:** No compartas este archivo con credenciales reales en público.

---

## ✅ Prueba de Conexión

Con el entorno virtual aún activado, ejecuta:

```bash
python test_conexion.py
```

**Resultado esperado:**
```
✅ Conexión exitosa
                    now
0 2026-05-18 14:30:45.123456
```

Si ves el mensaje `❌ Error de conexión`, revisa:
- Las credenciales en el archivo `.env`
- La conexión a internet
- El estado de tu base de datos Supabase

---

## 🔍 Hacer Consultas a la Base de Datos

### **Opción 1: En un Script Python**

Crea un archivo `consulta.py`:

```python
from conexion import engine
import pandas as pd

# Ejemplo: Consultar todos los registros
query = "SELECT * FROM tu_tabla LIMIT 10"
df = pd.read_sql(query, engine)

print(df)
```

Ejecuta:
```bash
python consulta.py
```

### **Opción 2: En Jupyter Notebook**

El archivo `query.ipynb` ya está disponible. Para usarlo:

```bash
jupyter notebook query.ipynb
```

Luego escribe tus consultas SQL dentro de las celdas:

```python
import pandas as pd
from conexion import engine

df = pd.read_sql("SELECT * FROM tu_tabla", engine)
df.head()
```

---

## 🛑 Desactivar el Entorno Virtual

Cuando termines de trabajar, desactiva el entorno virtual:

#### **En Windows:**
```bash
deactivate
```

#### **En Linux/Mac:**
```bash
deactivate
```

*El `(venv_test)` desaparecerá de tu terminal*

---

## 📁 Estructura del Proyecto

```
test_equipo/
├── conexion.py          # Conexión a Supabase
├── test_conexion.py     # Script de prueba
├── query.ipynb          # Notebook para consultas
├── requirements.txt     # Dependencias del proyecto
├── .env                 # Credenciales (NO subir a Git)
├── venv_test/           # Entorno virtual (NO subir a Git)
└── README.md            # Este archivo
```

---

## 🐛 Solución de Problemas

| Problema | Solución |
|----------|----------|
| `ModuleNotFoundError: No module named 'sqlalchemy'` | Asegúrate de activar el venv e instalar `pip install -r requirements.txt` |
| `Error: can't open file 'conexion.py'` | Verifica estar en la carpeta correcta del proyecto |
| `connection timeout` | Revisa la URL de Supabase y que la IP esté permitida |
| `authentication failed` | Comprueba usuario y contraseña en `.env` |

---

## 📝 Notas Importantes

- **Credenciales:** Nunca guardes credenciales reales en repositorios públicos
- **Entorno Virtual:** Siempre actívalo antes de ejecutar scripts
- **Requirements:** Si instalas nuevas librerías, actualiza `requirements.txt`

```bash
pip freeze > requirements.txt
```

---

## ✨ Resumen del Flujo de Trabajo

1. ✅ Clonar proyecto
2. ✅ Crear entorno virtual
3. ✅ Activar entorno virtual
4. ✅ Instalar dependencias (`requirements.txt`)
5. ✅ Configurar `.env`
6. ✅ Probar conexión (`test_conexion.py`)
7. ✅ Hacer consultas (scripts o Jupyter)
8. ✅ Desactivar entorno virtual

---

**¡Listo para trabajar con Supabase!** 🎉
