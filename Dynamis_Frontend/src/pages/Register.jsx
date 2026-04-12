import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../components/AuthContext';
import toast from 'react-hot-toast';
import { UserPlus, Eye, EyeOff, Gift, ShieldCheck, Smartphone, LayoutPanelTop } from 'lucide-react';

export default function Register() {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

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
    <div className="auth-page">
      <div className="auth-shell auth-shell-register">
        <section className="auth-hero">
          <div className="auth-logo-wrap">
            <img src="/Dynamis.png" alt="Dynamis" className="auth-logo" />
            <p className="auth-kicker">Instalações Elétricas Residenciais</p>
          </div>

          <div className="auth-pill auth-pill-success">
            <Gift size={18} />
            <span>3 créditos grátis para novos usuários.</span>
          </div>

          <div>
            <h1 className="auth-title">Crie sua conta em tela cheia.</h1>
            <p className="auth-subtitle">
              Cadastro reorganizado para ocupar melhor a tela, sem navegação superior e com leitura mais confortável em desktop e celular.
            </p>
          </div>

          <div className="auth-feature-list">
            <div className="auth-feature-item">
              <ShieldCheck size={18} />
              <span>Fluxo simples para entrar e já começar a gerar projetos</span>
            </div>
            <div className="auth-feature-item">
              <LayoutPanelTop size={18} />
              <span>Página com melhor distribuição visual em tela cheia</span>
            </div>
            <div className="auth-feature-item">
              <Smartphone size={18} />
              <span>Layout adaptado para telas menores</span>
            </div>
          </div>
        </section>

        <section className="auth-card-wrap">
          <div className="card auth-card">
            <div className="auth-inline-note">
              <ShieldCheck size={18} />
              <span>Cadastro com confirmação visual de senha</span>
            </div>

            <h2 className="auth-form-title">Criar conta</h2>
            <p className="auth-form-subtitle">Preencha os dados abaixo para começar.</p>

            <form onSubmit={handleSubmit}>
              <div className="input-group">
                <label>Nome completo</label>
                <input type="text" className="input-field" placeholder="Seu nome" value={nome} onChange={(e) => setNome(e.target.value)} required />
              </div>

              <div className="input-group">
                <label>E-mail</label>
                <input type="email" className="input-field" placeholder="seu@email.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
              </div>

              <div className="input-group">
                <label>Senha</label>
                <div style={{ position: 'relative' }}>
                  <input type={showPass ? 'text' : 'password'} className="input-field" placeholder="Mín. 6 caracteres" value={password} onChange={(e) => setPassword(e.target.value)} style={{ paddingRight: '44px' }} required />
                  <button type="button" onClick={() => setShowPass(!showPass)} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#606070', cursor: 'pointer' }}>
                    {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div className="input-group">
                <label>Confirmar senha</label>
                <div style={{ position: 'relative' }}>
                  <input type={showConfirmPass ? 'text' : 'password'} className="input-field" placeholder="Repita a senha" value={confirmPass} onChange={(e) => setConfirmPass(e.target.value)} style={{ paddingRight: '44px' }} required />
                  <button type="button" onClick={() => setShowConfirmPass(!showConfirmPass)} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#606070', cursor: 'pointer' }}>
                    {showConfirmPass ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <button type="submit" className="btn-primary auth-submit" disabled={loading}>
                {loading ? <span className="loading-spinner" /> : <UserPlus size={16} />}
                {loading ? 'Criando conta...' : 'Criar conta grátis'}
              </button>
            </form>

            <div className="auth-divider" />

            <p className="auth-switch-text">
              Já tem conta? <Link to="/login" className="auth-link">Fazer login</Link>
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
