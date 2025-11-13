# backend/models/database.py

from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os

# -------------------------------------------------------------
# Caminho absoluto do banco de dados
# -------------------------------------------------------------
BASE_DIR = r"C:\Users\tarso\paladar-vinho"
DB_PATH = os.path.join(BASE_DIR, "vinho_database.db")

if not os.path.exists(BASE_DIR):
    os.makedirs(BASE_DIR)

if not os.path.exists(DB_PATH):
    open(DB_PATH, 'a').close()

SQLALCHEMY_DATABASE_URL = f"sqlite:///{DB_PATH}"

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
