// src/pages/Login/AdminLogin.tsx

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

import "./Login.css"; // mesmo CSS do login de usuário
import { loginAdmin } from "../../api/auth";
import { useAuth } from "../../context/AuthContext";

const AdminLogin: React.FC = () => {
  const navigate = useNavigate();
  const { setAuthData } = useAuth();

  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      const response = await loginAdmin(email, senha);

      if (!response?.access_token) {
        throw new Error("Token ausente na resposta.");
      }

      // salva token + role no contexto
      setAuthData(response.access_token, response.role || "Administrador");

      navigate("/admin");
    } catch (err) {
      console.error("Erro de login (admin):", err);
      setError("Credenciais inválidas. Verifique e tente novamente.");
      setAuthData(null, null);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h1 className="login-title">
          <span className="login-word">Login  Administrador</span>
        </h1>

        <form onSubmit={handleSubmit}>
          <label className="login-field">
            <span className="login-label">E-mail</span>
            <input
              type="email"
              className="login-input"
              placeholder="Digite seu e-mail administrativo"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </label>

          <label className="login-field">
            <span className="login-label">Senha</span>
            <input
              type="password"
              className="login-input"
              placeholder="Digite sua senha"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              required
            />
          </label>

          {error && <p className="login-error">{error}</p>}

          <button type="submit" className="login-btn">
            Entrar
          </button>

          <button
            type="button"
            className="login-back"
            onClick={() => navigate(-1)}
          >
            ← Voltar
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;
