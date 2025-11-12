// src/routes/ProtectedRoute.tsx
import React from "react";
import { Navigate } from "react-router-dom";

/**
 * Protege rotas de acordo com o cargo do usuário.
 * Exemplo: <ProtectedRoute requiredRole="Administrador"><AdminPage/></ProtectedRoute>
 */
interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: "Administrador" | "Cliente";
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requiredRole }) => {
  const token = localStorage.getItem("access_token");
  const role = localStorage.getItem("role");

  console.log("🧭 Verificando acesso:");
  console.log("🔐 Token:", token ? "presente" : "ausente");
  console.log("👤 Cargo atual:", role);
  console.log("🎯 Cargo exigido:", requiredRole);

  // 🔸 Se não estiver logado, volta para o login
  if (!token) {
    console.warn("⛔ Sem token, redirecionando para login...");
    return <Navigate to="/login" replace />;
  }

  // 🔸 Se a rota exigir cargo e o cargo não coincidir (case-insensitive)
  if (requiredRole && role?.toLowerCase() !== requiredRole.toLowerCase()) {
    console.warn("🚫 Acesso negado. Cargo não compatível.");
    return <Navigate to="/acesso-negado" replace />;
  }

  // ✅ Autorizado
  return <>{children}</>;
};

export default ProtectedRoute;
