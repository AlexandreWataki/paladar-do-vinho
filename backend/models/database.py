from sqlalchemy import create_engine, Column, Integer, String, Text, Float, DateTime
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from datetime import datetime
import os

# -------------------------------------------------------------
# Caminho absoluto do banco de dados
# -------------------------------------------------------------
BASE_DIR = r"C:\Users\tarso\paladar-vinho"
DB_PATH = os.path.join(BASE_DIR, "vinho_database.db")

# -------------------------------------------------------------
# Criação do diretório e do banco de dados, se não existirem
# -------------------------------------------------------------
if not os.path.exists(BASE_DIR):
    os.makedirs(BASE_DIR)
    print(f"[INFO] Diretório criado: {BASE_DIR}")

if not os.path.exists(DB_PATH):
    open(DB_PATH, 'a').close()
    print(f"[INFO] Banco criado: {DB_PATH}")

# -------------------------------------------------------------
# Configuração do banco de dados SQLite
# -------------------------------------------------------------
SQLALCHEMY_DATABASE_URL = f"sqlite:///{DB_PATH}"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False}
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

print(f"[DEBUG] Caminho do banco ativo: {DB_PATH}")

# -------------------------------------------------------------
# Função para obter a sessão do banco de dados (dependência do FastAPI)
# -------------------------------------------------------------
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# -------------------------------------------------------------
# MODELO DA TABELA DE VINHOS
# -------------------------------------------------------------
class Wine(Base):
    __tablename__ = "vinhos"
    id = Column(Integer, primary_key=True, index=True)
    titulo = Column(String(255), index=True)
    pais = Column(String(100))
    uva = Column(String(100))
    preco_medio = Column(Float)
    rotulo_url = Column(Text)
    descricao = Column(Text)

    tipo = Column(String(50))
    nivel_docura = Column(Integer)
    nivel_tanino = Column(Integer)
    nivel_acidez = Column(Integer)
    nivel_frutado = Column(Integer)
    ocasiao = Column(Integer)
    harmonizacao = Column(Text)

# -------------------------------------------------------------
# MODELO DA TABELA DE USUÁRIOS
# -------------------------------------------------------------
class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True)
    hashed_password = Column(String(255))
    nome_usuario = Column(String(100), unique=True)
    cargo = Column(String(50), default="Cliente")
    reset_token = Column(String(255), nullable=True)
    reset_token_expira = Column(DateTime, nullable=True)

# -------------------------------------------------------------
# FUNÇÃO DE CRIAÇÃO DO BANCO E TABELAS
# -------------------------------------------------------------
def create_db_and_tables():
    """Cria o banco de dados e as tabelas (Wine e User) se elas não existirem."""
    print("\n[INFO] Verificando e criando tabelas no banco de dados...")
    try:
        Base.metadata.create_all(bind=engine)
        print("[INFO] Tabelas criadas ou já existentes.")
    except Exception as e:
        print(f"[ERRO] Falha ao criar tabelas: {e}")

# -------------------------------------------------------------
# EXECUÇÃO DIRETA DO ARQUIVO
# -------------------------------------------------------------
if __name__ == '__main__':
    create_db_and_tables()
    print("[INFO] Inicialização concluída com sucesso.")
