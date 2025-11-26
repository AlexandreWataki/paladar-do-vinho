# backend/models/database.py

from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os

# -------------------------------------------------------------
# Caminho do banco de dados
# -------------------------------------------------------------
# 1. Descobre onde ESTE arquivo (database.py) está
# Ex: .../paladar-vinho/backend/models
CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))

# 2. Sobe dois níveis para chegar à raiz do projeto (paladar-vinho)
# backend/models -> backend -> paladar-vinho
ROOT_DIR = os.path.abspath(os.path.join(CURRENT_DIR, "..", ".."))

# 3. Define o nome do arquivo. 
DB_NAME = "vinho_database.db" 

DB_PATH = os.path.join(ROOT_DIR, DB_NAME)

db_path_fixed = DB_PATH.replace("\\", "/")

# URL de conexão para o SQLite
SQLALCHEMY_DATABASE_URL = f"sqlite:///{db_path_fixed}"

# -------------------------------------------------------------
# Debug para saberes exatamente onde ele está a ir buscar o banco
print(f"🚀 [DATABASE] A usar banco de dados em: {DB_PATH}")
# -------------------------------------------------------------

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False}
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

print(f"[DEBUG] Caminho do banco ativo: {DB_PATH}")

# Dependência para FastAPI
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
