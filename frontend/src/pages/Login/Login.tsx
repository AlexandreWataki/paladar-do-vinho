// src/pages/Login.tsx

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
// 💡 Importe sua instância do Axios configurada
import { http } from "../../api/http"; 
import { AxiosError } from "axios"; // Importe o tipo de erro do Axios para melhor tipagem

// Removida a constante API_LOGIN_URL, pois a baseURL já está no http.ts

const Login: React.FC = ( ) => {
  const navigate = useNavigate();
  const { setAuthData } = useAuth();

  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      // 1. Chamada com Axios: mais limpa e já envia o JSON
      const resp = await http.post("/auth/login", { email, senha } );
      
      // 2. Axios retorna o corpo da resposta em .data
      const data = resp.data; 
      console.log("🎯 Resposta do backend:", data);

      if (!data.access_token) throw new Error("Token ausente na resposta.");

      // 3. Salva o token e o cargo no contexto (e no localStorage)
      if (data.role) {
        setAuthData(data.access_token, data.role);
        console.log("💾 Cargo salvo no Contexto:", data.role);
      } else {
        setAuthData(data.access_token, null);
        console.warn("⚠️ Nenhum campo 'role' recebido do backend.");
      }

      // 4. Navegação SÓ APÓS o salvamento bem-sucedido
      if (data.role === "Administrador") {
        navigate("/admin");
      } else {
        navigate("/questionary");
      }
      
    } catch (err) {
      // 5. Tratamento de Erro do Axios
      const axiosError = err as AxiosError;
      let msg = "E-mail ou senha incorretos.";
      
      if (axiosError.response) {
        // O erro veio do backend (ex: 401 Unauthorized)
        const backendData = axiosError.response.data as any;
        if (backendData && backendData.detail) {
          msg = backendData.detail;
        } else if (axiosError.message) {
          msg = axiosError.message;
        }
      } else if (axiosError.request) {
        // O erro foi na requisição (ex: servidor offline)
        msg = "Erro de conexão. Verifique se o servidor está ativo.";
      } else {
        // Outros erros (ex: token ausente na resposta)
        msg = (err as Error).message || "Ocorreu um erro desconhecido.";
      }

      console.error("Erro de login:", msg);
      setError(msg);
      setAuthData(null, null); // Limpa os dados de autenticação em caso de falha
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
