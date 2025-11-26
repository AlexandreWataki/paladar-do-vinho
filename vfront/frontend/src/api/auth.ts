// src/api/auth.ts
import { http } from './http';

export interface AuthTokenResponse {
  access_token: string;
  token_type: string;
}

export interface LoginPayload {
  email: string;
  senha: string; // conforme backend FastAPI
}

/**
 * Faz login (usuário ou administrador)
 */
export async function login(payload: LoginPayload) {
  return http<AuthTokenResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

/**
 * Logout: limpa o token local
 */
export function logout() {
  localStorage.removeItem('access_token');
}
