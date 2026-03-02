import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../components/AuthContext';
import toast from 'react-hot-toast';
import { Zap, Eye, EyeOff } from 'lucide-react';

const logoUrl = import.meta.env.VITE_LOGO_URL || 'https://www.genspark.ai/api/files/s/vSPekgD2';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) return toast.error('Preencha todos os campos.');
    setLoading(true);
    try {
      await login(email, password);
      toast.success('Bem-vindo(a) de volta!');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Erro ao fazer login.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'radial-gradient(ellipse at top, #141428 0%, #0d0d0f 60%)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '24px'
    }}>
      <div style={{ width: '100%', maxWidth: '420px' }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <img src={logoUrl} alt="Dynamis" style={{ height: '50px', objectFit: 'contain' }} />
          <p style={{ color: '#606070', fontSize: '0.85rem', marginTop: '8px' }}>
            Instalações Elétricas Residenciais
          </p>
        </div>

        <div className="card">
          <h2 style={{ fontSize: '1.3rem', fontWeight: '700', marginBottom: '24px', textAlign: 'center' }}>
            Entrar na sua conta
          </h2>

          <form onSubmit={handleSubmit}>
            <div className="input-group">
              <label>E-mail</label>
              <input
                type="email"
                className="input-field"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="input-group">
              <label>Senha</label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPass ? 'text' : 'password'}
                  className="input-field"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{ paddingRight: '44px' }}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  style={{
                    position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)',
                    background: 'none', border: 'none', color: '#606070', cursor: 'pointer'
                  }}
                >
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button type="submit" className="btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: '8px' }} disabled={loading}>
              {loading ? <span className="loading-spinner" /> : <Zap size={16} />}
              {loading ? 'Entrando...' : 'Entrar'}
            </button>
          </form>

          <div style={{ textAlign: 'center', marginTop: '20px', borderTop: '1px solid #2a2a38', paddingTop: '20px' }}>
            <p style={{ color: '#606070', fontSize: '0.9rem' }}>
              Não tem conta?{' '}
              <Link to="/register" style={{ color: '#6ba3cc', textDecoration: 'none', fontWeight: '600' }}>
                Criar conta grátis
              </Link>
            </p>
          </div>
        </div>

        <p style={{ textAlign: 'center', marginTop: '16px', color: '#3a3a50', fontSize: '0.78rem' }}>
          🎁 Novos usuários ganham 2 créditos grátis!
        </p>
      </div>
    </div>
  );
}
