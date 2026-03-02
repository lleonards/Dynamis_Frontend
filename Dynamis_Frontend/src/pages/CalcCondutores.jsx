import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../components/AuthContext';
import PlansModal from '../components/PlansModal';
import api from '../services/api';
import toast from 'react-hot-toast';
import { Cable, ArrowLeft, CheckCircle, AlertTriangle } from 'lucide-react';

export default function CalcCondutores() {
  const { credits, ilimitado, useCredit } = useAuth();
  const navigate = useNavigate();
  const [showPlans, setShowPlans] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resultado, setResultado] = useState(null);
  const [form, setForm] = useState({ corrente: '', tipo_circuito: 'terminal', comprimento: '', tensao: '127' });

  const handleCalcular = async () => {
    if (!form.corrente || !form.comprimento) return toast.error('Preencha todos os campos.');
    if (!ilimitado && credits <= 0) { setShowPlans(true); return; }
    setLoading(true);
    try {
      await useCredit('condutores');
      const res = await api.post('/api/calculos/condutores', form);
      setResultado(res.data);
      toast.success('Dimensionamento concluido!');
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
        <div style={{ width: '44px', height: '44px', background: 'rgba(126,184,126,0.1)', border: '1px solid rgba(126,184,126,0.3)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#7eb87e' }}>
          <Cable size={22} />
        </div>
        <div>
          <h1 style={{ fontSize: '1.4rem', fontWeight: '700' }}>Dimensionamento de Condutores</h1>
          <p style={{ color: '#606070', fontSize: '0.85rem' }}>Bitola correta dos fios (ABNT NBR 5410)</p>
        </div>
      </div>

      <div className="card">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '16px' }}>
          <div className="input-group" style={{ marginBottom: 0 }}>
            <label>Corrente (A)</label>
            <input type="number" className="input-field" placeholder="Ex: 20" value={form.corrente} onChange={e => setForm({...form, corrente: e.target.value})} min="1" step="0.1" />
          </div>
          <div className="input-group" style={{ marginBottom: 0 }}>
            <label>Comprimento do circuito (m)</label>
            <input type="number" className="input-field" placeholder="Ex: 15" value={form.comprimento} onChange={e => setForm({...form, comprimento: e.target.value})} min="1" />
          </div>
          <div className="input-group" style={{ marginBottom: 0 }}>
            <label>Tensao (V)</label>
            <select className="input-field" value={form.tensao} onChange={e => setForm({...form, tensao: e.target.value})}>
              <option value="127">127V (Monofasico)</option>
              <option value="220">220V</option>
            </select>
          </div>
          <div className="input-group" style={{ marginBottom: 0 }}>
            <label>Tipo de circuito</label>
            <select className="input-field" value={form.tipo_circuito} onChange={e => setForm({...form, tipo_circuito: e.target.value})}>
              <option value="terminal">Terminal (tomadas/luz)</option>
              <option value="alimentacao">Alimentacao (QD)</option>
            </select>
          </div>
        </div>
        <button onClick={handleCalcular} className="btn-primary" style={{ marginTop: '20px' }} disabled={loading}>
          {loading ? <span className="loading-spinner" /> : <CheckCircle size={14} />}
          {loading ? 'Calculando...' : 'Dimensionar condutor'}
        </button>
      </div>

      {resultado && (
        <div className="result-box" style={{ marginTop: '24px' }}>
          <h3><Cable size={16} /> RESULTADO</h3>
          <div style={{
            background: resultado.aprovado ? 'rgba(76,175,130,0.1)' : 'rgba(224,82,82,0.1)',
            border: `2px solid ${resultado.aprovado ? 'rgba(76,175,130,0.4)' : 'rgba(224,82,82,0.4)'}`,
            borderRadius: '12px', padding: '16px', marginBottom: '20px',
            display: 'flex', alignItems: 'center', gap: '12px'
          }}>
            {resultado.aprovado ? (
              <CheckCircle size={20} style={{ color: '#4caf82', flexShrink: 0 }} />
            ) : (
              <AlertTriangle size={20} style={{ color: '#e05252', flexShrink: 0 }} />
            )}
            <div>
              <div style={{ fontWeight: '700', color: resultado.aprovado ? '#4caf82' : '#e05252' }}>
                {resultado.aprovado ? 'Condutor aprovado' : 'Verificar queda de tensao'}
              </div>
              <div style={{ color: '#a0a0b0', fontSize: '0.85rem' }}>{resultado.recomendacao}</div>
            </div>
          </div>
          <div className="result-grid">
            {[
              { v: resultado.secao_recomendada, l: 'Secao Recomendada' },
              { v: resultado.capacidade_conducao, l: 'Cap. de Conducao' },
              { v: resultado.queda_tensao, l: 'Queda de Tensao' },
              { v: resultado.queda_percentual, l: 'Queda (%)' },
            ].map((item, i) => (
              <div key={i} className="result-item">
                <div className="value" style={{ fontSize: '1.2rem', color: '#7eb87e' }}>{item.v}</div>
                <div className="label">{item.l}</div>
              </div>
            ))}
          </div>
          <p style={{ color: '#3a3a50', fontSize: '0.78rem', marginTop: '16px' }}>Norma: {resultado.norma}</p>
        </div>
      )}
    </div>
  );
}
