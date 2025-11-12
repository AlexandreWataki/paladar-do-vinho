// src/pages/Login.tsx

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const API_LOGIN_URL = "http://127.0.0.1:8000/auth/login";

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
      const resp = await fetch(API_LOGIN_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, senha }),
      });

      if (!resp.ok) {
        const text = await resp.text();
        console.warn("⚠️ Erro no backend:", text);
        let msg = "E-mail ou senha incorretos.";
        try {
          const data = JSON.parse(text);
          if (data.detail) msg = data.detail;
        } catch {}
        setAuthData(null, null);
        throw new Error(msg);
      }

      const data = await resp.json();
      console.log("🎯 Resposta do backend:", data);

      if (!data.access_token) throw new Error("Token ausente na resposta.");

      if (data.role) {
        setAuthData(data.access_token, data.role);
        console.log("💾 Cargo salvo no Contexto:", data.role);
      } else {
        setAuthData(data.access_token, null);
        console.warn("⚠️ Nenhum campo 'role' recebido do backend.");
      }

      if (data.role === "Administrador") {
        navigate("/admin");
      } else {
        navigate("/questionary");
      }
    } catch (err: any) {
      console.error("Erro de login:", err?.message || err);
      setError(err?.message || "E-mail ou senha incorretos.");
      setAuthData(null, null);
    }
  };

  return (
    <div
      style={{
        display: "flex",
        minHeight: "70vh",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          width: 380,
          background: "#fff",
          borderRadius: 12,
          boxShadow: "0 6px 18px rgba(0,0,0,0.08)",
          padding: 24,
        }}
      >
        <h1
          style={{
            fontSize: 22,
            fontWeight: 700,
            marginBottom: 16,
            textAlign: "center",
          }}
        >
          Login • Paladar de Vinho 🍷
        </h1>

        <form onSubmit={handleLogin}>
          <label style={{ display: "block", marginBottom: 10 }}>
            <span style={{ display: "block", marginBottom: 6 }}>E-mail</span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{
                width: "100%",
                padding: "10px 12px",
                border: "1px solid #ddd",
                borderRadius: 8,
              }}
            />
          </label>

          <label style={{ display: "block", marginBottom: 12 }}>
            <span style={{ display: "block", marginBottom: 6 }}>Senha</span>
            <input
              type="password"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              required
              style={{
                width: "100%",
                padding: "10px 12px",
                border: "1px solid #ddd",
                borderRadius: 8,
              }}
            />
          </label>

          {error && (
            <p style={{ color: "#e74c3c", marginBottom: 12 }}>{error}</p>
          )}

          <button
            type="submit"
            style={{
              width: "100%",
              background: "#7b2d26",
              color: "#fff",
              padding: "10px 12px",
              border: "none",
              borderRadius: 8,
              cursor: "pointer",
              fontWeight: 600,
            }}
          >
            Entrar
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
