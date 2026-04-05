import jsPDF from 'jspdf';
import { Document, Packer, Paragraph, TextRun, HeadingLevel, ExternalHyperlink } from 'docx';

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

function buildSections(report) {
  const sections = [];
  const resultados = report?.resultados || {};

  sections.push({
    title: 'Resumo geral',
    lines: [
      `Data de geração: ${formatDate(report?.gerado_em)}`,
      `Ferramentas geradas: ${(report?.ferramentas_geradas || []).join(', ') || '-'}`,
      report?.observacao_geral || ''
    ]
  });

  if (resultados.tomadas) {
    const item = resultados.tomadas;
    sections.push({
      title: 'Dimensionamento de tomadas',
      linkLabel: item.norma?.titulo,
      linkUrl: item.norma?.url,
      lines: [
        `Ambiente: ${item.ambiente}`,
        `Área: ${item.area} m²`,
        `Perímetro: ${item.perimetro} m`,
        `TUG mínima: ${item.tug_quantidade_minima}`,
        `Critério: ${item.tug_formula}`,
        `TUE: opcional quando houver equipamento específico previsto.`,
        ...(item.tue_opcionais || []).map(entry => `Sugestão de TUE: ${entry}`)
      ]
    });
  }

  if (resultados.materiais) {
    const item = resultados.materiais;
    sections.push({
      title: 'Materiais mínimos estimados',
      linkLabel: item.norma?.titulo,
      linkUrl: item.norma?.url,
      lines: [
        `TUG mínimas: ${item.totais?.tomadas_tug_minimas ?? 0}`,
        `Pontos de luz mínimos: ${item.totais?.pontos_luz_minimos ?? 0}`,
        `Carga total TUG: ${item.totais?.carga_tug_va ?? 0} VA`,
        `Carga total de iluminação: ${item.totais?.carga_iluminacao_va ?? 0} VA`,
        `Fio 1,5 mm² estimado: ${item.totais?.metros_fio_15_estimados ?? 0} m`,
        `Fio 2,5 mm² estimado: ${item.totais?.metros_fio_25_estimados ?? 0} m`,
        item.observacao_geral || ''
      ]
    });
  }

  if (resultados.padraoEntrada) {
    const item = resultados.padraoEntrada;
    sections.push({
      title: 'Padrão de entrada',
      linkLabel: item.norma?.titulo,
      linkUrl: item.norma?.url,
      lines: [
        `Padrão sugerido: ${item.padrao}`,
        `Tensão: ${item.tensao}`,
        `Potência instalada: ${item.potencia_instalada} W`,
        `Potência de projeto: ${item.potencia_projeto} W`,
        `Disjuntor geral: ${item.disjuntor_geral}`,
        `Medidor: ${item.medidor}`,
        item.norma?.observacao || ''
      ]
    });
  }

  if (resultados.condutores) {
    const item = resultados.condutores;
    sections.push({
      title: 'Dimensionamento de condutores',
      linkLabel: item.norma?.titulo,
      linkUrl: item.norma?.url,
      lines: [
        `Seção recomendada: ${item.secao_recomendada}`,
        `Capacidade de condução: ${item.capacidade_conducao}`,
        `Queda de tensão: ${item.queda_tensao}`,
        `Queda percentual: ${item.queda_percentual}`,
        `Resultado: ${item.aprovado ? 'Aprovado' : 'Revisar dimensionamento'}`,
        item.recomendacao || ''
      ]
    });
  }

  return sections;
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

  sections.forEach(section => {
    children.push(heading(section.title, HeadingLevel.HEADING_1));
    section.lines.forEach(text => children.push(line(text)));
    if (section.linkLabel && section.linkUrl) {
      children.push(new Paragraph({
        children: [
          new TextRun('Leitura da referência: '),
          new ExternalHyperlink({
            link: section.linkUrl,
            children: [
              new TextRun({ text: section.linkLabel, style: 'Hyperlink' })
            ]
          })
        ]
      }));
    }
    children.push(line(''));
  });

  const doc = new Document({
    sections: [{ children }]
  });

  const blob = await Packer.toBlob(doc);
  triggerDownload(blob, 'relatorio-dynamis.docx');
}

export async function exportReportAsPdf(report) {
  const doc = new jsPDF({ unit: 'pt', format: 'a4' });
  const sections = buildSections(report);
  const pageWidth = doc.internal.pageSize.getWidth();
  const maxWidth = pageWidth - 80;
  let y = 50;

  const addWrappedText = (text, size = 11, color = '#222222', gap = 16) => {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(size);
    doc.setTextColor(color);
    const lines = doc.splitTextToSize(text, maxWidth);
    doc.text(lines, 40, y);
    y += lines.length * (size + 4) + gap;
    if (y > 760) {
      doc.addPage();
      y = 50;
    }
  };

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(20);
  doc.text('Relatório Dynamis', 40, y);
  y += 28;

  sections.forEach(section => {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(15);
    doc.setTextColor('#0f172a');
    doc.text(section.title, 40, y);
    y += 20;
    section.lines.forEach(text => addWrappedText(`• ${text}`));
    if (section.linkLabel && section.linkUrl) {
      addWrappedText(`Referência: ${section.linkLabel} - ${section.linkUrl}`, 10, '#1d4ed8', 22);
    }
  });

  doc.save('relatorio-dynamis.pdf');
}
