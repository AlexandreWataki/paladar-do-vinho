# backend/routes/auth_routes.py

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
import secrets

from backend.models.user import (
    User,
    UserCreate,
    UserLogin,
    Token,
    UserResponse,
    PasswordResetRequest,
    PasswordReset,  # ✅ corrigido o nome da classe
)
from backend.models.database import get_db
from backend.security import (
    get_password_hash,
    verify_password,
    create_access_token,
    get_current_user,
)

router = APIRouter(prefix="/auth", tags=["Autenticação"])


# ---------------------------------------------------------
# 1️⃣ REGISTRO DE USUÁRIO
# ---------------------------------------------------------
@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def register_user(user: UserCreate, db: Session = Depends(get_db)):
    """
    Registra um novo usuário com cargo padrão = 'Cliente'.
    """
    db_user = db.query(User).filter(
        (User.email == user.email) | (User.nome_usuario == user.nome_usuario)
    ).first()

    if db_user:
        raise HTTPException(status_code=400, detail="E-mail ou nome de usuário já registrado.")

    hashed_password = get_password_hash(user.senha)
    new_user = User(
        nome_usuario=user.nome_usuario,
        email=user.email,
        hashed_password=hashed_password,
        cargo="Cliente"
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    print(f"[AUTH] 👤 Novo usuário criado: {new_user.email} | Cargo: {new_user.cargo}")
    return new_user


# ---------------------------------------------------------
# 2️⃣ LOGIN (gera token JWT com cargo)
# ---------------------------------------------------------
@router.post("/login", response_model=Token)
def login_for_access_token(user_data: UserLogin, db: Session = Depends(get_db)):
    """
    Faz login e retorna um token JWT com o cargo do usuário (Administrador ou Cliente).
    """
    user = db.query(User).filter(User.email == user_data.email).first()

    if not user or not verify_password(user_data.senha, user.hashed_password):
        raise HTTPException(status_code=401, detail="Credenciais inválidas")

    access_token = create_access_token(
        data={"sub": user.email, "role": user.cargo},  # ✅ usa 'cargo' (compatível com seu modelo)
        expires_delta=timedelta(minutes=60)
    )

    print(f"[AUTH] ✅ Login bem-sucedido: {user.email} | Cargo: {user.cargo}")
    return {
    "access_token": access_token,
    "token_type": "bearer",
    "role": user.cargo  # 👈 adiciona o cargo (Administrador ou Cliente)
    }


# ---------------------------------------------------------
# 3️⃣ ESQUECI MINHA SENHA
# ---------------------------------------------------------
@router.post("/password/forgot", status_code=status.HTTP_200_OK)
def forgot_password(request: PasswordResetRequest, db: Session = Depends(get_db)):
    """
    Gera um token temporário de redefinição de senha e o imprime no console (simulação de envio por e-mail).
    """
    user = db.query(User).filter(User.email == request.email).first()

    if user:
        reset_token = secrets.token_urlsafe(32)
        expiry_time = datetime.utcnow() + timedelta(hours=1)
        user.reset_token = reset_token
        user.reset_token_expira = expiry_time
        db.commit()
        print(f"[AUTH] 🔑 Token de reset gerado para {user.email}: {reset_token}")

    return {"message": "Se o e-mail estiver registrado, um link de redefinição foi enviado."}


# ---------------------------------------------------------
# 4️⃣ REDEFINIÇÃO DE SENHA
# ---------------------------------------------------------
@router.post("/password/reset", status_code=status.HTTP_200_OK)
def reset_password(reset_data: PasswordReset, db: Session = Depends(get_db)):
    """
    Redefine a senha do usuário com base no token gerado anteriormente.
    """
    user = db.query(User).filter(User.reset_token == reset_data.token).first()

    if not user or user.reset_token_expira < datetime.utcnow():
        raise HTTPException(status_code=400, detail="Token inválido ou expirado")

    user.hashed_password = get_password_hash(reset_data.new_password)
    user.reset_token = None
    user.reset_token_expira = None
    db.commit()

    print(f"[AUTH] 🔄 Senha redefinida com sucesso para {user.email}")
    return {"message": "Senha redefinida com sucesso."}


# ---------------------------------------------------------
# 5️⃣ USUÁRIO LOGADO (verifica token)
# ---------------------------------------------------------
@router.get("/me", response_model=UserResponse)
def read_users_me(current_user: User = Depends(get_current_user)):
    """
    Retorna as informações do usuário autenticado (decodificadas do token JWT).
    """
    return current_user
