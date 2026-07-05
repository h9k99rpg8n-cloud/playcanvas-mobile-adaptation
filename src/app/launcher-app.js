import { readStorage } from '../core/storage.js';
import { ATLAS_ENGINE_LABEL, ATLAS_LAUNCHER_VERSION, ATLAS_UPDATE_SUMMARY } from '../core/version.js';

const $ = (id) => document.getElementById(id);
const menuToggle = $('launcherMenuToggle');
const views = Array.from(document.querySelectorAll('[data-launcher-view]'));
const navButtons = Array.from(document.querySelectorAll('[data-launcher-target]'));
const projectsList = $('launcherProjectsList');
const updatesList = $('launcherUpdatesList');
const projectCount = $('launcherProjectCount');

function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function getProjects() {
  return readStorage('projects', []);
}

function closeMenu() {
  if (menuToggle) menuToggle.checked = false;
}

function showView(viewId) {
  views.forEach((view) => {
    view.classList.toggle('active', view.dataset.launcherView === viewId);
  });

  navButtons.forEach((button) => {
    button.classList.toggle('active', button.dataset.launcherTarget === viewId);
  });

  closeMenu();
}

function renderProjects() {
  const projects = getProjects();
  if (projectCount) projectCount.textContent = String(projects.length);

  if (!projectsList) return;

  if (projects.length === 0) {
    projectsList.innerHTML = `
      <article class="atlas-project-empty-card">
        <span>◇</span>
        <h3>No hay proyectos todavía</h3>
        <p>Crea un nuevo proyecto para comenzar a construir mundos 3D desde Atlas.</p>
        <a class="primary-button" href="projects.html">Crear nuevo proyecto</a>
      </article>
    `;
    return;
  }

  projectsList.innerHTML = projects.slice(0, 6).map((project) => {
    const icon = project.projectIcon
      ? `<img src="${project.projectIcon}" alt="" />`
      : `<span>${escapeHtml(project.templateIcon || '◇')}</span>`;

    return `
      <article class="atlas-project-card">
        <div class="atlas-project-icon">${icon}</div>
        <div class="atlas-project-info">
          <h3>${escapeHtml(project.name)}</h3>
          <p>${escapeHtml(project.description || project.template || 'Proyecto 3D')}</p>
          <div class="atlas-project-data">
            <small>Creado: ${escapeHtml(project.createdAt || 'Sin fecha')}</small>
            <small>Última revisión: ${escapeHtml(project.updatedAt || 'Sin fecha')}</small>
            <small>Versión: ${escapeHtml(project.editorVersion || ATLAS_ENGINE_LABEL)}</small>
          </div>
        </div>
        <a class="atlas-open-project" href="scene-editor.html?project=${encodeURIComponent(project.id)}">Abrir</a>
      </article>
    `;
  }).join('');
}

function renderUpdates() {
  if (!updatesList) return;
  updatesList.innerHTML = ATLAS_UPDATE_SUMMARY.map((item) => `<li>${escapeHtml(item)}</li>`).join('');

  const launcherVersion = $('launcherVersionLabel');
  if (launcherVersion) launcherVersion.textContent = `Launcher ${ATLAS_LAUNCHER_VERSION} · ${ATLAS_ENGINE_LABEL}`;
}

navButtons.forEach((button) => {
  button.addEventListener('click', () => showView(button.dataset.launcherTarget));
});

renderProjects();
renderUpdates();
showView('projects');
