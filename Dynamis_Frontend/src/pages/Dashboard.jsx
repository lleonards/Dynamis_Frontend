import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../components/AuthContext';
import PlansModal from '../components/PlansModal';
import api from '../services/api';
import toast from 'react-hot-toast';
import {
  Package, Plug, Zap, Cable, BookOpen, Lightbulb, ChevronRight, Infinity,
  Save, PlayCircle, Trash2, Download, FileText, File, ExternalLink, Clock3,
  FolderOpen, History, Eye, Layers3, Wallet, X, Info
} from 'lucide-react';
import {
  TOOL_LABELS,
  getSavedTools,
  getSavedToolsForApi,
  getToolSavedCount,
  countSavedItems,
  clearAllToolDrafts,
  getLastGeneratedProject,
  saveLastGeneratedProject,
  clearLastGeneratedProject
} from '../utils/storage';
import { exportReportAsDocx, exportReportAsPdf } from '../utils/reportExport';

const TOOLS = [
  {
    id: 'materiais',
    icon: <Package size={28} />,
    nome: 'Calculadora de Materiais',
    descricao: 'Salve vários estudos com múltiplos ambientes e gere tudo depois.',
    cor: '#4a7fa5',
    rota: '/calculos/materiais',
    tag: 'Sem limite',
    saveDriven: true
  },
  {
    id: 'tomadas',
    icon: <Plug size={28} />,
    nome: 'Dimensionamento de Tomadas',
    descricao: 'Cadastre quantos ambientes quiser para processar em lote no projeto.',
    cor: '#6ba3cc',
    rota: '/calculos/tomadas',
    tag: 'Sem limite',
    saveDriven: true
  },
  {
    id: 'padraoEntrada',
    icon: <Zap size={28} />,
    nome: 'Padrão de Entrada',
    descricao: 'Salve várias residências e gere todos os resultados no projeto.',
    cor: '#e0a852',
    rota: '/calculos/padrao',
    tag: 'Sem limite',
    saveDriven: true
  },
  {
    id: 'condutores',
    icon: <Cable size={28} />,
    nome: 'Dimensionamento de Condutores',
    descricao: 'Salve vários circuitos e gere o lote completo de uma vez.',
    cor: '#7eb87e',
    rota: '/calculos/condutores',
    tag: 'Sem limite',
    saveDriven: true
  },
  {
    id: 'dicionario',
    icon: <BookOpen size={28} />,
    nome: 'Dicionário Técnico',
    descricao: 'Consulta livre de termos elétricos.',
    cor: '#b87eb8',
    rota: '/calculos/dicionario',
    tag: 'Consulta livre',
    saveDriven: false
  },
  {
    id: 'luminarias',
    icon: <Lightbulb size={28} />,
    nome: 'Tipos de Luminárias',
    descricao: 'Consulta livre de modelos e usos.',
    cor: '#b8a07e',
    rota: '/calculos/luminarias',
    tag: 'Consulta livre',
    saveDriven: false
  }
];

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

function ToolCountBadge({ count }) {
  if (!count) return <span className="badge badge-neutral">Nenhum salvo</span>;
  return <span className="badge badge-green">{count} registro{count > 1 ? 's' : ''} salvo{count > 1 ? 's' : ''}</span>;
}

