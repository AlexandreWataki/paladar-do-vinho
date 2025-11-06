import os
from datetime import datetime, timedelta
from typing import Optional
from jose import jwt, JWTError
from passlib.context import CryptContext
from dotenv import load_dotenv
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from backend.models.database import get_db
from backend.models.user import User

# -------------------------------------------------------------
# CONFIGURAÇÕES DE SEGURANÇA
# -------------------------------------------------------------
SECRET_KEY = "sua_chave_secreta_muito_longa_e_aleatoria_aqui"  # troque por uma chave segura!
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")

# -------------------------------------------------------------
# FUNÇÕES DE HASH DE SENHA
# -------------------------------------------------------------
def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verifica se a senha simples corresponde ao hash."""
    return pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password: str) -> str:
    """Cria o hash bcrypt da senha."""
    return pwd_context.hash(password)


# -------------------------------------------------------------
# CRIAÇÃO DE TOKEN JWT
# -------------------------------------------------------------
def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    """Cria o Token JWT com tempo de expiração."""
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


# -------------------------------------------------------------
# DECODIFICAR TOKEN E BUSCAR USUÁRIO ATUAL
# -------------------------------------------------------------
def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)) -> User:
    """Retorna o usuário autenticado a partir do token JWT."""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Token inválido ou expirado",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email = payload.get("sub")
        # role = payload.get("role") # Não precisamos ler expliciamente
        if email is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception

    user = db.query(User).filter(User.email == email).first()
    if user is None:
        raise HTTPException(status_code=404, detail="Usuário não encontrado")

    # Atualiza o papel (role/cargo) para manter compatibilidade
    # user.role = role or getattr(user, "cargo", "Cliente")
    print(f"[AUTH] 🔑 Usuário autenticado: {user.email} | Cargo: {user.cargo}")
    return user

def get_current_admin(current_user: User = Depends(get_current_user)):
    """
    Verifica se o usuário logado tem o cargo 'Administrador'.
    Se não tiver, lança um erro 403 Forbidden.
    """
    if current_user.cargo != "Administrador":
        # Erro 403 Forbidden (Proibido) é o código correto,
        # pois o usuário está autenticado, mas não tem permissão
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Acesso negado. Apenas Administradores podem acessar esta rota.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return current_user


# -------------------------------------------------------------
# RESTRIÇÃO PARA ADMINISTRADOR
# -------------------------------------------------------------
def verificar_admin(current_user: User = Depends(get_current_user)):
    """
    Garante que o usuário autenticado é um administrador.
    Aceita tanto 'Administrador' (do banco) quanto 'admin' (do token JWT).
    """
    cargo_atual = getattr(current_user, "cargo", "Cliente") #or getattr(current_user, "role", None)

    if cargo_atual not in ["Administrador", "admin"]:
        print(f"[AUTH] 🚫 Acesso negado | Cargo: {cargo_atual} | Email: {current_user.email}")
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Acesso restrito a administradores"
        )

    print(f"[AUTH] ✅ Acesso ADMIN liberado: {current_user.email} | Cargo: {cargo_atual}")
    return current_user
