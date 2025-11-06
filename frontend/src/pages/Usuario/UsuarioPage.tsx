import React, { useEffect, useState } from "react";
import { fetchWines } from "../../api/wines";

const UsuarioPage: React.FC = () => {
  const [wines, setWines] = useState<any[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadWines = async () => {
      try {
        const data = await fetchWines();
        setWines(data);
      } catch (err: any) {
        console.error("Erro ao carregar vinhos:", err);
        setError("Não foi possível carregar os vinhos.");
      }
    };
    loadWines();
  }, []);

  return (
    <div>
      <h2>🍷 Vinhos Disponíveis</h2>
      {error && <p style={{ color: "red" }}>{error}</p>}

      {wines.length > 0 ? (
        <ul>
          {wines.map((wine) => (
            <li key={wine.id}>
              <strong>{wine.nome}</strong> — {wine.tipo} ({wine.uva})
            </li>
          ))}
        </ul>
      ) : (
        !error && <p>Carregando vinhos...</p>
      )}
    </div>
  );
};

export default UsuarioPage;
