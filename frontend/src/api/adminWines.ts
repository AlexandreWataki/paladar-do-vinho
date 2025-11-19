// src/api/adminWines.ts

import { http } from "./http";

// -------------------------
// LISTAR VINHOS
// -------------------------
export async function fetchWines() {
  const response = await http.get("/admin/vinhos", {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("access_token")}`,
    },
  });

  return response.data;
}

// -------------------------
// CRIAR VINHO
// -------------------------
export async function createWine(data: any) {
  const response = await http.post("/admin/vinhos", data, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("access_token")}`,
    },
  });

  return response.data;
}

// -------------------------
// ATUALIZAR VINHO
// -------------------------
export async function updateWine(id: number, data: any) {
  const response = await http.put(`/admin/vinhos/${id}`, data, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("access_token")}`,
    },
  });

  return response.data;
}

// -------------------------
// EXCLUIR VINHO
// -------------------------
export async function deleteWine(id: number) {
  const response = await http.delete(`/admin/vinhos/${id}`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("access_token")}`,
    },
  });

  return response.data;
}
