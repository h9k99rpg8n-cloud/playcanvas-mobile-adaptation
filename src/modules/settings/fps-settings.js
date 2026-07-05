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
      <input type="checkbox" data-fps-project-id="${project.id}" ${isProjectFpsEnabled(project) ? 'checked' : ''} />
      <span>
        <strong>${project.name}</strong>
        <small>${project.template || 'Plantilla 3D'} · ${project.editorVersion || 'Atlas'}</small>
      </span>
    </label>
  `).join('');
}
