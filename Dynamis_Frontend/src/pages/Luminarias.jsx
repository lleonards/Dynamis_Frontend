import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import toast from 'react-hot-toast';
import { Lightbulb, ArrowLeft, Clock, TrendingUp, Zap } from 'lucide-react';

export default function Luminarias() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [luminarias, setLuminarias] = useState([]);
  const [carregado, setCarregado] = useState(false);
  const [expandido, setExpandido] = useState(null);

  const handleCarregar = async () => {
    setLoading(true);
    try {
      const res = await api.get('/api/calculos/luminarias');
      setLuminarias(res.data.luminarias || []);
      setCarregado(true);
    } catch (err) {
      toast.error('Erro ao carregar luminárias.');
    } finally {
      setLoading(false);
    }
  };

  const custoColor = { Baixo: '#4caf82', Médio: '#e0a852', Alto: '#e05252', Variável: '#6ba3cc' };

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '32px 24px' }}>
      <button onClick={() => navigate('/dashboard')} className="btn-secondary" style={{ marginBottom: '24px', padding: '8px 16px', fontSize: '0.85rem' }}>
        <ArrowLeft size={14} /> Voltar
      </button>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '28px' }}>
        <div style={{ width: '44px', height: '44px', background: 'rgba(184,160,126,0.1)', border: '1px solid rgba(184,160,126,0.3)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#b8a07e' }}>
          <Lightbulb size={22} />
        </div>
        <div>
          <h1 style={{ fontSize: '1.4rem', fontWeight: '700' }}>Tipos de luminárias</h1>
          <p style={{ color: '#606070', fontSize: '0.85rem' }}>Guia de consulta livre. Não consome créditos.</p>
        </div>
      </div>

      {!carregado ? (
        <div className="card" style={{ textAlign: 'center', padding: '40px' }}>
          <Lightbulb size={40} style={{ color: '#3a3a50', margin: '0 auto 16px' }} />
          <p style={{ color: '#606070', marginBottom: '20px' }}>Guia completo com tipos de luminárias e dicas de instalação.</p>
          <button onClick={handleCarregar} className="btn-primary" disabled={loading} style={{ margin: '0 auto' }}>
            {loading ? <span className="loading-spinner" /> : <Lightbulb size={14} />}
            {loading ? 'Carregando...' : 'Ver guia de luminárias'}
          </button>
          <p style={{ color: '#3a3a50', fontSize: '0.78rem', marginTop: '12px' }}>Acesso livre</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '12px' }}>
          {luminarias.map((lum, i) => (
            <div key={i} onClick={() => setExpandido(expandido === i ? null : i)} style={{ background: '#141418', border: `1px solid ${expandido === i ? '#b8a07e' : '#2a2a38'}`, borderRadius: '12px', padding: '18px', cursor: 'pointer', transition: 'all 0.2s' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                <h3 style={{ fontSize: '0.95rem', fontWeight: '700', color: '#e8e8f0' }}>{lum.tipo}</h3>
                <span style={{ fontSize: '0.7rem', fontWeight: '600', padding: '2px 8px', borderRadius: '10px', background: `${custoColor[lum.custo] || '#606070'}15`, color: custoColor[lum.custo] || '#606070', border: `1px solid ${custoColor[lum.custo] || '#606070'}30` }}>{lum.custo}</span>
              </div>
              <div style={{ display: 'flex', gap: '8px', marginBottom: '8px', flexWrap: 'wrap' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.78rem', color: '#a0a0b0' }}><Zap size={11} style={{ color: '#e0a852' }} />{lum.potencia}</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.78rem', color: '#a0a0b0' }}><Clock size={11} style={{ color: '#4a7fa5' }} />{lum.vida_util}</span>
              </div>
              <p style={{ color: '#606070', fontSize: '0.82rem', marginBottom: expandido === i ? '12px' : '0' }}>{lum.uso}</p>
              {expandido === i && (
                <div style={{ borderTop: '1px solid #2a2a38', paddingTop: '12px', marginTop: '4px' }}>
                  <div style={{ display: 'flex', gap: '6px', alignItems: 'center', marginBottom: '8px' }}>
                    <TrendingUp size={13} style={{ color: '#4caf82' }} />
                    <span style={{ fontSize: '0.8rem', color: '#a0a0b0' }}>Eficiência: <strong style={{ color: '#4caf82' }}>{lum.eficiencia}</strong></span>
                  </div>
                  <div style={{ background: 'rgba(184,160,126,0.08)', border: '1px solid rgba(184,160,126,0.2)', borderRadius: '8px', padding: '10px' }}>
                    <p style={{ color: '#b8a07e', fontSize: '0.82rem' }}>💡 {lum.dica}</p>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
