# ---------- IMAGEM BASE ----------
FROM python:3.11-slim

# ---------- DIRETÓRIO DE TRABALHO ----------
WORKDIR /app

# ---------- COPIA OS ARQUIVOS ----------
COPY . /app

# ---------- INSTALA DEPENDÊNCIAS ----------
RUN pip install --no-cache-dir -r requirements.txt

# ---------- EXPOE A PORTA ----------
EXPOSE 8000

# ---------- COMANDO PARA RODAR O FASTAPI ----------
CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]
