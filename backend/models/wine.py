# backend/models/wine.py

from sqlalchemy import Column, Integer, String, Float
from backend.models.database import Base # Assumindo que a Base está definida em database.py
from pydantic import BaseModel, Field
from typing import Optional

# -------------------------------------------------------------
# 1️⃣ SQLALCHEMY MODEL (Tabela "vinhos")
# -------------------------------------------------------------
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

    # Campos usados pelo algoritmo de recomendação
    nivel_docura = Column(Integer, nullable=False)
    nivel_tanino = Column(Integer, nullable=False)
    nivel_acidez = Column(Integer, nullable=False)
    nivel_frutado = Column(Integer, nullable=False)
    ocasiao = Column(Integer, nullable=False)  # ID numérico (1, 2, 3)
    harmonizacao = Column(String, nullable=True)  # Texto descritivo


# -------------------------------------------------------------
# 2️⃣ Pydantic MODELS (API)
# -------------------------------------------------------------
class WineRead(BaseModel):
    id: int
    titulo: str
    tipo: str
    pais: str
    uva: str
    preco_medio: float
    rotulo_url: Optional[str] = None
    descricao: Optional[str] = None
    harmonizacao: Optional[str] = None
    nivel_docura: int
    nivel_tanino: int
    nivel_acidez: int
    nivel_frutado: int
    ocasiao: int

    model_config = {'from_attributes': True}

# 🚨 CLASSE FALTANTE ADICIONADA: Modelo de criação/edição para o admin
class WineCreate(BaseModel):
    """Modelo de dados de entrada para criação ou edição de um vinho (Admin)."""
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
    ocasiao: int = Field(..., ge=1, le=5)
    harmonizacao: Optional[str] = None

    model_config = {'from_attributes': True}


class WineQuestionnaire(BaseModel):
    """Modelo das respostas do questionário do usuário."""
    nivel_docura: int = Field(..., ge=1, le=5, description="Nível de doçura (1 a 5)")
    nivel_tanino: int = Field(..., ge=1, le=5, description="Nível de tanino (1 a 5)")
    nivel_acidez: int = Field(..., ge=1, le=5, description="Nível de acidez (1 a 5)")
    nivel_frutado: int = Field(..., ge=1, le=5, description="Nível de frutado (1 a 5)")
    ocasiao: int = Field(..., ge=1, le=5, description="Código numérico da ocasião")
    harmonizacao: Optional[str] = Field(None, description="Prato ou tipo de harmonização")


class WineRecommendation(BaseModel):
    """Modelo de saída das recomendações."""
    id: int
    titulo: str
    tipo: str
    pais: str
    uva: str
    preco_medio: float
    rotulo_url: Optional[str] = None
    descricao: Optional[str] = None
    nivel_docura: int
    nivel_tanino: int
    nivel_acidez: int
    nivel_frutado: int
    score: float = Field(..., description="Similaridade da recomendação")
    user_occasion: Optional[str] = Field(None, description="Descrição textual da ocasião")
    user_pairing: Optional[str] = Field(None, description="Harmonização sugerida")

    model_config = {'from_attributes': True}