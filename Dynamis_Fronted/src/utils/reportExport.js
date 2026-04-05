import jsPDF from 'jspdf';
import { Document, Packer, Paragraph, TextRun, HeadingLevel, ExternalHyperlink } from 'docx';
import { TOOL_LABELS } from './storage';

function line(text = '') {
  return new Paragraph({ children: [new TextRun(text)] });
}

function heading(text, level = HeadingLevel.HEADING_1) {
  return new Paragraph({ text, heading: level });
}

function formatDate(value) {
  if (!value) return '-';
  try {
    return new Date(value).toLocaleString('pt-BR');
  } catch {
    return String(value);
  }
}

function getToolSections(report) {
  const resultados = report?.resultados || {};
  const sections = [];

  Object.entries(resultados).forEach(([toolKey, registros]) => {
    if (!Array.isArray(registros) || !registros.length) return;

    registros.forEach((registro, index) => {
      const resultado = registro.resultado || {};
      const nomeBase = registro.registro_nome || `${TOOL_LABELS[toolKey] || toolKey} ${index + 1}`;

      if (toolKey === 'tomadas') {
        sections.push({
          title: `${TOOL_LABELS[toolKey]} • ${nomeBase}`,
          linkLabel: resultado.norma?.titulo,
          linkUrl: resultado.norma?.url,
          lines: [
            `Ambiente: ${resultado.ambiente}`,
            `Área: ${resultado.area} m²`,
            `Perímetro: ${resultado.perimetro} m`,
            `TUG mínima: ${resultado.tug_quantidade_minima}`,
            `Critério: ${resultado.tug_formula}`,
            `Observação TUE: ${resultado.tue_observacao}`,
            ...(resultado.tue_opcionais || []).map((entry) => `Sugestão de TUE: ${entry}`)
          ]
        });
      }

      if (toolKey === 'materiais') {
        sections.push({
          title: `${TOOL_LABELS[toolKey]} • ${nomeBase}`,
          linkLabel: resultado.norma?.titulo,
          linkUrl: resultado.norma?.url,
          lines: [
            `TUG mínimas: ${resultado.totais?.tomadas_tug_minimas ?? 0}`,
            `Pontos de luz mínimos: ${resultado.totais?.pontos_luz_minimos ?? 0}`,
            `Carga total TUG: ${resultado.totais?.carga_tug_va ?? 0} VA`,
            `Carga total de iluminação: ${resultado.totais?.carga_iluminacao_va ?? 0} VA`,
            `Fio 1,5 mm² estimado: ${resultado.totais?.metros_fio_15_estimados ?? 0} m`,
            `Fio 2,5 mm² estimado: ${resultado.totais?.metros_fio_25_estimados ?? 0} m`,
            resultado.observacao_geral || ''
          ]
        });
      }

      if (toolKey === 'padraoEntrada') {
        sections.push({
          title: `${TOOL_LABELS[toolKey]} • ${nomeBase}`,
          linkLabel: resultado.norma?.titulo,
          linkUrl: resultado.norma?.url,
          lines: [
            `Padrão sugerido: ${resultado.padrao}`,
            `Tensão: ${resultado.tensao}`,
            `Potência instalada: ${resultado.potencia_instalada} W`,
            `Potência de projeto: ${resultado.potencia_projeto} W`,
            `Disjuntor geral: ${resultado.disjuntor_geral}`,
            `Medidor: ${resultado.medidor}`,
            resultado.norma?.observacao || ''
          ]
        });
      }

      if (toolKey === 'condutores') {
        sections.push({
          title: `${TOOL_LABELS[toolKey]} • ${nomeBase}`,
          linkLabel: resultado.norma?.titulo,
          linkUrl: resultado.norma?.url,
          lines: [
            `Seção recomendada: ${resultado.secao_recomendada}`,
            `Capacidade de condução: ${resultado.capacidade_conducao}`,
            `Queda de tensão: ${resultado.queda_tensao}`,
            `Queda percentual: ${resultado.queda_percentual}`,
            `Resultado: ${resultado.aprovado ? 'Aprovado' : 'Revisar dimensionamento'}`,
            resultado.recomendacao || ''
          ]
        });
      }
    });
  });

  return sections;
}

function buildSections(report) {
  const sections = [];

  sections.push({
    title: 'Resumo geral',
    lines: [
      `Projeto: ${report?.nome_projeto || '-'}`,
      `Data de geração: ${formatDate(report?.gerado_em)}`,
      `Ferramentas geradas: ${(report?.ferramentas_geradas || []).map((item) => `${item.nome} (${item.quantidade})`).join(', ') || '-'}`,
      `Total de registros processados: ${report?.total_registros || 0}`,
      report?.observacao_geral || ''
    ]
  });

  return [...sections, ...getToolSections(report)];
}

function triggerDownload(blob, fileName) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

export async function exportReportAsDocx(report) {
  const sections = buildSections(report);
  const children = [heading('Relatório Dynamis', HeadingLevel.TITLE)];

  sections.forEach((section) => {
    children.push(heading(section.title, HeadingLevel.HEADING_1));
    section.lines.forEach((text) => text && children.push(line(text)));
    if (section.linkLabel && section.linkUrl) {
      children.push(new Paragraph({
        children: [
          new TextRun('Leitura da referência: '),
          new ExternalHyperlink({
            link: section.linkUrl,
            children: [new TextRun({ text: section.linkLabel, style: 'Hyperlink' })]
          })
        ]
      }));
    }
    children.push(line(''));
  });

  const doc = new Document({ sections: [{ children }] });
  const blob = await Packer.toBlob(doc);
  const safeName = (report?.nome_projeto || 'relatorio-dynamis').replace(/[^a-z0-9-_]+/gi, '-').toLowerCase();
  triggerDownload(blob, `${safeName}.docx`);
}

export async function exportReportAsPdf(report) {
  const doc = new jsPDF({ unit: 'pt', format: 'a4' });
  const sections = buildSections(report);
  const pageWidth = doc.internal.pageSize.getWidth();
  const maxWidth = pageWidth - 80;
  let y = 50;

  const ensurePage = () => {
    if (y > 760) {
      doc.addPage();
      y = 50;
    }
  };

  const addWrappedText = (text, size = 11, color = '#222222', gap = 16) => {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(size);
    doc.setTextColor(color);
    const lines = doc.splitTextToSize(text, maxWidth);
    doc.text(lines, 40, y);
    y += lines.length * (size + 4) + gap;
    ensurePage();
  };

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(20);
  doc.text('Relatório Dynamis', 40, y);
  y += 28;

  sections.forEach((section) => {
    ensurePage();
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(15);
    doc.setTextColor('#0f172a');
    doc.text(section.title, 40, y);
    y += 20;
    section.lines.forEach((text) => text && addWrappedText(`• ${text}`));
    if (section.linkLabel && section.linkUrl) {
      addWrappedText(`Referência: ${section.linkLabel} - ${section.linkUrl}`, 10, '#1d4ed8', 22);
    }
  });

  const safeName = (report?.nome_projeto || 'relatorio-dynamis').replace(/[^a-z0-9-_]+/gi, '-').toLowerCase();
  doc.save(`${safeName}.pdf`);
}
