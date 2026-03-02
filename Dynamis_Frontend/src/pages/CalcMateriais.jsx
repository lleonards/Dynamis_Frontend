import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../components/AuthContext';
import PlansModal from '../components/PlansModal';
import api from '../services/api';
import toast from 'react-hot-toast';
import { Package, Plus, Trash2, ArrowLeft, CheckCircle } from 'lucide-react';

const TIPOS_AMBIENTE = [
  { value: 'quarto', label: 'Quarto' },
  { value: 'sala', label: 'Sala' },
  { value: 'cozinha', label: 'Cozinha' },
  { value: 'banheiro', label: 'Banheiro' },
  { value: 'lavanderia', label: 'Lavanderia' },
  { value: 'garagem', label: 'Garagem' },
  { value: 'escritorio', label: 'Escritório' },
  { value: 'corredor', label: 'Corredor' },
];

export default function CalcMateriais() {
  const { credits, ilimitado, useCredit } = useAuth();
  const navigate = useNavigate();
  const [showPlans, setShowPlans] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resultado, setResultado] = useState(null);
  const [ambientes, setAmbientes] = useState([
    { tipo: 'quarto', comprimento: '', largura: '', altura: '2.8' }
  ]);

  const addAmbiente = () => {
    setAmbientes([...ambientes, { tipo: 'sala', comprimento: '', largura: '', altura: '2.8' }]);
  };

  const removeAmbiente = (idx) => {
    if (ambientes.length === 1) return;
    setAmbientes(ambientes.filter((_, i) => i !== idx));
  };

  const updateAmbiente = (idx, field, value) => {
    const updated = [...ambientes];
    updated[idx][field] = value;
    setAmbientes(updated);
  };

  const handleCalcular = async () => {
    for (const a of ambientes) {
      if (!a.comprimento || !a.largura) return toast.error('Preencha as dimensões de todos os ambientes.');
    }

    if (!ilimitado && credits <= 0) { setShowPlans(true); return; }

    setLoading(true);
    try {
      await useCredit('materiais');
      const res = await api.post('/api/calculos/materiais', { ambientes });
      setResultado(res.data);
      toast.success('Cálculo concluído!');
    } catch (err) {
      if (err.response?.data?.semCreditos) { setShowPlans(true); return; }
      toast.error(err.response?.data?.error || 'Erro ao calcular.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '32px 24px' }}>
      {showPlans && <PlansModal onClose={() => setShowPlans(false)} />}

      <button onClick={() => navigate('/dashboard')} className="btn-secondary" style={{ marginBottom: '24px', padding: '8px 16px', fontSize: '0.85rem' }}>
        <ArrowLeft size={14} /> Voltar
      </button>

      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '28px' }}>
        <div style={{ width: '44px', height: '44px', background: 'rgba(74,127,165,0.1)', border: '1px solid rgba(74,127,165,0.3)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#4a7fa5' }}>
          <Package size={22} />
        </div>
        <div>
          <h1 style={{ fontSize: '1.4rem', fontWeight: '700' }}>Calculadora de Materiais</h1>
          <p style={{ color: '#606070', fontSize: '0.85rem' }}>Calcule materiais elétricos por ambiente (NBR 5410)</p>
        </div>
      </div>

      {/* Ambientes */}
      {ambientes.map((amb, idx) => (
        <div key={idx} className="card" style={{ marginBottom: '12px', position: 'relative' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <span style={{ color: '#6ba3cc', fontWeight: '600', fontSize: '0.9rem' }}>Ambiente {idx + 1}</span>
            {ambientes.length > 1 && (
              <button onClick={() => removeAmbiente(idx)} style={{ background: 'none', border: 'none', color: '#e05252', cursor: 'pointer' }}>
                <Trash2 size={16} />
              </button>
            )}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '12px' }}>
            <div className="input-group" style={{ marginBottom: 0 }}>
              <label>Tipo de ambiente</label>
              <select className="input-field" value={amb.tipo} onChange={e => updateAmbiente(idx, 'tipo', e.target.value)}>
                {TIPOS_AMBIENTE.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>
            <div className="input-group" style={{ marginBottom: 0 }}>
              <label>Comprimento (m)</label>
              <input type="number" className="input-field" placeholder="Ex: 4.5" value={amb.comprimento} onChange={e => updateAmbiente(idx, 'comprimento', e.target.value)} min="0.5" step="0.1" />
            </div>
            <div className="input-group" style={{ marginBottom: 0 }}>
              <label>Largura (m)</label>
              <input type="number" className="input-field" placeholder="Ex: 3.2" value={amb.largura} onChange={e => updateAmbiente(idx, 'largura', e.target.value)} min="0.5" step="0.1" />
            </div>
            <div className="input-group" style={{ marginBottom: 0 }}>
              <label>Pé-direito (m)</label>
              <input type="number" className="input-field" placeholder="2.8" value={amb.altura} onChange={e => updateAmbiente(idx, 'altura', e.target.value)} min="2" step="0.1" />
            </div>
          </div>
        </div>
      ))}

      <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
        <button onClick={addAmbiente} className="btn-secondary">
          <Plus size={14} /> Adicionar ambiente
        </button>
        <button onClick={handleCalcular} className="btn-primary" disabled={loading}>
          {loading ? <span className="loading-spinner" /> : <CheckCircle size={14} />}
          {loading ? 'Calculando...' : 'Calcular materiais'}
        </button>
      </div>

      {resultado && (
        <div>
          {/* Totais */}
          <div className="result-box">
            <h3><Package size={16} /> TOTAIS DA RESIDÊNCIA</h3>
            <div className="result-grid">
              {[
                { v: resultado.totais.tomadas_tug, l: 'Tomadas TUG' },
                { v: resultado.totais.tomadas_tue, l: 'Tomadas TUE' },
                { v: resultado.totais.pontos_luz, l: 'Pontos de Luz' },
                { v: `${resultado.totais.metros_fio_15}m`, l: 'Fio 1,5mm²' },
                { v: `${resultado.totais.metros_fio_25}m`, l: 'Fio 2,5mm²' },
                { v: `${resultado.totais.eletrodutos}m`, l: 'Eletrodutos' },
                { v: resultado.totais.caixas_2x4, l: 'Caixas 2×4' },
                { v: resultado.totais.caixas_4x4, l: 'Caixas 4×4' },
              ].map((item, i) => (
                <div key={i} className="result-item">
                  <div className="value">{item.v}</div>
                  <div className="label">{item.l}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Por ambiente */}
          {resultado.ambientes.map((a, i) => (
            <div key={i} className="card" style={{ marginTop: '12px' }}>
              <h4 style={{ color: '#6ba3cc', marginBottom: '12px', textTransform: 'capitalize' }}>
                {a.ambiente} — {a.dimensoes} ({a.area}m²)
              </h4>
              <div className="result-grid">
                {[
                  { v: a.tomadas_tug, l: 'TUG' },
                  { v: a.tomadas_tue, l: 'TUE' },
                  { v: a.pontos_luz, l: 'Pontos Luz' },
                  { v: `${a.metros_fio_15}m`, l: 'Fio 1,5mm²' },
                  { v: `${a.metros_fio_25}m`, l: 'Fio 2,5mm²' },
                  { v: `${a.eletrodutos}m`, l: 'Eletrodutos' },
                ].map((item, j) => (
                  <div key={j} className="result-item" style={{ padding: '10px' }}>
                    <div className="value" style={{ fontSize: '1.2rem' }}>{item.v}</div>
                    <div className="label">{item.l}</div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