function ProjectNameModal({ open, value, onChange, onClose, onConfirm, loading }) {
  if (!open) return null;

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 1200, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
      <div className="card" style={{ maxWidth: '520px', width: '100%', position: 'relative' }}>
        <button onClick={onClose} style={{ position: 'absolute', top: '14px', right: '14px', border: 'none', background: 'transparent', color: '#606070', cursor: 'pointer' }}>
          <X size={18} />
        </button>
        <SectionHeader
          icon={<FolderOpen size={18} style={{ color: '#6ba3cc' }} />}
          title="Nome do projeto"
          subtitle="Antes de gerar o resultado final, informe um nome para salvar no histórico do usuário."
        />
        <div className="input-group" style={{ marginBottom: '18px' }}>
          <label>Nome do projeto</label>
          <input
            type="text"
            className="input-field"
            placeholder="Ex: Casa térrea cliente Silva"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            maxLength={120}
          />
        </div>
        <div className="notice-box" style={{ marginBottom: '18px' }}>
          <Info size={16} />
          <span>1 crédito gera 1 projeto com todos os registros salvos atualmente nas ferramentas.</span>
        </div>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <button onClick={onConfirm} className="btn-primary" disabled={loading}>
            {loading ? <span className="loading-spinner" /> : <PlayCircle size={15} />}
            {loading ? 'Gerando projeto...' : 'Gerar projeto'}
          </button>
          <button onClick={onClose} className="btn-secondary" disabled={loading}>Cancelar</button>
        </div>
      </div>
    </div>
  );
}

