import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../components/AuthContext';
import toast from 'react-hot-toast';
import { Eye, EyeOff, LogIn, ShieldCheck } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    document.title = 'Login | Dynamis';
  }, []);

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
    <div className="auth-page auth-page-minimal">
      <div className="auth-center-wrap">
        <section className="card auth-card auth-card-minimal">
          <img src="/Dynamis.png" alt="Logo Dynamis" className="auth-card-logo" />
          <h1 className="auth-form-title auth-form-title-compact">Login</h1>

          <form onSubmit={handleSubmit}>
            <div className="input-group">
              <label>Email</label>
              <input
                type="email"
                className="input-field auth-input-minimal"
                placeholder="Seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="input-group">
              <label>Senha</label>
              <div className="auth-password-wrap">
                <input
                  type={showPass ? 'text' : 'password'}
                  className="input-field auth-input-minimal"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="auth-password-toggle"
                  onClick={() => setShowPass(!showPass)}
                  aria-label={showPass ? 'Ocultar senha' : 'Mostrar senha'}
                >
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button type="submit" className="btn-primary auth-submit auth-submit-minimal" disabled={loading}>
              {loading ? <span className="loading-spinner" /> : <LogIn size={16} />}
              {loading ? 'Entrando...' : 'Entrar'}
            </button>
          </form>

          <div className="auth-divider" />

          <div className="auth-mini-guide">
            <ShieldCheck size={16} />
            <span>Use as ferramentas, volte à tela inicial e gere o resultado final com a norma e o link de leitura.</span>
          </div>

          <p className="auth-switch-text">
            Não tem uma conta? <Link to="/register" className="auth-link">Registre-se</Link>
          </p>
        </section>
      </div>
    </div>
  );
}
