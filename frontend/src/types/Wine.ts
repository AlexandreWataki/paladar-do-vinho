// src/types/Wine.ts
export interface WineRecommendation {
  id?: number;
  nome?: string;             // opcional, alguns lugares usam 'nome'
  titulo?: string;           // usado no Results.tsx
  tipo?: string;
  pais?: string;
  uva?: string;
  teor_alcoolico?: string | number;
  harmonizacao?: string;
  preco_medio?: number;
  rotulo_url?: string;
  descricao?: string;
  similarity?: number;
  loja_url?: string;
}
