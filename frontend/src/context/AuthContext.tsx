// src/context/AuthContext.tsx
import React, { createContext, useContext, useState, useEffect } from 'react';

interface AuthContextType {
  token: string | null;
  role: string | null;
  isAuthenticated: boolean;
  setAuthData: (token: string | null, role: string | null) => void;
  // 🆕 Adicionado para resolver o problema de timing (precisar logar duas vezes)
  isLoading: boolean; 
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(null);
  const [role, setRole] = useState<string | null>(null);
  // 🆕 Começa como true e se torna false após a leitura inicial do localStorage
  const [isLoading, setIsLoading] = useState(true); 

  // 1. Carrega o estado inicial do localStorage
  useEffect(() => {
    const storedToken = localStorage.getItem('access_token');
    const storedRole = localStorage.getItem('role');
    
    if (storedToken) { // O token é o dado principal para autenticação
      setToken(storedToken);
      setRole(storedRole || null); // Se a role for null, mantém null
    }
    
    // 🛑 ESSENCIAL: Marca o carregamento como concluído APÓS a leitura.
    // Isso libera o ProtectedRoute para tomar uma decisão.
    setIsLoading(false); 
  }, []);

  // 2. Função para atualizar o estado e o localStorage
  const setAuthData = (newToken: string | null, newRole: string | null) => {
    if (newToken) {
      localStorage.setItem('access_token', newToken);
      localStorage.setItem('role', newRole || '');
      setToken(newToken);
      setRole(newRole);
    } else {
      localStorage.removeItem('access_token');
      localStorage.removeItem('role');
      setToken(null);
      setRole(null);
    }
    // Garante que, se o login for bem-sucedido, o estado de carregamento esteja false
    setIsLoading(false);
  };

  const isAuthenticated = !!token;

  return (
    <AuthContext.Provider value={{ token, role, isAuthenticated, setAuthData, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};