# backend/models/wine.py

from sqlalchemy import Column, Integer, String, Float
from sqlalchemy.ext.declarative import declarative_base
from pydantic import BaseModel, Field
from typing import Optional

# -------------------------------
# 1️⃣ SQLALCHEMY MODELS (DB)
# -------------------------------
Base = declarative_base()

class Wine(Base):
    __tablename__ = "vinhos"

    id = Column(Integer, primary_key=True, index=True)
    titulo = Column(String, unique=True, nullable=False)
    tipo = Column(String, nullable=False)
    pais = Column(String, nullable=False)
    uva = Column(String, nullable=False)
    preco_medio = Column(Float, nullable=False)
    rotulo_url = Column(String, nullable=True)
    descricao = Column(String, nullable=True)

    # Campos usados pelo algoritmo
    nivel_docura = Column(Integer, nullable=False)
    nivel_tanino = Column(Integer, nullable=True)
    nivel_acidez = Column(Integer, nullable=True)
    nivel_frutado = Column(Integer, nullable=True)
    ocasiao = Column(Integer, nullable=True)
    harmonizacao = Column(String, nullable=True)


# -------------------------------
# 2️⃣ Pydantic MODELS (API)
# -------------------------------

# Modelo para as respostas do questionário (input do cliente)
class WineQuestionnaire(BaseModel):
    """Respostas fornecidas pelo usuário no questionário de preferências."""

    preferencia_vinho: str = Field(..., description="Tipo de vinho preferido (tinto, branco, rosé, espumante)")
    ocasiao: int = Field(..., ge=1, le=3, description="Ocasião típica (1=refeições, 2=eventos sociais, 3=momentos românticos)")
    harmonizacao: Optional[str] = Field(None, description="Tipo de prato que costuma acompanhar o vinho")
    nivel_docura: int = Field(..., ge=1, le=5, description="Preferência de doçura (1=seco, 5=doce)")
    nivel_tanino: Optional[int] = Field(None, ge=1, le=5, description="Nível de tanino preferido")
    nivel_acidez: Optional[int] = Field(None, ge=1, le=5, description="Preferência de acidez")
    nivel_frutado: Optional[int] = Field(None, ge=1, le=5, description="Intensidade de aromas frutados")


# Modelo de recomendação de vinho (output da API)
class WineRecommendation(BaseModel):
    """Saída do algoritmo de recomendação"""
    id: int
    titulo: str
    tipo: str
    pais: Optional[str] = None
    uva: Optional[str] = None
    preco_medio: Optional[float] = None
    rotulo_url: Optional[str] = None
    descricao: Optional[str] = None
    harmonizacao: Optional[str] = None
    compatibilidade: Optional[float] = None
    similarity: Optional[float] = None  # valor calculado

    model_config = {'from_attributes': True}


# Modelo para criação/edição de vinho (input do admin)
class WineCreate(BaseModel):
    titulo: str
    pais: str
    uva: str
    preco_medio: float
    rotulo_url: Optional[str] = None
    descricao: Optional[str] = None
    tipo: str
    nivel_docura: int = Field(..., ge=1, le=5)
    nivel_tanino: int = Field(..., ge=1, le=5)
    nivel_acidez: int = Field(..., ge=1, le=5)
    nivel_frutado: int = Field(..., ge=1, le=5)
    ocasiao: int = Field(..., ge=1, le=3)
    harmonizacao: str

    model_config = {'from_attributes': True}


# -------------------------------
# 3️⃣ USER / AUTH MODELS
# -------------------------------
class UserCreate(BaseModel):
    nome_usuario: str
    email: str
    senha: str

class UserLogin(BaseModel):
    email: str
    senha: str

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"

class UserResponse(BaseModel):
    id: int
    email: str
    cargo: str

    model_config = {'from_attributes': True}

class PasswordResetRequest(BaseModel):
    email: str

class PasswordReset(BaseModel):
    token: str
    new_password: str
