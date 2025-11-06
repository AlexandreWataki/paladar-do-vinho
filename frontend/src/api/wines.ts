// src/api/wines.ts
const API_BASE_URL = "http://127.0.0.1:8000";

function getAuthHeaders() {
  const token = localStorage.getItem("access_token");
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

// ✅ Busca lista de vinhos (admin ou cliente)
export async function fetchWines() {
  const role = localStorage.getItem("role");

  // Escolhe rota conforme o cargo
  const endpoint =
    role === "Administrador"
      ? `${API_BASE_URL}/admin/vinhos/`
      : `${API_BASE_URL}/vinhos/`;

  const response = await fetch(endpoint, {
    method: "GET",
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("Erro ao carregar vinhos:", errorText);
    throw new Error("Erro ao carregar lista de vinhos");
  }

  return response.json();
}

// ✅ Criação de novo vinho (apenas admin)
export async function createWine(data: any) {
  const role = localStorage.getItem("role");
  if (role !== "Administrador") {
    throw new Error("Acesso negado: apenas administradores podem criar vinhos");
  }

  const response = await fetch(`${API_BASE_URL}/admin/vinhos/`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("Erro ao criar vinho:", errorText);
    throw new Error("Erro ao criar vinho");
  }

  return response.json();
}
