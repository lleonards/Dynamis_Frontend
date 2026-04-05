import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Zap, ArrowLeft, Save, Trash2, Info } from 'lucide-react';
import { getSavedTool, saveToolDraft, removeToolDraft } from '../utils/storage';

const CHECKS = [
  { key: 'tem_chuveiro', label: 'Chuveiro elétrico', potencia: '7.500 W' },
  { key: 'tem_arcondicionado', label: 'Ar-condicionado', potencia: '3.000 W' },
  { key: 'tem_torneira_eletrica', label: 'Torneira elétrica', potencia: '4.000 W' },
  { key: 'tem_forno', label: 'Forno elétrico/indução', potencia: '6.000 W' },
  { key: 'tem_secadora', label: 'Secadora de roupas', potencia: '2.500 W' }
];

const DEFAULT_FORM = {
  area_total: '',
  qtd_quartos: '1',
  tem_chuveiro: false,
  tem_arcondicionado: false,
  tem_torneira_eletrica: false,
  tem_forno: false,
  tem_secadora: false,
  potencia_personalizada: ''
};

export default function CalcPadrao() {
  const navigate = useNavigate();
  const [form, setForm] = useState(() => getSavedTool('padraoEntrada') || DEFAULT_FORM);

  const handleSave = () => {
    if (!form.area_total) {
      toast.error('Informe a área total da residência antes de salvar.');
      return;
    }

    saveToolDraft('padraoEntrada', form);
    toast.success('Ferramenta salva! Para gerar o cálculo, volte à tela principal e clique em Gerar.');
  };

  const handleClear = () => {
    removeToolDraft('padraoEntrada');
    setForm(DEFAULT_FORM);
    toast.success('Rascunho do padrão de entrada removido.');
  };

  return (
    <div style={{ maxWidth: '760px', margin: '0 auto', padding: '32px 24px' }}>
      <button onClick={() => navigate('/dashboard')} className="btn-secondary" style={{ marginBottom: '24px', padding: '8px 16px', fontSize: '0.85rem' }}>
        <ArrowLeft size={14} /> Voltar
      </button>

      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '28px' }}>
        <div style={{ width: '44px', height: '44px', background: 'rgba(224,168,82,0.1)', border: '1px solid rgba(224,168,82,0.3)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#e0a852' }}>
          <Zap size={22} />
        </div>
        <div>
          <h1 style={{ fontSize: '1.4rem', fontWeight: '700' }}>Padrão de entrada</h1>
          <p style={{ color: '#606070', fontSize: '0.88rem' }}>Salve os dados da residência e gere a estimativa consolidada depois.</p>
        </div>
      </div>

      <div className="card">
        <div className="notice-box" style={{ marginBottom: '20px' }}>
          <Info size={16} />
          <span>O consumo de crédito ocorre somente na geração final do relatório, não no salvamento.</span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px', marginBottom: '20px' }}>
          <div className="input-group" style={{ marginBottom: 0 }}>
            <label>Área total (m²)</label>
            <input type="number" className="input-field" placeholder="Ex: 120" value={form.area_total} onChange={e => setForm({ ...form, area_total: e.target.value })} />
          </div>

          <div className="input-group" style={{ marginBottom: 0 }}>
            <label>Quantidade de quartos</label>
            <input type="number" className="input-field" placeholder="Ex: 3" value={form.qtd_quartos} onChange={e => setForm({ ...form, qtd_quartos: e.target.value })} min="1" />
          </div>
        </div>

        <p style={{ color: '#a0a0b0', fontSize: '0.85rem', marginBottom: '12px', fontWeight: '600' }}>Equipamentos de maior potência</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(210px, 1fr))', gap: '8px', marginBottom: '16px' }}>
          {CHECKS.map(item => (
            <label key={item.key} style={{
              display: 'flex', alignItems: 'center', gap: '10px',
              background: form[item.key] ? 'rgba(74,127,165,0.1)' : '#0d0d0f',
              border: `1px solid ${form[item.key] ? '#4a7fa5' : '#2a2a38'}`,
              borderRadius: '8px', padding: '10px 12px', cursor: 'pointer'
            }}>
              <input type="checkbox" checked={form[item.key]} onChange={e => setForm({ ...form, [item.key]: e.target.checked })} style={{ accentColor: '#4a7fa5' }} />
              <div>
                <div style={{ fontSize: '0.85rem', color: '#e8e8f0' }}>{item.label}</div>
                <div style={{ fontSize: '0.75rem', color: '#606070' }}>{item.potencia}</div>
              </div>
            </label>
          ))}
        </div>

        <div className="input-group">
          <label>Carga adicional personalizada (W)</label>
          <input type="number" className="input-field" placeholder="Ex: 5000" value={form.potencia_personalizada} onChange={e => setForm({ ...form, potencia_personalizada: e.target.value })} />
        </div>

        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <button onClick={handleSave} className="btn-primary">
            <Save size={14} /> Salvar ferramenta
          </button>
          <button onClick={handleClear} className="btn-secondary">
            <Trash2 size={14} /> Limpar salvo
          </button>
        </div>
      </div>
    </div>
  );
}
