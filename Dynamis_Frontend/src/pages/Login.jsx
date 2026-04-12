import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../components/AuthContext';
import toast from 'react-hot-toast';
import { Zap, Eye, EyeOff, ShieldCheck, Smartphone, LayoutPanelTop } from 'lucide-react';

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
    <div className="auth-page">
      <div className="auth-shell auth-shell-login">
        <section className="auth-hero">
          <div className="auth-logo-wrap">
            <img src="/Dynamis.png" alt="Dynamis" className="auth-logo" />
            <p className="auth-kicker">Instalações Elétricas Residenciais</p>
          </div>

          <div>
            <h1 className="auth-title">Acesse sua conta sem distrações.</h1>
            <p className="auth-subtitle">
              Tela de login em página cheia, com melhor leitura no computador e adaptação para celular.
            </p>
          </div>

          <div className="auth-feature-list">
            <div className="auth-feature-item">
              <ShieldCheck size={18} />
              <span>Ambiente seguro para acessar seus projetos</span>
            </div>
            <div className="auth-feature-item">
              <LayoutPanelTop size={18} />
              <span>Interface reorganizada para ocupar a tela toda</span>
            </div>
            <div className="auth-feature-item">
              <Smartphone size={18} />
              <span>Visual ajustado para uso em celular</span>
            </div>
          </div>
        </section>

        <section className="auth-card-wrap">
          <div className="card auth-card">
            <h2 className="auth-form-title">Entrar na sua conta</h2>
            <p className="auth-form-subtitle">Use seu e-mail e senha para continuar.</p>

            <form onSubmit={handleSubmit}>
              <div className="input-group">
                <label>E-mail</label>
                <input type="email" className="input-field" placeholder="seu@email.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
              </div>

              <div className="input-group">
                <label>Senha</label>
                <div style={{ position: 'relative' }}>
                  <input type={showPass ? 'text' : 'password'} className="input-field" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} style={{ paddingRight: '44px' }} required />
                  <button type="button" onClick={() => setShowPass(!showPass)} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#606070', cursor: 'pointer' }}>
                    {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <button type="submit" className="btn-primary auth-submit" disabled={loading}>
                {loading ? <span className="loading-spinner" /> : <Zap size={16} />}
                {loading ? 'Entrando...' : 'Entrar'}
              </button>
            </form>

            <div className="auth-divider" />

            <p className="auth-switch-text">
              Não tem conta? <Link to="/register" className="auth-link">Criar conta grátis</Link>
            </p>
            <p className="auth-footnote">🎁 Novos usuários ganham 3 créditos grátis para gerar projetos.</p>
          </div>
        </section>
      </div>
    </div>
  );
}
