import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { http } from '../../api/http';
import './AdminLogin.css';


interface LoginResponse {
  access_token: string;
  token_type: string;
}

const AdminLogin: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data = await http<LoginResponse>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, senha }),
      });

      localStorage.setItem('access_token', data.access_token);
      navigate('/admin');
    } catch (err: any) {
      console.error('[ADMIN LOGIN] Erro ao autenticar:', err);
      setError('E-mail ou senha inválidos. Verifique suas credenciais.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="admin-login-container">
      <div className="admin-login-card">
        <h1 className="admin-login-title">
          <span className="admin-login-word">Login - Admininistrador</span>
        </h1>

        <form onSubmit={handleSubmit}>
          <label className="admin-login-field">
            <span className="admin-login-label">E-mail</span>
            <input
              type="email"
              className="admin-login-input"
              placeholder="Digite seu e-mail"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoFocus
            />
          </label>

          <label className="admin-login-field">
            <span className="admin-login-label">Senha</span>
            <input
              type="password"
              className="admin-login-input"
              placeholder="Digite sua senha"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              required
            />
          </label>

          {error && <p className="admin-login-error">{error}</p>}

          <button type="submit" className="admin-login-btn" disabled={loading}>
            {loading ? 'Entrando...' : 'Entrar'}
          </button>

          <button
            type="button"
            className="admin-login-back"
            onClick={() => navigate(-1)}
            aria-label="Voltar"
          >
            ← Voltar
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;
