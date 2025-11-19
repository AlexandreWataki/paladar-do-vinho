// src/pages/AccessDenied/AccessDenied.tsx
import React from "react";
import { useNavigate } from "react-router-dom";

const AccessDenied: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "100vh",
        textAlign: "center",
        color: "#4a148c",
      }}
    >
      <h1 style={{ fontSize: "2rem", marginBottom: "10px" }}>🚫 Acesso Negado</h1>
      <p style={{ marginBottom: "24px" }}>
        Esta área é restrita. Seu perfil não possui permissão para acesso.
      </p>

      <div style={{ display: "flex", gap: "12px" }}>
        <button
          onClick={() => navigate("/login")}
          style={{
            backgroundColor: "#6a1b9a",
            color: "#fff",
            border: "none",
            borderRadius: "6px",
            padding: "8px 16px",
            cursor: "pointer",
          }}
        >
          Ir para Login
        </button>
        <button
          onClick={() => navigate(-1)}
          style={{
            backgroundColor: "#f9a825",
            color: "#fff",
            border: "none",
            borderRadius: "6px",
            padding: "8px 16px",
            cursor: "pointer",
          }}
        >
          Voltar
        </button>
      </div>
    </div>
  );
};

export default AccessDenied;
