from sqlalchemy import Column, Integer, String, Float, Text
from backend.models.database import Base
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
    descricao = Column(String, nullable=True) # Pode ser Text em alguns bancos, String funciona no SQLite

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

# Modelo para leitura simples (listagem)
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

# Modelo de criação/edição para o admin
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
    ocasiao: int = Field(..., ge=1, le=5)
    harmonizacao: Optional[str] = None

    model_config = {'from_attributes': True}


# ✨ CORREÇÃO PRINCIPAL AQUI ✨
class WineQuestionnaire(BaseModel):
    """Modelo das respostas do questionário do usuário."""
    
    # Adicionamos este campo para o Backend aceitar o que o Frontend envia
    preferencia_vinho: Optional[str] = Field("", description="Tipo de vinho preferido (ex: Tinto, Rosé)")
    
    # Mantemos este campo caso exista algum código legado usando
    tipo: Optional[str] = Field("", description="Campo alternativo para tipo")

    nivel_docura: int = Field(..., ge=1, le=5, description="Nível de doçura (1 a 5)")
    nivel_tanino: int = Field(..., ge=1, le=5, description="Nível de tanino (1 a 5)")
    nivel_acidez: int = Field(..., ge=1, le=5, description="Nível de acidez (1 a 5)")
    nivel_frutado: int = Field(..., ge=1, le=5, description="Nível de frutado (1 a 5)")
    ocasiao: int = Field(..., ge=1, le=5, description="Código numérico da ocasião")
    harmonizacao: Optional[str] = Field(None, description="Prato ou tipo de harmonização")


# ✨ CORREÇÃO SECUNDÁRIA AQUI ✨
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

    harmonizacao: Optional[str] = Field(None, description="Texto de harmonização do banco de dados")
    
    score: float = Field(..., description="Similaridade da recomendação")
    user_occasion: Optional[str] = Field(None, description="Descrição textual da ocasião")
    user_pairing: Optional[str] = Field(None, description="Harmonização sugerida")
    
    # Adicionamos o campo de aviso para exibir a mensagem da troca Carne/Tinto
    aviso_regra: Optional[str] = Field(None, description="Aviso caso a regra de negócio tenha alterado o tipo")

    model_config = {'from_attributes': True}