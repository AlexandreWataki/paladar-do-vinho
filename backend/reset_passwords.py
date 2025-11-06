from backend.models.database import SessionLocal
from backend.models.user import User
from backend.security import get_password_hash

def reset_passwords():
    db = SessionLocal()
    try:
        users = db.query(User).all()
        for user in users:
            if user.email == "admin@vinho.com":
                user.hashed_password = get_password_hash("admin123")
                print("✅ Senha do admin redefinida para: admin123")
            elif user.email == "usuario@teste.com":
                user.hashed_password = get_password_hash("usuario123")
                print("✅ Senha do usuário redefinida para: usuario123")
        db.commit()
    finally:
        db.close()

if __name__ == "__main__":
    reset_passwords()
