# backend/models/user.py

from sqlalchemy import Column, Integer, String, DateTime
from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import Optional

# Importa a mesma Base usada em wine.py (mantém o mesmo metadata)
from .wine import Base

# -------------------------------
# 1. SQLALCHEMY MODEL (DB)
# -------------------------------
class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    nome_usuario = Column(String, unique=True, nullable=False)
    email = Column(String, unique=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    cargo = Column(String, default="Cliente")  # Cliente ou Administrador

    # Campos para redefinição de senha
    reset_token = Column(String, nullable=True)
    reset_token_expira = Column(DateTime, nullable=True)

# -------------------------------
# 2. Pydantic MODELS (API)
# -------------------------------

class UserCreate(BaseModel):
    nome_usuario: str
    email: EmailStr
    senha: str


class UserLogin(BaseModel):
    email: EmailStr
    senha: str


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    role: str


class UserResponse(BaseModel):
    id: int
    nome_usuario: str
    email: EmailStr
    cargo: str

    model_config = {'from_attributes': True}


class PasswordResetRequest(BaseModel):
    email: EmailStr


class PasswordReset(BaseModel):
    token: str
    new_password: str
