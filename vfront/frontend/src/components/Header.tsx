import React from "react";
import { Link } from "react-router-dom";
import frase2 from "../assets/frase2.png"; // ajuste o caminho se necessário

const Header: React.FC = () => {
  return (
    <header className="app-header">
      {/* Logo que leva para a página inicial */}
      <Link to="/" className="header-brand">
        <img src={frase2} alt="Paladar de Vinho" className="header-logo" />
      </Link>

      {/* Botão único de Início */}
      <nav className="header-nav">
        <Link to="/" className="btn-neon header-btn">
          Início
        </Link>
      </nav>
    </header>
  );
};

export default Header;
