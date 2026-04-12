import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Zap, ArrowLeft, Save, Trash2, Info, Pencil, Layers3 } from 'lucide-react';
import { clearToolEntries, getToolEntries, removeToolEntry, saveToolEntry } from '../utils/storage';

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

function buildLabel(form, total) {
  return `Residência ${form.area_total || total + 1}m²`;
}

export default function CalcPadrao() {
  const navigate = useNavigate();
  const [form, setForm] = useState(DEFAULT_FORM);
  const [entries, setEntries] = useState(() => getToolEntries('padraoEntrada'));
  const [editingId, setEditingId] = useState(null);

  const refreshEntries = () => setEntries(getToolEntries('padraoEntrada'));
  const resetCurrent = () => {
    setForm(DEFAULT_FORM);
    setEditingId(null);
  };

  const handleSave = () => {
    if (!form.area_total) {
      toast.error('Informe a área total da residência antes de salvar.');
      return;
    }

    const label = editingId ? entries.find((item) => item.id === editingId)?.label || buildLabel(form, entries.length) : buildLabel(form, entries.length);
    saveToolEntry('padraoEntrada', form, label, editingId);
    refreshEntries();
    resetCurrent();
    toast.success(editingId ? 'Registro atualizado com sucesso.' : 'Novo registro salvo na ferramenta.');
  };

  const handleEdit = (entry) => {
    setForm(entry.data);
    setEditingId(entry.id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleRemove = (entryId) => {
    removeToolEntry('padraoEntrada', entryId);
    refreshEntries();
    if (editingId === entryId) resetCurrent();
    toast.success('Registro removido.');
  };

  const handleClearAll = () => {
    clearToolEntries('padraoEntrada');
    refreshEntries();
    resetCurrent();
    toast.success('Todos os registros de padrão de entrada foram removidos.');
  };

  return (
    <div style={{ maxWidth: '980px', margin: '0 auto', padding: '32px 24px 110px' }}>
      <button onClick={() => navigate('/dashboard')} className="btn-secondary" style={{ marginBottom: '24px', padding: '8px 16px', fontSize: '0.85rem' }}>
        <ArrowLeft size={14} /> Voltar
      </button>

      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '28px' }}>
        <div style={{ width: '44px', height: '44px', background: 'rgba(224,168,82,0.1)', border: '1px solid rgba(224,168,82,0.3)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#e0a852' }}>
          <Zap size={22} />
        </div>
        <div>
          <h1 style={{ fontSize: '1.4rem', fontWeight: '700' }}>Padrão de entrada</h1>
          <p style={{ color: '#606070', fontSize: '0.88rem' }}>Salve quantas residências quiser. Todas entram no projeto quando você gerar o resultado na tela inicial.</p>
        </div>
      </div>

      <div className="card" style={{ marginBottom: '18px' }}>
        <div className="notice-box" style={{ marginBottom: '20px' }}>
          <Info size={16} />
          <span>O crédito só é consumido na geração final do projeto. Aqui você pode cadastrar e salvar quantos registros precisar.</span>
        </div>

        <div className="result-grid" style={{ marginBottom: '20px' }}>
          <div className="result-item"><div className="value">{entries.length}</div><div className="label">Registros salvos</div></div>
          <div className="result-item"><div className="value">{editingId ? 'Sim' : 'Não'}</div><div className="label">Editando item</div></div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px', marginBottom: '20px' }}>
          <div className="input-group" style={{ marginBottom: 0 }}>
            <label>Área total (m²)</label>
            <input type="number" className="input-field" placeholder="Ex: 120" value={form.area_total} onChange={(e) => setForm({ ...form, area_total: e.target.value })} />
          </div>

          <div className="input-group" style={{ marginBottom: 0 }}>
            <label>Quantidade de quartos</label>
            <input type="number" className="input-field" placeholder="Ex: 3" value={form.qtd_quartos} onChange={(e) => setForm({ ...form, qtd_quartos: e.target.value })} min="1" />
          </div>
        </div>

        <p style={{ color: '#a0a0b0', fontSize: '0.85rem', marginBottom: '12px', fontWeight: '600' }}>Equipamentos de maior potência</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(210px, 1fr))', gap: '8px', marginBottom: '16px' }}>
          {CHECKS.map((item) => (
            <label key={item.key} style={{
              display: 'flex', alignItems: 'center', gap: '10px',
              background: form[item.key] ? 'rgba(74,127,165,0.1)' : '#0d0d0f',
              border: `1px solid ${form[item.key] ? '#4a7fa5' : '#2a2a38'}`,
              borderRadius: '8px', padding: '10px 12px', cursor: 'pointer'
            }}>
              <input type="checkbox" checked={form[item.key]} onChange={(e) => setForm({ ...form, [item.key]: e.target.checked })} style={{ accentColor: '#4a7fa5' }} />
              <div>
                <div style={{ fontSize: '0.85rem', color: '#e8e8f0' }}>{item.label}</div>
                <div style={{ fontSize: '0.75rem', color: '#606070' }}>{item.potencia}</div>
              </div>
            </label>
          ))}
        </div>

        <div className="input-group">
          <label>Carga adicional personalizada (W)</label>
          <input type="number" className="input-field" placeholder="Ex: 5000" value={form.potencia_personalizada} onChange={(e) => setForm({ ...form, potencia_personalizada: e.target.value })} />
        </div>

        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <button onClick={handleSave} className="btn-primary">
            <Save size={14} /> {editingId ? 'Atualizar registro' : 'Salvar registro'}
          </button>
        </div>
      </div>

      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', alignItems: 'center', marginBottom: '18px', flexWrap: 'wrap' }}>
          <h2 style={{ fontSize: '1rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '8px' }}><Layers3 size={18} /> Registros salvos nesta ferramenta</h2>
          <span className="badge badge-blue">Sem limite</span>
        </div>

        {!entries.length ? (
          <p style={{ color: '#606070' }}>Nenhum registro salvo ainda.</p>
        ) : (
          <div style={{ display: 'grid', gap: '12px' }}>
            {entries.map((entry, index) => {
              const ativos = CHECKS.filter((item) => entry.data[item.key]).map((item) => item.label);
              return (
                <div key={entry.id} style={{ background: '#141418', border: '1px solid #2a2a38', borderRadius: '10px', padding: '14px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap', marginBottom: '8px' }}>
                    <div>
                      <strong style={{ color: '#fff' }}>{entry.label || `Registro ${index + 1}`}</strong>
                      <div style={{ color: '#606070', fontSize: '0.8rem', marginTop: '4px' }}>Salvo em {new Date(entry.savedAt).toLocaleString('pt-BR')}</div>
                    </div>
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                      <button onClick={() => handleEdit(entry)} className="btn-secondary" style={{ padding: '8px 10px', fontSize: '0.8rem' }}>
                        <Pencil size={13} /> Editar
                      </button>
                      <button onClick={() => handleRemove(entry.id)} className="btn-secondary" style={{ padding: '8px 10px', fontSize: '0.8rem' }}>
                        <Trash2 size={13} /> Excluir
                      </button>
                    </div>
                  </div>
                  <p style={{ color: '#a0a0b0', lineHeight: 1.6 }}>
                    Área total: <strong style={{ color: '#fff' }}>{entry.data.area_total} m²</strong> • Quartos: <strong style={{ color: '#fff' }}>{entry.data.qtd_quartos}</strong>
                  </p>
                  <p style={{ color: '#a0a0b0', lineHeight: 1.6, marginTop: '6px' }}>
                    Equipamentos: <strong style={{ color: '#fff' }}>{ativos.length ? ativos.join(', ') : 'Nenhum selecionado'}</strong>
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {entries.length > 0 && (
        <button onClick={handleClearAll} className="floating-clear-button" type="button">
          <Trash2 size={16} /> Limpar todos
        </button>
      )}
    </div>
  );
}
