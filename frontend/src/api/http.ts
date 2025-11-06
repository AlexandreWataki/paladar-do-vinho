// src/api/http.ts
import axios from 'axios';

// ✅ Lê a base URL do .env do Vite (por ex: VITE_API_BASE_URL=http://127.0.0.1:8000)
const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';

// ✅ Cria instância configurada
const http = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ✅ Interceptador para adicionar token automaticamente
http.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ✅ Exporta para uso direto (http.get, http.post, etc.)
export { http };
