const SAVED_TOOLS_KEY = 'dynamis_saved_tools';
const REPORT_KEY = 'dynamis_generated_report';

export const TOOL_LABELS = {
  materiais: 'Calculadora de Materiais',
  tomadas: 'Dimensionamento de Tomadas',
  padraoEntrada: 'Padrão de Entrada',
  condutores: 'Dimensionamento de Condutores'
};

export function getSavedTools() {
  try {
    const raw = localStorage.getItem(SAVED_TOOLS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function saveToolDraft(toolId, data) {
  const current = getSavedTools();
  const next = {
    ...current,
    [toolId]: {
      data,
      savedAt: new Date().toISOString()
    }
  };
  localStorage.setItem(SAVED_TOOLS_KEY, JSON.stringify(next));
  return next;
}

export function removeToolDraft(toolId) {
  const current = getSavedTools();
  delete current[toolId];
  localStorage.setItem(SAVED_TOOLS_KEY, JSON.stringify(current));
  return current;
}

export function clearAllToolDrafts() {
  localStorage.removeItem(SAVED_TOOLS_KEY);
}

export function getSavedTool(toolId) {
  const all = getSavedTools();
  return all[toolId]?.data || null;
}

export function getSavedToolsForApi() {
  const all = getSavedTools();
  return Object.entries(all).reduce((acc, [key, value]) => {
    acc[key] = value.data;
    return acc;
  }, {});
}

export function saveGeneratedReport(report) {
  localStorage.setItem(REPORT_KEY, JSON.stringify(report));
}

export function getGeneratedReport() {
  try {
    const raw = localStorage.getItem(REPORT_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function clearGeneratedReport() {
  localStorage.removeItem(REPORT_KEY);
}