function ResultRecordCard({ record, toolKey, index }) {
  const resultado = record?.resultado || {};
  const title = record?.registro_nome || `${TOOL_LABELS[toolKey]} ${index + 1}`;

  return (
    <div style={{ background: '#141418', border: '1px solid #2a2a38', borderRadius: '12px', padding: '16px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', marginBottom: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
        <div>
          <strong style={{ color: '#fff' }}>{title}</strong>
          {record?.salvo_em && <div style={{ color: '#606070', fontSize: '0.8rem', marginTop: '4px' }}>Salvo em {new Date(record.salvo_em).toLocaleString('pt-BR')}</div>}
        </div>
        {resultado.norma?.url && (
          <a href={resultado.norma.url} target="_blank" rel="noreferrer" className="btn-secondary" style={{ padding: '8px 12px', fontSize: '0.82rem' }}>
            <ExternalLink size={14} /> Ler a norma
          </a>
        )}
      </div>

      {resultado.norma?.item && (
        <p style={{ color: '#a0a0b0', marginBottom: '12px', lineHeight: 1.6 }}>
          <strong style={{ color: '#fff' }}>Item da norma usado:</strong> {resultado.norma.item}
        </p>
      )}

      {toolKey === 'tomadas' && (
        <>
          <div className="result-grid" style={{ marginBottom: '14px' }}>
            <div className="result-item"><div className="value">{resultado.tug_quantidade_minima}</div><div className="label">TUG mínima</div></div>
            <div className="result-item"><div className="value">{resultado.area} m²</div><div className="label">Área</div></div>
            <div className="result-item"><div className="value">{resultado.perimetro} m</div><div className="label">Perímetro</div></div>
            <div className="result-item"><div className="value">{resultado.tug_carga_total_va} VA</div><div className="label">Carga TUG</div></div>
          </div>
          <p style={{ color: '#a0a0b0', marginBottom: '8px', lineHeight: 1.6 }}><strong style={{ color: '#fff' }}>Regra aplicada:</strong> {resultado.tug_formula}</p>
          <p style={{ color: '#a0a0b0', marginBottom: '8px', lineHeight: 1.6 }}><strong style={{ color: '#fff' }}>Observação TUE:</strong> {resultado.tue_observacao}</p>
          {!!resultado.tue_opcionais?.length && (
            <ul style={{ color: '#a0a0b0', paddingLeft: '20px', lineHeight: 1.8 }}>
              {resultado.tue_opcionais.map((item, idx) => <li key={idx}>{item}</li>)}
            </ul>
          )}
        </>
      )}

      {toolKey === 'materiais' && (
        <>
          <div className="result-grid" style={{ marginBottom: '14px' }}>
            <div className="result-item"><div className="value">{resultado.totais?.tomadas_tug_minimas}</div><div className="label">TUG mínimas</div></div>
            <div className="result-item"><div className="value">{resultado.totais?.pontos_luz_minimos}</div><div className="label">Pontos de luz</div></div>
            <div className="result-item"><div className="value">{resultado.totais?.metros_fio_15_estimados} m</div><div className="label">Fio 1,5 mm²</div></div>
            <div className="result-item"><div className="value">{resultado.totais?.metros_fio_25_estimados} m</div><div className="label">Fio 2,5 mm²</div></div>
          </div>
          <p style={{ color: '#a0a0b0', marginBottom: '12px', lineHeight: 1.6 }}>{resultado.observacao_geral}</p>
          <div style={{ display: 'grid', gap: '10px' }}>
            {(resultado.ambientes || []).map((ambiente, idx) => (
              <div key={idx} style={{ background: '#0f0f14', border: '1px solid #242431', borderRadius: '10px', padding: '12px' }}>
                <strong style={{ color: '#fff', textTransform: 'capitalize' }}>{ambiente.ambiente} — {ambiente.dimensoes}</strong>
                <p style={{ color: '#a0a0b0', marginTop: '6px', lineHeight: 1.6 }}>TUG mínima: <strong style={{ color: '#fff' }}>{ambiente.tomadas_tug_minimas}</strong> • Pontos de luz: <strong style={{ color: '#fff' }}>{ambiente.pontos_luz_minimos}</strong></p>
              </div>
            ))}
          </div>
        </>
      )}

      {toolKey === 'padraoEntrada' && (
        <>
          <div className="result-grid" style={{ marginBottom: '14px' }}>
            <div className="result-item"><div className="value">{resultado.padrao}</div><div className="label">Padrão sugerido</div></div>
            <div className="result-item"><div className="value">{resultado.tensao}</div><div className="label">Tensão</div></div>
            <div className="result-item"><div className="value">{resultado.disjuntor_geral}</div><div className="label">Disjuntor geral</div></div>
            <div className="result-item"><div className="value">{resultado.medidor}</div><div className="label">Medidor</div></div>
          </div>
          <p style={{ color: '#a0a0b0', lineHeight: 1.6 }}>{resultado.descricao}</p>
          <p style={{ color: '#a0a0b0', lineHeight: 1.6, marginTop: '8px' }}>{resultado.norma?.observacao}</p>
        </>
      )}

      {toolKey === 'condutores' && (
        <>
          <div className="result-grid" style={{ marginBottom: '14px' }}>
            <div className="result-item"><div className="value">{resultado.secao_recomendada}</div><div className="label">Seção</div></div>
            <div className="result-item"><div className="value">{resultado.capacidade_conducao}</div><div className="label">Capacidade</div></div>
            <div className="result-item"><div className="value">{resultado.queda_tensao}</div><div className="label">Queda</div></div>
            <div className="result-item"><div className="value">{resultado.queda_percentual}</div><div className="label">Queda %</div></div>
          </div>
          <p style={{ color: resultado.aprovado ? '#4caf82' : '#e0a852', fontWeight: '700', marginBottom: '8px' }}>
            {resultado.aprovado ? 'Resultado aprovado no critério aplicado.' : 'Revise o dimensionamento antes da execução.'}
          </p>
          <p style={{ color: '#a0a0b0', lineHeight: 1.6 }}>{resultado.recomendacao}</p>
        </>
      )}
    </div>
  );
}

export default function Dashboard() {
  const { credits, ilimitado, fetchCredits } = useAuth();
  const navigate = useNavigate();
  const [showPlans, setShowPlans] = useState(false);
  const [savedTools, setSavedTools] = useState({});
  const [currentProject, setCurrentProject] = useState(null);
  const [generating, setGenerating] = useState(false);
  const [downloading, setDownloading] = useState('');
  const [historyProjects, setHistoryProjects] = useState([]);
  const [creditHistory, setCreditHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [projectNameModalOpen, setProjectNameModalOpen] = useState(false);
  const [projectName, setProjectName] = useState('');
  const [openingProjectId, setOpeningProjectId] = useState('');

  const refreshLocalState = () => {
    setSavedTools(getSavedTools());
    setCurrentProject(getLastGeneratedProject());
  };

  const loadRemoteData = async () => {
    setLoadingHistory(true);
    try {
      const [projectsRes, creditsRes] = await Promise.all([
        api.get('/api/projects/history'),
        api.get('/api/credits/historico')
      ]);
      setHistoryProjects(projectsRes.data.projetos || []);
      setCreditHistory(creditsRes.data.historico || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingHistory(false);
    }
  };

  useEffect(() => {
    refreshLocalState();
    loadRemoteData();
  }, []);

  const totalSaved = useMemo(() => countSavedItems(), [savedTools]);
  const generationReady = totalSaved > 0;

  const handleToolClick = (tool) => navigate(tool.rota);

  const handleClearAllSaved = () => {
    clearAllToolDrafts();
    refreshLocalState();
    toast.success('Todos os registros locais foram removidos.');
  };

  const handleClearProjectView = () => {
    clearLastGeneratedProject();
    setCurrentProject(null);
    toast.success('Projeto exibido removido da tela inicial.');
  };

  const openGenerateModal = () => {
    const ferramentas = getSavedToolsForApi();
    if (!Object.keys(ferramentas).length) {
      toast.error('Salve pelo menos um registro em alguma ferramenta antes de gerar.');
      return;
    }
    if (!ilimitado && credits <= 0) {
      setShowPlans(true);
      return;
    }
    setProjectName('');
    setProjectNameModalOpen(true);
  };

  const handleConfirmGenerate = async () => {
    const nome = projectName.trim();
    if (!nome) {
      toast.error('Informe um nome para o projeto.');
      return;
    }

    const ferramentas = getSavedToolsForApi();
    if (!Object.keys(ferramentas).length) {
      toast.error('Nenhum registro salvo para gerar.');
      return;
    }

    setGenerating(true);
    try {
      const res = await api.post('/api/projects/generate', { nome_projeto: nome, ferramentas });
      const report = { projeto_id: res.data.projeto?.id, ...res.data.relatorio };
      setCurrentProject(report);
      saveLastGeneratedProject(report);
      clearAllToolDrafts();
      refreshLocalState();
      await Promise.all([fetchCredits(), loadRemoteData()]);
      setProjectNameModalOpen(false);
      toast.success('Projeto gerado e salvo no histórico com sucesso!');
    } catch (err) {
      if (err.response?.data?.semCreditos) {
        setShowPlans(true);
      } else {
        toast.error(err.response?.data?.error || 'Erro ao gerar projeto.');
      }
    } finally {
      setGenerating(false);
    }
  };

  const handleOpenHistoryProject = async (projectId) => {
    setOpeningProjectId(projectId);
    try {
      const res = await api.get(`/api/projects/${projectId}`);
      const report = { projeto_id: res.data.projeto.id, ...res.data.projeto.resultados };
      setCurrentProject(report);
      saveLastGeneratedProject(report);
      toast.success('Projeto carregado do histórico.');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Erro ao abrir projeto.');
    } finally {
      setOpeningProjectId('');
    }
  };

  const handleDownload = async (type) => {
    if (!currentProject) {
      toast.error('Selecione ou gere um projeto antes de baixar.');
      return;
    }

    setDownloading(type);
    try {
      if (type === 'pdf') await exportReportAsPdf(currentProject);
      else await exportReportAsDocx(currentProject);
      toast.success(`Download em ${type.toUpperCase()} iniciado.`);
    } catch {
      toast.error('Não foi possível gerar o arquivo para download.');
    } finally {
      setDownloading('');
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#0d0d0f' }}>
      {showPlans && <PlansModal onClose={() => setShowPlans(false)} />}
      <ProjectNameModal
        open={projectNameModalOpen}
        value={projectName}
        onChange={setProjectName}
        onClose={() => setProjectNameModalOpen(false)}
        onConfirm={handleConfirmGenerate}
        loading={generating}
      />

      <div style={{ background: 'linear-gradient(135deg, #0d0d0f 0%, #111120 50%, #141428 100%)', borderBottom: '1px solid #1e1e2e', padding: '40px 24px 32px', textAlign: 'center' }}>
        <h1 style={{ fontSize: '1.6rem', fontWeight: '800', color: '#fff', marginBottom: '8px' }}>Instalações Elétricas Residenciais</h1>
        <p style={{ color: '#606070', fontSize: '0.95rem', maxWidth: '720px', margin: '0 auto' }}>
          Agora você pode salvar vários registros em cada ferramenta, sem limite, e só depois gerar tudo junto em um projeto nomeado.
        </p>

        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', background: ilimitado ? 'rgba(76,175,130,0.08)' : credits === 0 ? 'rgba(224,82,82,0.08)' : 'rgba(74,127,165,0.08)', border: `1px solid ${ilimitado ? 'rgba(76,175,130,0.3)' : credits === 0 ? 'rgba(224,82,82,0.3)' : 'rgba(74,127,165,0.3)'}`, borderRadius: '30px', padding: '10px 20px', marginTop: '20px' }}>
          {ilimitado ? <Infinity size={16} style={{ color: '#4caf82' }} /> : <Zap size={16} style={{ color: credits === 0 ? '#e05252' : '#6ba3cc' }} />}
          <span style={{ color: ilimitado ? '#4caf82' : credits === 0 ? '#e05252' : '#6ba3cc', fontWeight: '600', fontSize: '0.9rem' }}>
            {ilimitado ? 'Plano ilimitado ativo' : credits === 1 ? '1 crédito disponível para gerar projeto' : `${credits} créditos disponíveis para gerar projetos`}
          </span>
        </div>
      </div>

      <div style={{ maxWidth: '1180px', margin: '0 auto', padding: '32px 24px 48px' }}>
        <div className="card" style={{ marginBottom: '28px' }}>
          <SectionHeader
            icon={<Save size={18} style={{ color: '#6ba3cc' }} />}
            title="Fluxo do novo sistema"
            subtitle="1) Abra as ferramentas, 2) salve quantos registros quiser, 3) volte aqui, informe o nome do projeto e 4) gere o resultado final."
            action={generationReady ? (
              <button onClick={handleClearAllSaved} className="btn-secondary" style={{ padding: '8px 12px', fontSize: '0.82rem' }}>
                <Trash2 size={14} /> Limpar registros locais
              </button>
            ) : null}
          />

          <div className="result-grid" style={{ marginBottom: '18px' }}>
            <div className="result-item"><div className="value">{totalSaved}</div><div className="label">Itens salvos no total</div></div>
            <div className="result-item"><div className="value">{Object.keys(savedTools).filter((key) => (savedTools[key] || []).length).length}</div><div className="label">Ferramentas com dados</div></div>
            <div className="result-item"><div className="value">{currentProject ? 'Sim' : 'Não'}</div><div className="label">Projeto exibido</div></div>
            <div className="result-item"><div className="value">{ilimitado ? 'Ilimitado' : '1 crédito'}</div><div className="label">Consumo por geração</div></div>
          </div>

          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <button onClick={openGenerateModal} className="btn-primary" disabled={generating}>
              {generating ? <span className="loading-spinner" /> : <PlayCircle size={16} />}
              {generating ? 'Gerando projeto...' : 'Gerar projeto com tudo salvo'}
            </button>
            {currentProject && (
              <button onClick={handleClearProjectView} className="btn-secondary">
                <Trash2 size={14} /> Limpar projeto exibido
              </button>
            )}
          </div>
        </div>

        <SectionHeader
          icon={<Clock3 size={18} style={{ color: '#6ba3cc' }} />}
          title="Ferramentas disponíveis"
          subtitle="As quatro calculadoras abaixo aceitam múltiplos registros e entram no projeto final. Dicionário e luminárias continuam como consulta livre."
        />

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px', marginBottom: '32px' }}>
          {TOOLS.map((tool) => {
            const count = tool.saveDriven ? getToolSavedCount(tool.id) : 0;
            return (
              <div
                key={tool.id}
                onClick={() => handleToolClick(tool)}
                style={{
                  background: '#141418', border: '1px solid #2a2a38', borderRadius: '12px', padding: '24px', cursor: 'pointer', transition: 'all 0.25s ease', position: 'relative', overflow: 'hidden'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = tool.cor;
                  e.currentTarget.style.background = '#1a1a22';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = '#2a2a38';
                  e.currentTarget.style.background = '#141418';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2px', background: `linear-gradient(90deg, transparent, ${tool.cor}, transparent)`, opacity: 0.6 }} />
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '10px', marginBottom: '16px' }}>
                  <div style={{ width: '52px', height: '52px', background: `${tool.cor}18`, border: `1px solid ${tool.cor}30`, borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: tool.cor, flexShrink: 0 }}>{tool.icon}</div>
                  <span style={{ fontSize: '0.7rem', fontWeight: '600', color: tool.cor, background: `${tool.cor}15`, border: `1px solid ${tool.cor}30`, padding: '3px 8px', borderRadius: '10px' }}>{tool.tag}</span>
                </div>

                <h3 style={{ fontSize: '1rem', fontWeight: '700', marginBottom: '8px', color: '#e8e8f0' }}>{tool.nome}</h3>
                <p style={{ color: '#606070', fontSize: '0.85rem', lineHeight: '1.5', marginBottom: '14px' }}>{tool.descricao}</p>
                {tool.saveDriven ? <ToolCountBadge count={count} /> : <span className="badge badge-blue">Acesso imediato</span>}

                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: tool.cor, fontSize: '0.85rem', fontWeight: '600', marginTop: '16px' }}>
                  <span>Abrir ferramenta</span>
                  <ChevronRight size={14} />
                </div>
              </div>
            );
          })}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '18px', alignItems: 'start', marginBottom: '32px' }}>
          <div className="card">
            <SectionHeader
              icon={<History size={18} style={{ color: '#6ba3cc' }} />}
              title="Histórico de projetos"
              subtitle="Todo projeto gerado fica salvo por usuário e pode ser reaberto a qualquer momento."
            />

            {loadingHistory ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#606070' }}>
                <span className="loading-spinner" /> Carregando histórico...
              </div>
            ) : !historyProjects.length ? (
              <p style={{ color: '#606070' }}>Nenhum projeto gerado ainda.</p>
            ) : (
              <div style={{ display: 'grid', gap: '12px' }}>
                {historyProjects.map((project) => (
                  <div key={project.id} style={{ background: '#141418', border: '1px solid #2a2a38', borderRadius: '12px', padding: '16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap', alignItems: 'flex-start' }}>
                      <div>
                        <strong style={{ color: '#fff', fontSize: '0.96rem' }}>{project.nome}</strong>
                        <div style={{ color: '#606070', fontSize: '0.8rem', marginTop: '6px' }}>
                          Gerado em {new Date(project.ultima_geracao_em || project.created_at).toLocaleString('pt-BR')}
                        </div>
                      </div>
                      <button onClick={() => handleOpenHistoryProject(project.id)} className="btn-secondary" style={{ padding: '8px 12px', fontSize: '0.82rem' }} disabled={openingProjectId === project.id}>
                        {openingProjectId === project.id ? <span className="loading-spinner" /> : <Eye size={14} />}
                        {openingProjectId === project.id ? 'Abrindo...' : 'Ver resultado'}
                      </button>
                    </div>
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '12px' }}>
                      <span className="badge badge-blue">{project.total_registros} registro{project.total_registros > 1 ? 's' : ''}</span>
                      <span className="badge badge-neutral">{project.total_ferramentas} ferramenta{project.total_ferramentas > 1 ? 's' : ''}</span>
                      <span className="badge badge-green">{project.creditos_consumidos} crédito{project.creditos_consumidos > 1 ? 's' : ''}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="card">
            <SectionHeader
              icon={<Wallet size={18} style={{ color: '#6ba3cc' }} />}
              title="Histórico de créditos"
              subtitle="Cada uso mostra o antes e o depois do saldo."
            />

            {!creditHistory.length ? (
              <p style={{ color: '#606070' }}>Nenhum consumo de crédito registrado ainda.</p>
            ) : (
              <div style={{ display: 'grid', gap: '10px' }}>
                {creditHistory.slice(0, 8).map((item) => (
                  <div key={item.id} style={{ background: '#141418', border: '1px solid #2a2a38', borderRadius: '10px', padding: '12px 14px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', marginBottom: '6px', flexWrap: 'wrap' }}>
                      <strong style={{ color: '#fff', fontSize: '0.9rem' }}>{item.tipo || 'Uso de crédito'}</strong>
                      <span className={`badge ${item.saldo_depois > 0 || ilimitado ? 'badge-green' : 'badge-red'}`}>
                        {ilimitado ? 'Ilimitado' : `${item.saldo_antes} → ${item.saldo_depois}`}
                      </span>
                    </div>
                    <p style={{ color: '#606070', fontSize: '0.8rem' }}>{new Date(item.created_at).toLocaleString('pt-BR')}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {currentProject && (
          <div className="card">
            <SectionHeader
              icon={<Layers3 size={18} style={{ color: '#6ba3cc' }} />}
              title={currentProject.nome_projeto || 'Projeto gerado'}
              subtitle={`Gerado em ${new Date(currentProject.gerado_em).toLocaleString('pt-BR')} • ${currentProject.total_registros} registro(s) processado(s)`}
              action={(
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  <button onClick={() => handleDownload('pdf')} className="btn-secondary" style={{ padding: '8px 12px', fontSize: '0.82rem' }} disabled={downloading === 'pdf'}>
                    {downloading === 'pdf' ? <span className="loading-spinner" /> : <Download size={14} />}
                    PDF
                  </button>
                  <button onClick={() => handleDownload('docx')} className="btn-secondary" style={{ padding: '8px 12px', fontSize: '0.82rem' }} disabled={downloading === 'docx'}>
                    {downloading === 'docx' ? <span className="loading-spinner" /> : <FileText size={14} />}
                    DOCX
                  </button>
                </div>
              )}
            />

            <div className="result-grid" style={{ marginBottom: '20px' }}>
              <div className="result-item"><div className="value">{currentProject.total_registros}</div><div className="label">Registros processados</div></div>
              <div className="result-item"><div className="value">{currentProject.total_ferramentas}</div><div className="label">Ferramentas usadas</div></div>
              <div className="result-item"><div className="value">{currentProject.creditos_consumidos}</div><div className="label">Créditos consumidos</div></div>
              <div className="result-item"><div className="value">{currentProject.projeto_id ? 'Salvo' : 'Local'}</div><div className="label">Status</div></div>
            </div>

            <div style={{ display: 'grid', gap: '18px' }}>
              {Object.entries(currentProject.resultados || {}).map(([toolKey, records]) => (
                <div key={toolKey}>
                  <SectionHeader
                    icon={<File size={16} style={{ color: '#6ba3cc' }} />}
                    title={TOOL_LABELS[toolKey] || toolKey}
                    subtitle={`${records.length} resultado(s) gerado(s) para esta ferramenta.`}
                  />
                  <div style={{ display: 'grid', gap: '12px' }}>
                    {records.map((record, index) => (
                      <ResultRecordCard key={record.registro_id || `${toolKey}-${index}`} record={record} toolKey={toolKey} index={index} />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
