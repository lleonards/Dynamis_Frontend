import React, { useState } from 'react';
import { X, Crown, CreditCard, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function PlansModal({ onClose, onStartCheckout }) {
  const [loading, setLoading] = useState(false);

  const handleCheckout = async () => {
    if (!onStartCheckout) return;
    setLoading(true);
    try {
      await onStartCheckout();
    } catch (error) {
      toast.error('Não foi possível iniciar o checkout agora.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 1000,
      background: 'rgba(0,0,0,0.85)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '16px',
      backdropFilter: 'blur(4px)'
    }}>
      <div style={{
        background: '#141418',
        border: '1px solid #2a2a38',
        borderRadius: '16px',
        padding: '32px',
        maxWidth: '560px',
        width: '100%',
        position: 'relative'
      }}>
        <button onClick={onClose} style={{ position: 'absolute', top: '16px', right: '16px', background: 'transparent', border: 'none', color: '#a0a0b0', cursor: 'pointer', padding: '4px' }}>
          <X size={20} />
        </button>

        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div style={{
            width: '64px',
            height: '64px',
            background: 'rgba(224,168,82,0.12)',
            border: '1px solid rgba(224,168,82,0.32)',
            borderRadius: '50%',
            margin: '0 auto 16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Crown size={28} style={{ color: '#e0a852' }} />
          </div>

          <h2 style={{ fontSize: '1.6rem', fontWeight: '700', marginBottom: '8px', color: '#fff' }}>
            Seus 3 créditos gratuitos acabaram
          </h2>
          <p style={{ color: '#a0a0b0', fontSize: '0.95rem', lineHeight: 1.6 }}>
            O sistema foi preparado para abrir o Stripe Checkout em modo de assinatura assim que o saldo terminar.
            Depois da assinatura ativa, o usuário passa para o plano ilimitado.
          </p>
        </div>

        <div style={{
          background: 'rgba(74,127,165,0.08)',
          border: '1px solid rgba(74,127,165,0.24)',
          borderRadius: '14px',
          padding: '22px',
          marginBottom: '20px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#dce8f2', marginBottom: '14px' }}>
            <CreditCard size={18} />
            <strong>Assinatura Dynamis</strong>
          </div>

          <ul style={{ listStyle: 'none', display: 'grid', gap: '10px', color: '#b7c4d2', fontSize: '0.9rem', padding: 0, margin: 0 }}>
            <li>✓ Checkout configurado para assinatura recorrente no Stripe</li>
            <li>✓ Upgrade automático para plano ilimitado após confirmação</li>
            <li>✓ Estrutura pronta para você conectar seu price_id depois</li>
          </ul>
        </div>

        <button
          onClick={handleCheckout}
          disabled={loading}
          style={{
            width: '100%',
            background: 'linear-gradient(135deg, #2d5f82, #4a7fa5)',
            border: 'none',
            color: 'white',
            padding: '14px 18px',
            borderRadius: '10px',
            fontWeight: '700',
            cursor: 'pointer',
            fontSize: '0.95rem',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px'
          }}
        >
          {loading ? <Loader2 size={18} className="spin" /> : <CreditCard size={18} />}
          {loading ? 'Abrindo checkout...' : 'Ir para o checkout da assinatura'}
        </button>

        <p style={{ textAlign: 'center', marginTop: '18px', color: '#606070', fontSize: '0.82rem', lineHeight: 1.6 }}>
          Se o Stripe ainda não estiver configurado, basta preencher no backend as variáveis
          STRIPE_SECRET_KEY, STRIPE_PRICE_ID_SUBSCRIPTION, STRIPE_WEBHOOK_SECRET e FRONTEND_URL.
        </p>
      </div>
    </div>
  );
}
