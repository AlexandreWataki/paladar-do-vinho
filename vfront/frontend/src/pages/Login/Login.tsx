import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Login.css";

const API_LOGIN_URL = "http://127.0.0.1:8000/auth/login";

const Login: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      const resp = await fetch(API_LOGIN_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, senha }),
      });

      const data = await resp.json();

      if (!resp.ok) throw new Error(data?.detail || "Falha no login");

      localStorage.setItem("access_token", data.access_token);
      localStorage.setItem("role", data.role);

      navigate(data.role === "Administrador" ? "/admin" : "/questionary");
    } catch (err: any) {
      console.error("Erro de login:", err?.message || err);
      setError("E-mail ou senha incorretos.");
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
