// src/pages/Login/Login.tsx

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AxiosError } from "axios";

import "./Login.css";
import { useAuth } from "../../context/AuthContext";
import { http } from "../../api/http";

const Login: React.FC = () => {
  const navigate = useNavigate();
  const { setAuthData } = useAuth();

  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      const resp = await http.post("/auth/login", { email, senha });
      const data = resp.data;

      if (!data.access_token) throw new Error("Token ausente na resposta.");

      setAuthData(data.access_token, data.role || null);

      if (data.role === "Administrador") {
        navigate("/admin");
      } else {
        navigate("/questionary");
      }
    } catch (err) {
      const axiosError = err as AxiosError;
      let msg = "E-mail ou senha incorretos.";

      if (axiosError.response) {
        const backendData = axiosError.response.data as any;
        if (backendData?.detail) msg = backendData.detail;
      } else if (axiosError.request) {
        msg = "Erro de conexão. Verifique se o servidor está ativo.";
      }

      setError(msg);
      setAuthData(null, null);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h1 className="login-title">
          <span className="login-word">Login - Usuário</span>
        </h1>

        <form onSubmit={handleLogin}>
          <label className="login-field">
            <span className="login-label">E-mail</span>
            <input
              type="email"
              className="login-input"
              placeholder="Digite seu e-mail"
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

export default Login;
