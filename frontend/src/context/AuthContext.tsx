// src/context/AuthContext.tsx
import React, { createContext, useContext, useState, useEffect } from 'react';

interface AuthContextType {
    token: string | null;
    role: string | null;
    isAuthenticated: boolean;
    setAuthData: (token: string | null, role: string | null) => void;
    // ESSENCIAL: Indica se a leitura inicial do localStorage terminou
    isLoading: boolean; 
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [token, setToken] = useState<string | null>(null);
    const [role, setRole] = useState<string | null>(null);
    // Começa como true, bloqueando rotas protegidas até a checagem inicial
    const [isLoading, setIsLoading] = useState(true); 

    // 1. Carrega o estado inicial do localStorage na montagem
    useEffect(() => {
        const storedToken = localStorage.getItem('access_token');
        const storedRole = localStorage.getItem('role');
        
        if (storedToken) {
            setToken(storedToken);
            // Garante que o role seja null se não estiver armazenado ou for 'null'
            setRole(storedRole === 'null' ? null : storedRole); 
        }
        
        // 🛑 ESSENCIAL: Marca o carregamento como concluído APÓS a leitura.
        setIsLoading(false); 
    }, []);

    // 2. Função para atualizar o estado e o localStorage (usada após Login ou Logout)
    const setAuthData = (newToken: string | null, newRole: string | null) => {
        if (newToken) {
            localStorage.setItem('access_token', newToken);
            
            // 🚨 CORREÇÃO: Salva o novo role. Se for null, salva como 'null' (string) 
            // ou o role de fato ('Administrador').
            localStorage.setItem('role', newRole || 'null'); 
            
            setToken(newToken);
            setRole(newRole);
        } else {
            // Logout
            localStorage.removeItem('access_token');
            localStorage.removeItem('role');
            setToken(null);
            setRole(null);
        }
        // Não é necessário chamar setIsLoading(false) aqui se o login for bem-sucedido, 
        // pois o isLoading já deve ser false (do useEffect inicial) ou será resolvido no próximo render.
        // Contudo, se quiser ter certeza, poderia mantê-lo, mas o mais crítico é no useEffect.
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