import React, { useState } from 'react';
import { X, Zap, CreditCard, Infinity } from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';

const PLANS = [
  {
    key: '10_creditos',
    nome: '⚡ 10 Créditos',
    preco: 'R$ 19,90',
    descricao: 'Ideal para uso ocasional',
    creditos: '10 gerações',
    features: ['10 gerações de projetos', 'Acesso a todas as ferramentas', 'Histórico dos projetos gerados', 'Validade permanente'],
    destaque: false,
    icon: <Zap size={24} />,
    color: '#4a7fa5'
  },
  {
    key: '20_creditos',
    nome: '🔋 20 Créditos',
    preco: 'R$ 47,90',
    descricao: 'Melhor custo-benefício',
    creditos: '20 gerações',
    features: ['20 gerações de projetos', 'Acesso a todas as ferramentas', 'Histórico dos projetos gerados', 'Economia de 40%'],
    destaque: true,
    icon: <CreditCard size={24} />,
    color: '#6ba3cc'
  },
  {
    key: 'ilimitado',
    nome: '♾️ Ilimitado',
    preco: 'R$ 99,90',
    descricao: 'Para profissionais',
    creditos: 'Gerações ilimitadas',
    features: ['Gerações ilimitadas', 'Acesso a todas as ferramentas', 'Histórico completo', 'Suporte prioritário'],
    destaque: false,
    icon: <Infinity size={24} />,
    color: '#e0a852'
  }
];

export default function PlansModal({ onClose }) {
  const [loading, setLoading] = useState(null);

  const handlePurchase = async (planKey) => {
    setLoading(planKey);
    try {
      const res = await api.post('/api/stripe/create-checkout', { planKey });
      window.location.href = res.data.url;
    } catch (err) {
      toast.error(err.response?.data?.error || 'Erro ao processar pagamento.');
      setLoading(null);
    }
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 1000,
      background: 'rgba(0,0,0,0.85)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '16px', backdropFilter: 'blur(4px)'
    }}>
      <div style={{
        background: '#141418', border: '1px solid #2a2a38', borderRadius: '16px',
        padding: '32px', maxWidth: '900px', width: '100%', maxHeight: '90vh', overflowY: 'auto', position: 'relative'
      }}>
        <button onClick={onClose} style={{ position: 'absolute', top: '16px', right: '16px', background: 'transparent', border: 'none', color: '#a0a0b0', cursor: 'pointer', padding: '4px' }}>
          <X size={20} />
        </button>

        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{
            width: '60px', height: '60px', background: 'rgba(224,82,82,0.1)', border: '1px solid rgba(224,82,82,0.3)',
            borderRadius: '50%', margin: '0 auto 16px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px'
          }}>⚠️</div>
          <h2 style={{ fontSize: '1.6rem', fontWeight: '700', marginBottom: '8px' }}>Seus créditos acabaram</h2>
          <p style={{ color: '#a0a0b0', fontSize: '0.95rem' }}>
            Cada crédito gera um projeto com todos os valores salvos. Escolha um plano para continuar.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
          {PLANS.map((plan) => (
            <div key={plan.key} style={{
              background: plan.destaque ? 'rgba(74,127,165,0.08)' : '#1a1a22',
              border: `1px solid ${plan.destaque ? '#4a7fa5' : '#2a2a38'}`,
              borderRadius: '12px', padding: '24px', position: 'relative'
            }}>
              {plan.destaque && (
                <div style={{
                  position: 'absolute', top: '-12px', left: '50%', transform: 'translateX(-50%)',
                  background: 'linear-gradient(135deg, #2d5f82, #4a7fa5)', color: 'white', fontSize: '0.75rem', fontWeight: '700',
                  padding: '4px 16px', borderRadius: '20px', whiteSpace: 'nowrap'
                }}>
                  ⭐ MAIS POPULAR
                </div>
              )}
              <div style={{ color: plan.color, marginBottom: '12px' }}>{plan.icon}</div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '4px' }}>{plan.nome}</h3>
              <p style={{ color: '#a0a0b0', fontSize: '0.85rem', marginBottom: '16px' }}>{plan.descricao}</p>
              <div style={{ marginBottom: '20px' }}>
                <span style={{ fontSize: '2rem', fontWeight: '800', color: plan.color }}>{plan.preco}</span>
                <span style={{ color: '#606070', fontSize: '0.85rem' }}> / único</span>
              </div>
              <ul style={{ listStyle: 'none', marginBottom: '20px' }}>
                {plan.features.map((f, i) => (
                  <li key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: '#a0a0b0', marginBottom: '8px' }}>
                    <span style={{ color: '#4caf82', fontSize: '0.75rem' }}>✓</span>
                    {f}
                  </li>
                ))}
              </ul>
              <button
                onClick={() => handlePurchase(plan.key)}
                disabled={loading === plan.key}
                style={{
                  width: '100%',
                  background: plan.destaque ? 'linear-gradient(135deg, #2d5f82, #4a7fa5)' : 'transparent',
                  border: `1px solid ${plan.color}`,
                  color: plan.destaque ? 'white' : plan.color,
                  padding: '12px', borderRadius: '8px', fontWeight: '600', cursor: 'pointer',
                  opacity: loading && loading !== plan.key ? 0.5 : 1, fontSize: '0.95rem'
                }}
              >
                {loading === plan.key ? 'Aguarde...' : `Comprar ${plan.creditos}`}
              </button>
            </div>
          ))}
        </div>

        <p style={{ textAlign: 'center', marginTop: '20px', color: '#606070', fontSize: '0.8rem' }}>
          🔒 Pagamento seguro via Stripe • Compra única sem mensalidade
        </p>
      </div>
    </div>
  );
}
