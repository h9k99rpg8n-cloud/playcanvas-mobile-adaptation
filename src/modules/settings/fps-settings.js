function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

export function projectMatchesFpsSearch(project, query) {
  const cleanQuery = query.trim().toLowerCase();
  if (!cleanQuery) return true;
  return [project.name, project.description, project.template]
    .filter(Boolean)
    .some((value) => String(value).toLowerCase().includes(cleanQuery));
}

export function isProjectFpsEnabled(project) {
  return Boolean(project.settings?.showFps);
}

export function renderFpsProjectPicker(projects, query = '') {
  const filtered = projects.filter((project) => projectMatchesFpsSearch(project, query));

  if (projects.length === 0) {
    return '<p class="hub-muted">Crea un proyecto para configurar el contador FPS.</p>';
  }

  if (filtered.length === 0) {
    return '<p class="hub-muted">No se encontraron proyectos con esa búsqueda.</p>';
  }

  return filtered.map((project) => `
    <label class="fps-project-option">
      <input type="checkbox" data-fps-project-id="${escapeHtml(project.id)}" ${isProjectFpsEnabled(project) ? 'checked' : ''} />
      <span>
        <strong>${escapeHtml(project.name)}</strong>
        <small>${escapeHtml(project.template || 'Plantilla 3D')} · ${escapeHtml(project.editorVersion || 'Atlas')}</small>
      </span>
    </label>
  `).join('');
}
