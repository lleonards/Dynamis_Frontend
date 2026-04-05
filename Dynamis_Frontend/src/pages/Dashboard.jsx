import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../components/AuthContext';
import PlansModal from '../components/PlansModal';
import api from '../services/api';
import toast from 'react-hot-toast';
import {
  Package, Plug, Zap, Cable, BookOpen, Lightbulb, ChevronRight, Infinity,
  Save, PlayCircle, Trash2, Download, FileText, File, ExternalLink, CheckCircle2, Clock3
} from 'lucide-react';
import {
  TOOL_LABELS,
  getSavedTools,
  getSavedToolsForApi,
  removeToolDraft,
  clearAllToolDrafts,
  getGeneratedReport,
  saveGeneratedReport,
  clearGeneratedReport
} from '../utils/storage';
import { exportReportAsDocx, exportReportAsPdf } from '../utils/reportExport';

const TOOLS = [
  {
    id: 'materiais',
    icon: <Package size={28} />,
    nome: 'Calculadora de Materiais',
    descricao: 'Monte os ambientes e salve para gerar depois os quantitativos mínimos.',
    cor: '#4a7fa5',
    rota: '/calculos/materiais',
    tag: 'Salvar sem crédito',
    saveDriven: true
  },
  {
    id: 'tomadas',
    icon: <Plug size={28} />,
    nome: 'Dimensionamento de Tomadas',
    descricao: 'Salve o ambiente e gere depois o mínimo de TUG e as observações de TUE.',
    cor: '#6ba3cc',
    rota: '/calculos/tomadas',
    tag: 'Salvar sem crédito',
    saveDriven: true
  },
  {
    id: 'padraoEntrada',
    icon: <Zap size={28} />,
    nome: 'Padrão de Entrada',
    descricao: 'Guarde os dados da residência e gere a estimativa consolidada na tela principal.',
    cor: '#e0a852',
    rota: '/calculos/padrao',
    tag: 'Salvar sem crédito',
    saveDriven: true
  },
  {
    id: 'condutores',
    icon: <Cable size={28} />,
    nome: 'Dimensionamento de Condutores',
    descricao: 'Salve corrente, tensão e comprimento para gerar o resultado depois.',
    cor: '#7eb87e',
    rota: '/calculos/condutores',
    tag: 'Salvar sem crédito',
    saveDriven: true
  },
  {
    id: 'dicionario',
    icon: <BookOpen size={28} />,
    nome: 'Dicionário Técnico',
    descricao: 'Consulta livre de termos elétricos. Não participa do relatório gerado.',
    cor: '#b87eb8',
    rota: '/calculos/dicionario',
    tag: 'Consulta livre',
    saveDriven: false
  },
  {
    id: 'luminarias',
    icon: <Lightbulb size={28} />,
    nome: 'Tipos de Luminárias',
    descricao: 'Consulta livre de modelos e usos. Não participa do relatório gerado.',
    cor: '#b8a07e',
    rota: '/calculos/luminarias',
    tag: 'Consulta livre',
    saveDriven: false
  }
];

function ToolStatusBadge({ savedAt }) {
  if (!savedAt) {
    return <span className="badge badge-neutral">Não salvo</span>;
  }

  return (
    <span className="badge badge-green">
      <CheckCircle2 size={12} /> Salvo em {new Date(savedAt).toLocaleString('pt-BR')}
    </span>
  );
}

