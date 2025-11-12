# Dockerfile

# Usa uma imagem base Python slim (mais leve)
FROM python:3.11-slim

# Define o diretório de trabalho dentro do container
WORKDIR /app

# Copia as dependências e as instala
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copia o restante do código do backend.
# O .dockerignore garante que o frontend e o banco de dados sejam excluídos.
COPY . /app

# Expõe a porta que o FastAPI usa (8000)
EXPOSE 8000

# Comando de inicialização: 
# Usaremos Gunicorn + Uvicorn para produção.
CMD ["gunicorn", "-w", "4", "-k", "uvicorn.workers.UvicornWorker", "backend.app:app", "--bind", "0.0.0.0:8000"]