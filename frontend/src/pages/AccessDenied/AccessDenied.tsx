// src/pages/AccessDenied/AccessDenied.tsx
import React from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/base.css";
import "./AccessDenied.css";

const AccessDenied: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="page-container access-denied-page">
      <div className="access-card">
        <div className="access-icon">🚫</div>

        <h1 className="access-title">Acesso Negado</h1>

        <p className="access-text">
          Esta área é restrita.<br />
          Seu perfil não possui permissão para acesso.
        </p>

        <div className="access-actions">
          <button
            className="access-btn access-btn-primary"
            onClick={() => navigate("/login")}
          >
            Ir para Login
          </button>

          <button
            className="access-btn access-btn-secondary"
            onClick={() => navigate(-1)}
          >
            Voltar
          </button>
        </div>
      </div>
    </div>
  );
};

export default AccessDenied;
