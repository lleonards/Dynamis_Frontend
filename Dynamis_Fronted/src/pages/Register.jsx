import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../components/AuthContext';
import toast from 'react-hot-toast';
import { UserPlus, Eye, EyeOff, Gift, ShieldCheck } from 'lucide-react';

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
    <div style={{ minHeight: '100vh', background: 'radial-gradient(ellipse at top, #141428 0%, #0d0d0f 60%)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
      <div style={{ width: '100%', maxWidth: '440px' }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <img src="/Dynamis.png" alt="Dynamis" style={{ height: '60px', objectFit: 'contain' }} />
          <p style={{ color: '#606070', fontSize: '0.85rem', marginTop: '8px' }}>Instalações Elétricas Residenciais</p>
        </div>

        <div style={{ background: 'rgba(76,175,130,0.08)', border: '1px solid rgba(76,175,130,0.25)', borderRadius: '10px', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
          <Gift size={18} style={{ color: '#4caf82', flexShrink: 0 }} />
          <p style={{ color: '#4caf82', fontSize: '0.85rem', fontWeight: '500' }}>
            3 créditos grátis para novos usuários e consumo somente ao clicar em <strong>Gerar projeto</strong>.
          </p>
        </div>

        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '10px', color: '#6ba3cc' }}>
            <ShieldCheck size={18} />
            <span style={{ fontSize: '0.85rem' }}>Cadastro com confirmação visual de senha</span>
          </div>

          <h2 style={{ fontSize: '1.3rem', fontWeight: '700', marginBottom: '24px', textAlign: 'center' }}>Criar conta</h2>

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

            <button type="submit" className="btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: '8px' }} disabled={loading}>
              {loading ? <span className="loading-spinner" /> : <UserPlus size={16} />}
              {loading ? 'Criando conta...' : 'Criar conta grátis'}
            </button>
          </form>

          <div style={{ textAlign: 'center', marginTop: '20px', borderTop: '1px solid #2a2a38', paddingTop: '20px' }}>
            <p style={{ color: '#606070', fontSize: '0.9rem' }}>
              Já tem conta? <Link to="/login" style={{ color: '#6ba3cc', textDecoration: 'none', fontWeight: '600' }}>Fazer login</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
