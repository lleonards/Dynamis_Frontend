import React from 'react';
import { HelpCircle, Wrench, Home, Sparkles, BookOpen, X } from 'lucide-react';

const GUIDE_STEPS = [
  {
    icon: Wrench,
    title: '1. Preencha as ferramentas',
    description: 'O usuário usa as ferramentas da Dynamis, informa os dados e adiciona tudo o que precisar em cada etapa.'
  },
  {
    icon: Home,
    title: '2. Volte para a tela inicial',
    description: 'Depois de usar as ferramentas, basta retornar para a tela principal para revisar o que foi preenchido.'
  },
  {
    icon: Sparkles,
    title: '3. Gere o resultado final',
    description: 'Na tela inicial, clique para gerar o resultado com base em todas as ferramentas utilizadas no projeto.'
  },
  {
    icon: BookOpen,
    title: '4. Consulte a norma aplicada',
    description: 'No resultado, a Dynamis mostra a norma utilizada e também o link para leitura e conferência da referência normativa.'
  }
];

export default function HelpGuideModal({ open, onClose }) {
  if (!open) return null;

  return (
    <div className="help-modal-overlay" onClick={onClose}>
      <div className="help-modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="help-modal-header">
          <div>
            <div className="help-modal-badge">
              <HelpCircle size={16} />
              <span>Guia rápido</span>
            </div>
            <h2>Como funciona a Dynamis</h2>
            <p>
              A Dynamis foi pensada para ser simples: você alimenta as ferramentas,
              volta para a tela inicial e gera um resultado consolidado com base no que utilizou.
            </p>
          </div>

          <button type="button" className="help-modal-close" onClick={onClose} aria-label="Fechar ajuda">
            <X size={18} />
          </button>
        </div>

        <div className="help-guide-grid">
          {GUIDE_STEPS.map(({ icon: Icon, title, description }) => (
            <div key={title} className="help-guide-item">
              <div className="help-guide-icon">
                <Icon size={18} />
              </div>
              <div>
                <h3>{title}</h3>
                <p>{description}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="help-guide-footer">
          <strong>Resumo:</strong>
          <span>
            preencher dados → usar ferramentas → voltar para a tela inicial → gerar resultado → visualizar norma e link de leitura.
          </span>
        </div>
      </div>
    </div>
  );
}
