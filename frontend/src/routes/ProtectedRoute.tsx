// src/routes/ProtectedRoute.tsx
import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext"; // ⬅️ Importação essencial

/**
 * Protege rotas de acordo com o cargo do usuário.
 */
interface ProtectedRouteProps {
    children: React.ReactNode;
    requiredRole?: "Administrador" | "Cliente";
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requiredRole }) => {
    // 🛑 USAR O CONTEXTO: Pega o estado centralizado e o status de carregamento
    const { token, role, isLoading } = useAuth();

    console.log("🧭 Verificando acesso (via Contexto):");
    console.log("⏳ Carregando status:", isLoading ? "SIM" : "NÃO");
    console.log("👤 Cargo atual:", role);
    console.log("🎯 Cargo exigido:", requiredRole);

    // 1. ESPERAR CARREGAMENTO: Se o contexto ainda está lendo o localStorage, aguarda.
    if (isLoading) {
        // Retorna null ou um spinner de carregamento para evitar redirecionamento prematuro.
        return <div>Carregando autenticação...</div>; 
    }

    // 2. SE NÃO ESTIVER LOGADO: Redireciona para o login
    if (!token) {
        console.warn("⛔ Sem token ou carregamento falhou. Redirecionando para login...");
        return <Navigate to="/admin-login" replace />; // Use /admin-login se essa for a rota correta
    }

    // 3. VERIFICAR CARGO: Se a rota exige um cargo e o cargo não coincide
    if (requiredRole && role?.toLowerCase() !== requiredRole.toLowerCase()) {
        console.warn("🚫 Acesso negado. Cargo não compatível.");
        return <Navigate to="/acesso-negado" replace />;
    }

    // ✅ Autorizado
    return <>{children}</>;
};

export default ProtectedRoute;