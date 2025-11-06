// src/pages/Login/Login.tsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

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

if (!resp.ok) {
  // tenta extrair a mensagem de erro do backend (ex: {"detail": "Credenciais inválidas"})
  const errorData = await resp.json().catch(() => ({}));
  throw new Error(errorData.detail || "E-mail ou senha incorretos.");
}

const data = await resp.json();

      // ✅ Salva o token
      localStorage.setItem("access_token", data.access_token);

      // ✅ Salva também o cargo
      localStorage.setItem("role", data.role);

      // ✅ Redireciona conforme o cargo
      if (data.role === "Administrador") {
        navigate("/admin");
      } else {
        navigate("/questionary");
      }

    } catch (err: any) {
      console.error("Erro de login:", err?.message || err);
      setError("E-mail ou senha incorretos.");
    }
  };

  return (
    <div style={{ display: "flex", minHeight: "70vh", alignItems: "center", justifyContent: "center" }}>
      <div style={{ width: 380, background: "#fff", borderRadius: 12, boxShadow: "0 6px 18px rgba(0,0,0,0.08)", padding: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 16, textAlign: "center" }}>
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
              style={{ width: "100%", padding: "10px 12px", border: "1px solid #ddd", borderRadius: 8 }}
            />
          </label>

          <label style={{ display: "block", marginBottom: 12 }}>
            <span style={{ display: "block", marginBottom: 6 }}>Senha</span>
            <input
              type="password"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              required
              style={{ width: "100%", padding: "10px 12px", border: "1px solid #ddd", borderRadius: 8 }}
            />
          </label>

          {error && <p style={{ color: "#e74c3c", marginBottom: 12 }}>{error}</p>}

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
