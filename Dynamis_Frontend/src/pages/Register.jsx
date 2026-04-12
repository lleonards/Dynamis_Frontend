import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../components/AuthContext';
import HelpGuideModal from '../components/HelpGuideModal';
import toast from 'react-hot-toast';
import { UserPlus, Eye, EyeOff, HelpCircle, Gift } from 'lucide-react';

export default function Register() {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [guideOpen, setGuideOpen] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    document.title = 'Cadastro | Dynamis';
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!nome || !email || !password || !confirmPass) return toast.error('Preencha todos os campos.');
    if (password !== confirmPass) return toast.error('As senhas não coincidem.');
    if (password.length < 6) return toast.error('A senha deve ter pelo menos 6 caracteres.');

    setLoading(true);
    try {
      await register(nome, email, password);
      toast.success('Conta criada com sucesso! Você já entrou automaticamente.');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Erro ao criar conta.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page auth-page-minimal">
      <div className="auth-topbar">
        <div className="auth-topbar-brand">
          <img src="/Dynamis.png" alt="Dynamis" className="auth-topbar-logo" />
        </div>

        <button type="button" className="auth-help-button" onClick={() => setGuideOpen(true)}>
          <HelpCircle size={16} />
          Ajuda
        </button>
      </div>

      <div className="auth-center-wrap">
        <section className="card auth-card auth-card-minimal">
          <div className="auth-brand-badge">Dynamis</div>
          <h1 className="auth-form-title auth-form-title-compact">Cadastro</h1>
          <p className="auth-form-subtitle auth-form-subtitle-compact">
            Crie sua conta para preencher as ferramentas da Dynamis e gerar um resultado final claro e normativo.
          </p>

          <div className="auth-inline-note auth-inline-note-minimal">
            <Gift size={16} />
            <span>Novos usuários recebem 3 créditos grátis.</span>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="input-group">
              <label>Nome</label>
              <input
                type="text"
                className="input-field auth-input-minimal"
                placeholder="Seu nome"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                required
              />
            </div>

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
                  placeholder="Mín. 6 caracteres"
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

            <div className="input-group">
              <label>Confirmar senha</label>
              <div className="auth-password-wrap">
                <input
                  type={showConfirmPass ? 'text' : 'password'}
                  className="input-field auth-input-minimal"
                  placeholder="Repita a senha"
                  value={confirmPass}
                  onChange={(e) => setConfirmPass(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="auth-password-toggle"
                  onClick={() => setShowConfirmPass(!showConfirmPass)}
                  aria-label={showConfirmPass ? 'Ocultar senha' : 'Mostrar senha'}
                >
                  {showConfirmPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button type="submit" className="btn-primary auth-submit auth-submit-minimal" disabled={loading}>
              {loading ? <span className="loading-spinner" /> : <UserPlus size={16} />}
              {loading ? 'Criando conta...' : 'Criar conta'}
            </button>
          </form>

          <div className="auth-divider" />

          <p className="auth-switch-text">
            Já tem uma conta? <Link to="/login" className="auth-link">Entrar</Link>
          </p>
        </section>
      </div>

      <HelpGuideModal open={guideOpen} onClose={() => setGuideOpen(false)} />
    </div>
  );
}
