import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../components/AuthContext';
import PlansModal from '../components/PlansModal';
import api from '../services/api';
import toast from 'react-hot-toast';
import { Plug, ArrowLeft, CheckCircle, MapPin } from 'lucide-react';

const TIPOS = [
  { value: 'quarto', label: 'Quarto' },
  { value: 'sala', label: 'Sala de Estar' },
  { value: 'cozinha', label: 'Cozinha' },
  { value: 'banheiro', label: 'Banheiro' },
  { value: 'lavanderia', label: 'Lavanderia' },
];

export default function CalcTomadas() {
  const { credits, ilimitado, useCredit } = useAuth();
  const navigate = useNavigate();
  const [showPlans, setShowPlans] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resultado, setResultado] = useState(null);
  const [form, setForm] = useState({ tipo: 'quarto', comprimento: '', largura: '' });

  const handleCalcular = async () => {
    if (!form.comprimento || !form.largura) return toast.error('Informe as dimensões do ambiente.');
    if (!ilimitado && credits <= 0) { setShowPlans(true); return; }

    setLoading(true);
    try {
      await useCredit('tomadas');
      const res = await api.post('/api/calculos/tomadas', form);
      setResultado(res.data);
      toast.success('Dimensionamento concluído!');
    } catch (err) {
      if (err.response?.data?.semCreditos) { setShowPlans(true); return; }
      toast.error(err.response?.data?.error || 'Erro ao calcular.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '700px', margin: '0 auto', padding: '32px 24px' }}>
      {showPlans && <PlansModal onClose={() => setShowPlans(false)} />}

      <button onClick={() => navigate('/dashboard')} className="btn-secondary" style={{ marginBottom: '24px', padding: '8px 16px', fontSize: '0.85rem' }}>
        <ArrowLeft size={14} /> Voltar
      </button>

      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '28px' }}>
        <div style={{ width: '44px', height: '44px', background: 'rgba(107,163,204,0.1)', border: '1px solid rgba(107,163,204,0.3)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6ba3cc' }}>
          <Plug size={22} />
        </div>
        <div>
          <h1 style={{ fontSize: '1.4rem', fontWeight: '700' }}>Dimensionamento de Tomadas</h1>
          <p style={{ color: '#606070', fontSize: '0.85rem' }}>TUG e TUE conforme NBR 5410:2004</p>
        </div>
      </div>

      <div className="card">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px' }}>
          <div className="input-group" style={{ marginBottom: 0 }}>
            <label>Tipo de ambiente</label>
            <select className="input-field" value={form.tipo} onChange={e => setForm({ ...form, tipo: e.target.value })}>
              {TIPOS.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
          </div>
          <div className="input-group" style={{ marginBottom: 0 }}>
            <label>Comprimento (m)</label>
            <input type="number" className="input-field" placeholder="Ex: 4.0" value={form.comprimento} onChange={e => setForm({ ...form, comprimento: e.target.value })} min="0.5" step="0.1" />
          </div>
          <div className="input-group" style={{ marginBottom: 0 }}>
            <label>Largura (m)</label>
            <input type="number" className="input-field" placeholder="Ex: 3.5" value={form.largura} onChange={e => setForm({ ...form, largura: e.target.value })} min="0.5" step="0.1" />
          </div>
        </div>

        <button onClick={handleCalcular} className="btn-primary" style={{ marginTop: '20px' }} disabled={loading}>
          {loading ? <span className="loading-spinner" /> : <CheckCircle size={14} />}
          {loading ? 'Calculando...' : 'Dimensionar tomadas'}
        </button>
      </div>

      {resultado && (
        <div className="result-box" style={{ marginTop: '24px' }}>
          <h3><Plug size={16} /> RESULTADO — {resultado.ambiente.toUpperCase()}</h3>

          <div className="result-grid" style={{ marginBottom: '20px' }}>
            <div className="result-item">
              <div className="value">{resultado.tug_quantidade}</div>
              <div className="label">Tomadas TUG</div>
            </div>
            <div className="result-item">
              <div className="value">{resultado.tue.length}</div>
              <div className="label">Tomadas TUE</div>
            </div>
            <div className="result-item">
              <div className="value">{resultado.area}m²</div>
              <div className="label">Área</div>
            </div>
            <div className="result-item">
              <div className="value">{resultado.perimetro}m</div>
              <div className="label">Perímetro</div>
            </div>
          </div>

          {/* TUG detail */}
          <div style={{ background: '#141418', borderRadius: '8px', padding: '14px', marginBottom: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <span style={{ color: '#6ba3cc', fontWeight: '600', fontSize: '0.9rem' }}>TUG — Tomadas de Uso Geral</span>
            </div>
            <p style={{ color: '#a0a0b0', fontSize: '0.85rem', marginBottom: '6px' }}>
              <strong style={{ color: '#fff' }}>{resultado.tug_quantidade} unidades</strong> de {resultado.tug_potencia}W cada
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#606070', fontSize: '0.82rem' }}>
              <MapPin size={12} />
              Posição: {resultado.tug_posicao}
            </div>
            <p style={{ color: '#3a6a8a', fontSize: '0.78rem', marginTop: '6px' }}>📐 {resultado.tug_formula}</p>
          </div>

          {/* TUE */}
          {resultado.tue.length > 0 && (
            <div>
              <p style={{ color: '#6ba3cc', fontWeight: '600', fontSize: '0.9rem', marginBottom: '8px' }}>TUE — Tomadas de Uso Específico</p>
              {resultado.tue.map((t, i) => (
                <div key={i} style={{ background: '#141418', borderRadius: '8px', padding: '12px', marginBottom: '8px', border: '1px solid #2a2a38' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ color: '#e8e8f0', fontSize: '0.9rem', fontWeight: '500' }}>⚡ {t.descricao}</span>
                    <span className="badge badge-blue">{t.potencia}W</span>
                  </div>
                  <p style={{ color: '#606070', fontSize: '0.8rem', marginTop: '4px' }}>
                    <MapPin size={10} style={{ display: 'inline', marginRight: '4px' }} />
                    {t.posicao}
                  </p>
                </div>
              ))}
            </div>
          )}

          <p style={{ color: '#3a3a50', fontSize: '0.78rem', marginTop: '12px' }}>
            📚 Norma: {resultado.norma}
          </p>
        </div>
      )}
    </div>
  );
}
