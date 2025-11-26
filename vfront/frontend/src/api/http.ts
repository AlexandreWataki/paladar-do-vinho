// src/api/http.ts
const BASE_URL = import.meta.env.VITE_API_BASE_URL as string;

function getAuthToken() {
  return localStorage.getItem('access_token') || '';
}

export async function http<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  // Garante que headers será sempre um objeto simples
  const baseHeaders: Record<string, string> = {
    'Content-Type': 'application/json',    
  };

  // Se options.headers for um objeto, faz o merge
  if (options.headers && typeof options.headers === 'object' && !Array.isArray(options.headers)) {
    Object.assign(baseHeaders, options.headers as Record<string, string>);
  }

  const token = getAuthToken();
  if (token) baseHeaders['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${BASE_URL}${path}`, { ...options, headers: baseHeaders });
  const isJSON = res.headers.get('content-type')?.includes('application/json');
  const body = isJSON ? await res.json() : (undefined as unknown as T);

  if (!res.ok) {
    const message = (body as any)?.detail || res.statusText;
    throw new Error(message);
  }

  return body as T;
}
