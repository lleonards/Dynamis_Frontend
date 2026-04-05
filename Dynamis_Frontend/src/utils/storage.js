const SAVED_TOOLS_KEY = 'dynamis_saved_tools_v2';
const LAST_PROJECT_KEY = 'dynamis_last_project_v2';

export const TOOL_LABELS = {
  materiais: 'Calculadora de Materiais',
  tomadas: 'Dimensionamento de Tomadas',
  padraoEntrada: 'Padrão de Entrada',
  condutores: 'Dimensionamento de Condutores'
};

function generateId() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `item-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function normalize(data) {
  if (!data || typeof data !== 'object') return {};
  return { ...data };
}

export function getSavedTools() {
  try {
    const raw = localStorage.getItem(SAVED_TOOLS_KEY);
    const parsed = raw ? JSON.parse(raw) : {};
    return Object.entries(parsed).reduce((acc, [key, value]) => {
      acc[key] = Array.isArray(value) ? value : [];
      return acc;
    }, {});
  } catch {
    return {};
  }
}

export function getToolEntries(toolId) {
  const all = getSavedTools();
  return Array.isArray(all[toolId]) ? all[toolId] : [];
}

export function getToolSavedCount(toolId) {
  return getToolEntries(toolId).length;
}

export function countSavedItems() {
  const all = getSavedTools();
  return Object.values(all).reduce((acc, items) => acc + (Array.isArray(items) ? items.length : 0), 0);
}

export function saveToolEntry(toolId, data, label, entryId = null) {
  const all = getSavedTools();
  const current = getToolEntries(toolId);
  const safeLabel = String(label || '').trim() || `${TOOL_LABELS[toolId] || toolId}`;

  let next;
  if (entryId) {
    next = current.map((item) => item.id === entryId ? {
      ...item,
      label: safeLabel,
      data: normalize(data),
      savedAt: new Date().toISOString()
    } : item);
  } else {
    next = [...current, {
      id: generateId(),
      label: safeLabel,
      data: normalize(data),
      savedAt: new Date().toISOString()
    }];
  }

  const updated = { ...all, [toolId]: next };
  localStorage.setItem(SAVED_TOOLS_KEY, JSON.stringify(updated));
  return next;
}

export function removeToolEntry(toolId, entryId) {
  const all = getSavedTools();
  const next = getToolEntries(toolId).filter((item) => item.id !== entryId);
  const updated = { ...all, [toolId]: next };
  localStorage.setItem(SAVED_TOOLS_KEY, JSON.stringify(updated));
  return next;
}

export function clearToolEntries(toolId) {
  const all = getSavedTools();
  const updated = { ...all, [toolId]: [] };
  localStorage.setItem(SAVED_TOOLS_KEY, JSON.stringify(updated));
  return updated;
}

export function clearAllToolDrafts() {
  localStorage.removeItem(SAVED_TOOLS_KEY);
}

export function getSavedToolsForApi() {
  const all = getSavedTools();
  return Object.entries(all).reduce((acc, [key, items]) => {
    if (Array.isArray(items) && items.length) {
      acc[key] = items.map((item) => ({
        id: item.id,
        label: item.label,
        savedAt: item.savedAt,
        data: item.data
      }));
    }
    return acc;
  }, {});
}

export function saveLastGeneratedProject(project) {
  localStorage.setItem(LAST_PROJECT_KEY, JSON.stringify(project));
}

export function getLastGeneratedProject() {
  try {
    const raw = localStorage.getItem(LAST_PROJECT_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function clearLastGeneratedProject() {
  localStorage.removeItem(LAST_PROJECT_KEY);
}
