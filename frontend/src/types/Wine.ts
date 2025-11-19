// src/types/Wine.ts
export interface WineRecommendation {
  id: number;
  titulo: string;
  tipo: string;
  pais: string;
  uva: string;
  preco_medio: number;

  rotulo_url?: string | null;
  descricao?: string | null;

  nivel_docura?: number;
  nivel_tanino?: number;
  nivel_acidez?: number;
  nivel_frutado?: number;
  ocasiao?: number;

  harmonizacao?: string | null;

  user_pairing?: string | null;

  compatibilidade?: number;
}
