// src/api/auth.ts
// Cliente de API para rotas de autenticação (login, logout, etc.)

import { http } from './http';

export interface AuthTokenResponse {
  access_token: string;
  token_type: string;
  role: string; // 👈 incluí o cargo (Administrador ou Cliente)
}

export interface LoginPayload {
  email: string;
  senha: string; // conforme backend FastAPI
}

/**
 * Faz login (usuário ou administrador)
 * O backend espera o corpo: { email, senha }
 */
export async function login(payload: LoginPayload): Promise<AuthTokenResponse> {
  const response = await http.post<AuthTokenResponse>('/auth/login', payload); // ✅ usa axios com 'data' implícito
  return response.data;
}

/**
 * Mantém compatibilidade com telas que importam loginAdmin
 */
export async function loginAdmin(email: string, senha: string): Promise<AuthTokenResponse> {
  return login({ email, senha });
}

/**
 * Logout: limpa o token local
 */
export function logout() {
  localStorage.removeItem('access_token');
  localStorage.removeItem('user_role');
}
