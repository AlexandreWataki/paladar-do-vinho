const API_BASE_URL = "http://127.0.0.1:8000";

/**
 * Monta os cabeçalhos HTTP necessários para as requisições,
 * incluindo o Content-Type e o token de autorização, se disponível.
 */
function getAuthHeaders( ) {
  const token = localStorage.getItem("access_token");
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

/**
 * Busca a lista de vinhos. A rota acessada depende do cargo do usuário
 * (cliente ou administrador) armazenado no localStorage.
 */
export async function fetchWines() {
  const role = localStorage.getItem("role");

  // Escolhe o endpoint correto com base no cargo do usuário
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

/**
 * Cria um novo vinho no banco de dados.
 * Apenas usuários com o cargo "Administrador" podem realizar esta ação.
 * @param data - Os dados do vinho a ser criado.
 */
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

/**
 * Envia os dados do questionário para a API e retorna uma lista de vinhos recomendados.
 * Requer autenticação.
 * @param data - Os dados do questionário preenchido pelo usuário.
 */
export async function getRecommendations(data: any) {
  const response = await fetch(`${API_BASE_URL}/recommendations/`, {
    method: "POST",
    // ✨ CORREÇÃO APLICADA AQUI: Usa a função que inclui o token de autenticação.
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorText = await response.text();
    // Adicionado o status do erro para facilitar a depuração futura.
    console.error(`Erro ${response.status} ao buscar recomendações:`, errorText);
    throw new Error(
      "Erro ao buscar recomendações. Verifique o servidor e tente novamente."
    );
  }

  return response.json();
}
