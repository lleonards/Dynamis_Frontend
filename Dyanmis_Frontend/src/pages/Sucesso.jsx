import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../components/AuthContext';
import api from '../services/api';
import { CheckCircle } from 'lucide-react';

export default function Sucesso() {
  const [searchParams] = useSearchParams();
  const { fetchCredits } = useAuth();
  const navigate = useNavigate();
  const sessionId = searchParams.get('session_id');

  useEffect(() => {
    if (sessionId) {
      api.get(`/api/stripe/verify-session?session_id=${sessionId}`)
        .then(() => fetchCredits())
        .catch(() => {});
    }
    const t = setTimeout(() => navigate('/dashboard'), 5000);
    return () => clearTimeout(t);
  }, [sessionId, fetchCredits, navigate]);

  return (
    <div style={{
      minHeight: '100vh', background: '#0d0d0f',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px'
    }}>
      <div style={{ textAlign: 'center', maxWidth: '400px' }}>
        <div style={{
          width: '80px', height: '80px',
          background: 'rgba(76,175,130,0.1)', border: '2px solid rgba(76,175,130,0.4)',
          borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 24px'
        }}>
          <CheckCircle size={36} style={{ color: '#4caf82' }} />
        </div>
        <h1 style={{ fontSize: '1.8rem', fontWeight: '800', color: '#4caf82', marginBottom: '12px' }}>
          Pagamento confirmado!
        </h1>
        <p style={{ color: '#a0a0b0', marginBottom: '8px' }}>
          Seus creditos foram adicionados com sucesso.
        </p>
        <p style={{ color: '#606070', fontSize: '0.85rem', marginBottom: '24px' }}>
          Voce sera redirecionado automaticamente...
        </p>
        <button onClick={() => navigate('/dashboard')} style={{
          background: 'linear-gradient(135deg, #2d5f82, #4a7fa5)',
          border: 'none', color: 'white', padding: '12px 28px',
          borderRadius: '8px', fontWeight: '600', cursor: 'pointer', fontSize: '0.95rem'
        }}>
          Ir para o Dashboard
        </button>
      </div>
    </div>
  );
}
