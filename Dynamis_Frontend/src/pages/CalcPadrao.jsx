import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../components/AuthContext';
import PlansModal from '../components/PlansModal';
import api from '../services/api';
import toast from 'react-hot-toast';
import { Zap, ArrowLeft, CheckCircle } from 'lucide-react';

const CHECKS = [
  { key: 'tem_chuveiro', label: 'Chuveiro elétrico', potencia: '7.500W' },
  { key: 'tem_arcondicionado', label: 'Ar-condicionado', potencia: '3.000W' },
  { key: 'tem_torneira_eletrica', label: 'Torneira elétrica', potencia: '4.000W' },
  { key: 'tem_forno', label: 'Forno elétrico/indução', potencia: '6.000W' },
  { key: 'tem_secadora', label: 'Secadora de roupas', potencia: '2.500W' },
];

export default function CalcPadrao() {
  const { credits, ilimitado, useCredit } = useAuth();
  const navigate = useNavigate();
  const [showPlans, setShowPlans] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resultado, setResultado] = useState(null);
  const [form, setForm] = useState({
    area_total: '', qtd_quartos: '1',
    tem_chuveiro: false, tem_arcondicionado: false,
    tem_torneira_eletrica: false, tem_forno: false, tem_secadora: false,
    potencia_personalizada: ''
  });

  const handleCalcular = async () => {
    if (!form.area_total) return toast.error('Informe a área total da residência.');
    if (!ilimitado && credits <= 0) { setShowPlans(true); return; }
    setLoading(true);
    try {
      await useCredit('padrao-entrada');
      const res = await api.post('/api/calculos/padrao-entrada', { ambientes_config: form });
      setResultado(res.data);
      toast.success('Cálculo concluído!');
    } catch (err) {
      if (err.response?.data?.semCreditos) { setShowPlans(true); return; }
      toast.error(err.response?.data?.error || 'Erro ao calcular.');
    } finally {
      setLoading(false);
    }
  };

  const padraoColor = resultado?.padrao === 'Monofasico' ? '#4a7fa5' : resultado?.padrao === 'Bifasico' ? '#e0a852' : '#4caf82';

  return (
    <div style={{ maxWidth: '700px', margin: '0 auto', padding: '32px 24px' }}>
      {showPlans && <PlansModal onClose={() => setShowPlans(false)} />}
      <button onClick={() => navigate('/dashboard')} className="btn-secondary" style={{ marginBottom: '24px', padding: '8px 16px', fontSize: '0.85rem' }}>
        <ArrowLeft size={14} /> Voltar
      </button>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '28px' }}>
        <div style={{ width: '44px', height: '44px', background: 'rgba(224,168,82,0.1)', border: '1px solid rgba(224,168,82,0.3)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#e0a852' }}>
          <Zap size={22} />
        </div>
        <div>
          <h1 style={{ fontSize: '1.4rem', fontWeight: '700' }}>Padrao de Entrada</h1>
          <p style={{ color: '#606070', fontSize: '0.85rem' }}>Monofasico, Bifasico ou Trifasico</p>
        </div>
      </div>
      <div className="card">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
          <div className="input-group" style={{ marginBottom: 0 }}>
            <label>Area total (m2)</label>
            <input type="number" className="input-field" placeholder="Ex: 120" value={form.area_total} onChange={e => setForm({...form, area_total: e.target.value})} />
          </div>
          <div className="input-group" style={{ marginBottom: 0 }}>
            <label>Quantidade de quartos</label>
            <input type="number" className="input-field" placeholder="Ex: 3" value={form.qtd_quartos} onChange={e => setForm({...form, qtd_quartos: e.target.value})} min="1" />
          </div>
        </div>
        <p style={{ color: '#a0a0b0', fontSize: '0.85rem', marginBottom: '12px', fontWeight: '600' }}>Equipamentos de alta potencia:</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '8px', marginBottom: '16px' }}>
          {CHECKS.map(c => (
            <label key={c.key} style={{
              display: 'flex', alignItems: 'center', gap: '10px',
              background: form[c.key] ? 'rgba(74,127,165,0.1)' : '#0d0d0f',
              border: `1px solid ${form[c.key] ? '#4a7fa5' : '#2a2a38'}`,
              borderRadius: '8px', padding: '10px 12px', cursor: 'pointer', transition: 'all 0.2s'
            }}>
              <input type="checkbox" checked={form[c.key]} onChange={e => setForm({...form, [c.key]: e.target.checked})} style={{ accentColor: '#4a7fa5' }} />
              <div>
                <div style={{ fontSize: '0.85rem', color: '#e8e8f0' }}>{c.label}</div>
                <div style={{ fontSize: '0.75rem', color: '#606070' }}>{c.potencia}</div>
              </div>
            </label>
          ))}
        </div>
        <div className="input-group">
          <label>Carga adicional personalizada (W)</label>
          <input type="number" className="input-field" placeholder="Ex: 5000 (bomba dagua, etc.)" value={form.potencia_personalizada} onChange={e => setForm({...form, potencia_personalizada: e.target.value})} />
        </div>
        <button onClick={handleCalcular} className="btn-primary" disabled={loading}>
          {loading ? <span className="loading-spinner" /> : <CheckCircle size={14} />}
          {loading ? 'Calculando...' : 'Calcular padrao de entrada'}
        </button>
      </div>
      {resultado && (
        <div className="result-box" style={{ marginTop: '24px' }}>
          <h3><Zap size={16} /> RESULTADO</h3>
          <div style={{
            background: 'rgba(74,127,165,0.1)', border: '2px solid rgba(74,127,165,0.4)',
            borderRadius: '12px', padding: '20px', textAlign: 'center', marginBottom: '20px'
          }}>
            <div style={{ fontSize: '2.5rem', fontWeight: '800', color: '#6ba3cc' }}>{resultado.padrao}</div>
            <div style={{ color: '#a0a0b0', fontSize: '0.9rem', marginTop: '4px' }}>{resultado.descricao}</div>
            <div style={{ color: '#6ba3cc', fontSize: '1rem', fontWeight: '600', marginTop: '8px' }}>Tensao: {resultado.tensao}</div>
          </div>
          <div className="result-grid">
            {[
              { v: resultado.potencia_instalada + 'W', l: 'Potencia Instalada' },
              { v: resultado.potencia_projeto + 'W', l: 'Potencia de Projeto' },
              { v: resultado.disjuntor_geral, l: 'Disjuntor Geral' },
              { v: resultado.medidor, l: 'Medidor' },
            ].map((item, i) => (
              <div key={i} className="result-item">
                <div className="value" style={{ fontSize: '1.2rem' }}>{item.v}</div>
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
