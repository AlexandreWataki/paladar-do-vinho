// src/components/Header.tsx
import React from "react";
import { Link } from "react-router-dom";

const Header: React.FC = () => {
  return (
    <header className="app-header">
      {/* Esquerda: texto Paladar de Vinho com efeito fumaça / marca d'água */}
      <Link to="/" className="header-brand">
        <h1 className="header-title smoke-text">
          Paladar de Vinho
        </h1>
      </Link>

      {/* Direita: botões no padrão NEON */}
      <nav className="header-nav">
        <Link to="/login" className="header-btn neon-btn">
          <span className="neon-text">Login</span>
        </Link>

        <Link to="/admin-login" className="header-btn neon-btn">
          <span className="neon-text">Administrador</span>
        </Link>
      </nav>
    </header>
  );
};

export default Header;