function SectionHeader({ icon, title, subtitle, action }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', alignItems: 'center', marginBottom: '18px', flexWrap: 'wrap' }}>
      <div>
        <h2 style={{ color: '#e8e8f0', fontSize: '1.05rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '8px' }}>{icon}{title}</h2>
        {subtitle && <p style={{ color: '#606070', fontSize: '0.85rem', marginTop: '6px' }}>{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

function ResultCard({ title, children, action }) {
  return (
    <div className="card" style={{ marginBottom: '16px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', alignItems: 'flex-start', marginBottom: '16px', flexWrap: 'wrap' }}>
        <h3 style={{ fontSize: '1rem', color: '#e8e8f0', fontWeight: '700' }}>{title}</h3>
        {action}
      </div>
      {children}
    </div>
  );
}

export default function Dashboard() {
  const { user, credits, ilimitado, fetchCredits } = useAuth();
  const navigate = useNavigate();
  const [showPlans, setShowPlans] = useState(false);
  const [savedTools, setSavedTools] = useState({});
  const [report, setReport] = useState(null);
  const [generating, setGenerating] = useState(false);
  const [downloading, setDownloading] = useState('');

  const logoUrl = import.meta.env.VITE_LOGO_URL || 'https://www.genspark.ai/api/files/s/vSPekgD2';

  useEffect(() => {
    setSavedTools(getSavedTools());
    setReport(getGeneratedReport());
  }, []);

  const savedCount = useMemo(() => Object.keys(savedTools).length, [savedTools]);
  const generationReady = savedCount > 0;

  const handleToolClick = (tool) => {
    navigate(tool.rota);
  };

  const refreshLocalState = () => {
    setSavedTools(getSavedTools());
    setReport(getGeneratedReport());
  };

  const handleRemoveSaved = (toolId) => {
    removeToolDraft(toolId);
    refreshLocalState();
    toast.success('Ferramenta salva removida.');
  };

  const handleClearAllSaved = () => {
    clearAllToolDrafts();
    refreshLocalState();
    toast.success('Todos os dados salvos foram removidos.');
  };

  const handleClearReport = () => {
    clearGeneratedReport();
    setReport(null);
    toast.success('Resultado gerado removido da tela principal.');
  };

  const handleGenerate = async () => {
    const ferramentas = getSavedToolsForApi();

    if (!Object.keys(ferramentas).length) {
      toast.error('Salve pelo menos uma ferramenta antes de gerar os resultados.');
      return;
    }

    if (!ilimitado && credits <= 0) {
      setShowPlans(true);
      return;
    }

    setGenerating(true);
    try {
      const res = await api.post('/api/calculos/gerar-relatorio', { ferramentas });
      setReport(res.data);
      saveGeneratedReport(res.data);
      await fetchCredits();
      toast.success('Resultados gerados com sucesso!');
    } catch (err) {
      if (err.response?.data?.semCreditos) {
        setShowPlans(true);
        return;
      }
      toast.error(err.response?.data?.error || 'Erro ao gerar resultados.');
    } finally {
      setGenerating(false);
    }
  };

  const handleDownload = async (type) => {
    if (!report) {
      toast.error('Gere um relatório antes de baixar.');
      return;
    }

    setDownloading(type);
    try {
      if (type === 'pdf') {
        await exportReportAsPdf(report);
      } else {
        await exportReportAsDocx(report);
      }
      toast.success(`Download em ${type.toUpperCase()} iniciado.`);
    } catch (error) {
      toast.error('Não foi possível gerar o arquivo para download.');
    } finally {
      setDownloading('');
    }
  };

  const renderNormAction = (norma) => {
    if (!norma?.url) return null;
    return (
      <a href={norma.url} target="_blank" rel="noreferrer" className="btn-secondary" style={{ padding: '8px 12px', fontSize: '0.82rem' }}>
        <ExternalLink size={14} /> Ler a norma
      </a>
    );
  };

  return (
    <div style={{ minHeight: '100vh', background: '#0d0d0f' }}>
      {showPlans && <PlansModal onClose={() => setShowPlans(false)} />}

      <div style={{
        background: 'linear-gradient(135deg, #0d0d0f 0%, #111120 50%, #141428 100%)',
        borderBottom: '1px solid #1e1e2e',
        padding: '40px 24px 32px',
        textAlign: 'center'
      }}>
        <img src={logoUrl} alt="Dynamis" style={{ height: '48px', objectFit: 'contain', marginBottom: '16px' }} onError={(e) => { e.target.style.display = 'none'; }} />
        <h1 style={{ fontSize: '1.6rem', fontWeight: '800', color: '#fff', marginBottom: '8px' }}>Instalações Elétricas Residenciais</h1>
        <p style={{ color: '#606070', fontSize: '0.95rem', maxWidth: '640px', margin: '0 auto' }}>
          Agora o crédito só é consumido quando você clicar em <strong style={{ color: '#e8e8f0' }}>Gerar</strong> na tela principal.
          Você pode abrir, preencher e salvar as ferramentas primeiro, no seu ritmo.
        </p>

        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap',
          background: ilimitado ? 'rgba(76,175,130,0.08)' : credits === 0 ? 'rgba(224,82,82,0.08)' : 'rgba(74,127,165,0.08)',
          border: `1px solid ${ilimitado ? 'rgba(76,175,130,0.3)' : credits === 0 ? 'rgba(224,82,82,0.3)' : 'rgba(74,127,165,0.3)'}`,
          borderRadius: '30px', padding: '10px 20px', marginTop: '20px'
        }}>
          {ilimitado ? <Infinity size={16} style={{ color: '#4caf82' }} /> : <Zap size={16} style={{ color: credits === 0 ? '#e05252' : '#6ba3cc' }} />}
          <span style={{ color: ilimitado ? '#4caf82' : credits === 0 ? '#e05252' : '#6ba3cc', fontWeight: '600', fontSize: '0.9rem' }}>
            {ilimitado ? 'Plano ilimitado ativo' : credits === 0 ? 'Sem créditos para gerar' : credits === 1 ? '1 crédito disponível para gerar' : `${credits} créditos disponíveis para gerar`}
          </span>
        </div>
      </div>

      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '32px 24px 48px' }}>
        <div className="card" style={{ marginBottom: '28px' }}>
          <SectionHeader
            icon={<Save size={18} style={{ color: '#6ba3cc' }} />}
            title="Fluxo novo do sistema"
            subtitle="1) Abra as ferramentas, 2) clique em Salvar, 3) volte aqui e clique em Gerar, 4) baixe em PDF ou Word."
            action={generationReady ? (
              <button onClick={handleClearAllSaved} className="btn-secondary" style={{ padding: '8px 12px', fontSize: '0.82rem' }}>
                <Trash2 size={14} /> Limpar salvos
              </button>
            ) : null}
          />

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px' }}>
            <div className="result-item" style={{ textAlign: 'left' }}>
              <div className="value" style={{ fontSize: '1.7rem' }}>{savedCount}</div>
              <div className="label">Ferramentas salvas</div>
            </div>
            <div className="result-item" style={{ textAlign: 'left' }}>
              <div className="value" style={{ fontSize: '1.1rem' }}>{report ? 'Sim' : 'Não'}</div>
              <div className="label">Resultado gerado</div>
            </div>
            <div className="result-item" style={{ textAlign: 'left' }}>
              <div className="value" style={{ fontSize: '1.1rem' }}>{ilimitado ? 'Ilimitado' : '1 crédito / geração'}</div>
              <div className="label">Regra de consumo</div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginTop: '18px' }}>
            <button onClick={handleGenerate} className="btn-primary" disabled={generating}>
              {generating ? <span className="loading-spinner" /> : <PlayCircle size={16} />}
              {generating ? 'Gerando resultados...' : 'Gerar resultados salvos'}
            </button>
            {report && (
              <button onClick={handleClearReport} className="btn-secondary">
                <Trash2 size={14} /> Limpar resultado exibido
              </button>
            )}
          </div>
        </div>

        <SectionHeader
          icon={<Clock3 size={18} style={{ color: '#6ba3cc' }} />}
          title="Ferramentas disponíveis"
          subtitle="As quatro calculadoras abaixo entram no relatório gerado. Dicionário e luminárias continuam como consulta livre."
        />

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px', marginBottom: '32px' }}>
          {TOOLS.map((tool) => {
            const saved = savedTools[tool.id];
            return (
              <div
                key={tool.id}
                onClick={() => handleToolClick(tool)}
                style={{
                  background: '#141418',
                  border: '1px solid #2a2a38',
                  borderRadius: '12px',
                  padding: '24px',
                  cursor: 'pointer',
                  transition: 'all 0.25s ease',
                  position: 'relative',
                  overflow: 'hidden'
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = tool.cor;
                  e.currentTarget.style.background = '#1a1a22';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = '#2a2a38';
                  e.currentTarget.style.background = '#141418';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2px', background: `linear-gradient(90deg, transparent, ${tool.cor}, transparent)`, opacity: 0.6 }} />

                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '10px', marginBottom: '16px' }}>
                  <div style={{ width: '52px', height: '52px', background: `${tool.cor}18`, border: `1px solid ${tool.cor}30`, borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: tool.cor, flexShrink: 0 }}>
                    {tool.icon}
                  </div>
                  <span style={{ fontSize: '0.7rem', fontWeight: '600', color: tool.cor, background: `${tool.cor}15`, border: `1px solid ${tool.cor}30`, padding: '3px 8px', borderRadius: '10px' }}>
                    {tool.tag}
                  </span>
                </div>

                <h3 style={{ fontSize: '1rem', fontWeight: '700', marginBottom: '8px', color: '#e8e8f0' }}>{tool.nome}</h3>
                <p style={{ color: '#606070', fontSize: '0.85rem', lineHeight: '1.5', marginBottom: '14px' }}>{tool.descricao}</p>

                {tool.saveDriven ? <ToolStatusBadge savedAt={saved?.savedAt} /> : <span className="badge badge-blue">Acesso imediato</span>}

                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: tool.cor, fontSize: '0.85rem', fontWeight: '600', marginTop: '16px' }}>
                  <span>Abrir ferramenta</span>
                  <ChevronRight size={14} />
                </div>

                {tool.saveDriven && saved && (
                  <button
                    onClick={(event) => {
                      event.stopPropagation();
                      handleRemoveSaved(tool.id);
                    }}
                    className="btn-secondary"
                    style={{ marginTop: '12px', padding: '7px 10px', fontSize: '0.78rem' }}
                  >
                    <Trash2 size={13} /> Remover salvo
                  </button>
                )}
              </div>
            );
          })}
        </div>

        {report && (
          <div>
            <SectionHeader
              icon={<FileText size={18} style={{ color: '#6ba3cc' }} />}
              title="Resultados gerados"
              subtitle={`Relatório gerado em ${new Date(report.gerado_em).toLocaleString('pt-BR')}. Clique em “Ler a norma” para abrir a referência aplicada.`}
              action={(
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                  <button onClick={() => handleDownload('pdf')} className="btn-secondary" disabled={downloading !== ''}>
                    {downloading === 'pdf' ? <span className="loading-spinner" /> : <Download size={14} />}
                    {downloading === 'pdf' ? 'Gerando PDF...' : 'Baixar PDF'}
                  </button>
                  <button onClick={() => handleDownload('docx')} className="btn-primary" disabled={downloading !== ''}>
                    {downloading === 'docx' ? <span className="loading-spinner" /> : <File size={14} />}
                    {downloading === 'docx' ? 'Gerando Word...' : 'Baixar Word'}
                  </button>
                </div>
              )}
            />

            {report.resultados.tomadas && (
              <ResultCard title="Dimensionamento de tomadas" action={renderNormAction(report.resultados.tomadas.norma)}>
                <div className="result-grid" style={{ marginBottom: '16px' }}>
                  <div className="result-item"><div className="value">{report.resultados.tomadas.tug_quantidade_minima}</div><div className="label">TUG mínima</div></div>
                  <div className="result-item"><div className="value">{report.resultados.tomadas.area} m²</div><div className="label">Área</div></div>
                  <div className="result-item"><div className="value">{report.resultados.tomadas.perimetro} m</div><div className="label">Perímetro</div></div>
                  <div className="result-item"><div className="value">Opcional</div><div className="label">TUE</div></div>
                </div>
                <p style={{ color: '#a0a0b0', marginBottom: '10px', lineHeight: 1.6 }}>
                  <strong style={{ color: '#fff' }}>Regra aplicada:</strong> {report.resultados.tomadas.tug_formula}
                </p>
                <p style={{ color: '#a0a0b0', marginBottom: '10px', lineHeight: 1.6 }}>
                  <strong style={{ color: '#fff' }}>Observação sobre TUE:</strong> {report.resultados.tomadas.tue_observacao}
                </p>
                {!!report.resultados.tomadas.tue_opcionais?.length && (
                  <ul style={{ color: '#a0a0b0', paddingLeft: '20px', lineHeight: 1.8 }}>
                    {report.resultados.tomadas.tue_opcionais.map((item, index) => <li key={index}>{item}</li>)}
                  </ul>
                )}
              </ResultCard>
            )}

            {report.resultados.materiais && (
              <ResultCard title="Materiais mínimos estimados" action={renderNormAction(report.resultados.materiais.norma)}>
                <div className="result-grid" style={{ marginBottom: '16px' }}>
                  <div className="result-item"><div className="value">{report.resultados.materiais.totais.tomadas_tug_minimas}</div><div className="label">TUG mínimas</div></div>
                  <div className="result-item"><div className="value">{report.resultados.materiais.totais.pontos_luz_minimos}</div><div className="label">Pontos de luz</div></div>
                  <div className="result-item"><div className="value">{report.resultados.materiais.totais.metros_fio_15_estimados} m</div><div className="label">Fio 1,5 mm²</div></div>
                  <div className="result-item"><div className="value">{report.resultados.materiais.totais.metros_fio_25_estimados} m</div><div className="label">Fio 2,5 mm²</div></div>
                </div>
                <p style={{ color: '#a0a0b0', marginBottom: '14px', lineHeight: 1.6 }}>{report.resultados.materiais.observacao_geral}</p>
                <div style={{ display: 'grid', gap: '12px' }}>
                  {report.resultados.materiais.ambientes.map((ambiente, index) => (
                    <div key={index} style={{ background: '#141418', border: '1px solid #2a2a38', borderRadius: '10px', padding: '14px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', alignItems: 'center', flexWrap: 'wrap', marginBottom: '8px' }}>
                        <strong style={{ color: '#fff', textTransform: 'capitalize' }}>{ambiente.ambiente} — {ambiente.dimensoes}</strong>
                        <span className="badge badge-blue">{ambiente.area} m²</span>
                      </div>
                      <p style={{ color: '#a0a0b0', lineHeight: 1.6 }}>TUG mínima: <strong style={{ color: '#fff' }}>{ambiente.tomadas_tug_minimas}</strong> | Pontos de luz mínimos: <strong style={{ color: '#fff' }}>{ambiente.pontos_luz_minimos}</strong></p>
                      {!!ambiente.tue_opcionais?.length && <p style={{ color: '#a0a0b0', marginTop: '8px', lineHeight: 1.6 }}>TUE opcional: {ambiente.tue_opcionais.join(' ')}</p>}
                    </div>
                  ))}
                </div>
              </ResultCard>
            )}

            {report.resultados.padraoEntrada && (
              <ResultCard title="Padrão de entrada" action={renderNormAction(report.resultados.padraoEntrada.norma)}>
                <div className="result-grid" style={{ marginBottom: '16px' }}>
                  <div className="result-item"><div className="value">{report.resultados.padraoEntrada.padrao}</div><div className="label">Padrão sugerido</div></div>
                  <div className="result-item"><div className="value">{report.resultados.padraoEntrada.tensao}</div><div className="label">Tensão</div></div>
                  <div className="result-item"><div className="value">{report.resultados.padraoEntrada.disjuntor_geral}</div><div className="label">Disjuntor geral</div></div>
                  <div className="result-item"><div className="value">{report.resultados.padraoEntrada.medidor}</div><div className="label">Medidor</div></div>
                </div>
                <p style={{ color: '#a0a0b0', lineHeight: 1.6 }}>{report.resultados.padraoEntrada.descricao}</p>
                <p style={{ color: '#a0a0b0', lineHeight: 1.6, marginTop: '10px' }}>{report.resultados.padraoEntrada.norma?.observacao}</p>
              </ResultCard>
            )}

            {report.resultados.condutores && (
              <ResultCard title="Dimensionamento de condutores" action={renderNormAction(report.resultados.condutores.norma)}>
                <div className="result-grid" style={{ marginBottom: '16px' }}>
                  <div className="result-item"><div className="value">{report.resultados.condutores.secao_recomendada}</div><div className="label">Seção</div></div>
                  <div className="result-item"><div className="value">{report.resultados.condutores.capacidade_conducao}</div><div className="label">Capacidade</div></div>
                  <div className="result-item"><div className="value">{report.resultados.condutores.queda_tensao}</div><div className="label">Queda de tensão</div></div>
                  <div className="result-item"><div className="value">{report.resultados.condutores.queda_percentual}</div><div className="label">Queda %</div></div>
                </div>
                <p style={{ color: report.resultados.condutores.aprovado ? '#4caf82' : '#e0a852', fontWeight: '700', marginBottom: '8px' }}>
                  {report.resultados.condutores.aprovado ? 'Resultado aprovado no critério aplicado.' : 'Revise o dimensionamento antes da execução.'}
                </p>
                <p style={{ color: '#a0a0b0', lineHeight: 1.6 }}>{report.resultados.condutores.recomendacao}</p>
              </ResultCard>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
