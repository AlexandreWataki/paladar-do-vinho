// src/api/adminWines.ts

// ✅ CORREÇÃO: Usa o mesmo host do backend (127.0.0.1) e rota base consistente
const API_BASE_URL = 'http://127.0.0.1:8000/admin/vinhos';

// Função auxiliar para pegar o token do localStorage e montar o header
function getAuthHeaders() {
  const token = localStorage.getItem('access_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

// 🔹 LISTAR VINHOS
export async function fetchWines() {
  const response = await fetch(`${API_BASE_URL}/`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Erro detalhado ao carregar vinhos:', errorText);
    throw new Error('Erro ao carregar lista de vinhos');
  }

  return response.json();
}

// 🔹 CRIAR VINHO
export async function createWine(data: any) {
  const response = await fetch(`${API_BASE_URL}/`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Erro ao criar vinho:', errorText);
    throw new Error('Erro ao criar vinho');
  }

  return response.json();
}

// 🔹 ATUALIZAR VINHO
export async function updateWine(id: number, data: any) {
  // ⚠️ Adicionada barra antes do ID
  const response = await fetch(`${API_BASE_URL}/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Erro ao atualizar vinho:', errorText);
    throw new Error('Erro ao atualizar vinho');
  }

  return response.json();
}

// 🔹 EXCLUIR VINHO
export async function deleteWine(id: number) {
  // ⚠️ Adicionada barra antes do ID
  const response = await fetch(`${API_BASE_URL}/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Erro ao excluir vinho:', errorText);
    throw new Error('Erro ao excluir vinho');
  }

  return response.json();
}
