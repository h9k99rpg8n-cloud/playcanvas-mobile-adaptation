import { readStorage, writeStorage } from '../core/storage.js';
import { ATLAS_ENGINE_LABEL, ATLAS_LAUNCHER_VERSION, ATLAS_UPDATE_SUMMARY } from '../core/version.js';

const $ = (id) => document.getElementById(id);
const menuToggle = $('launcherMenuToggle');
const views = Array.from(document.querySelectorAll('[data-launcher-view]'));
const navButtons = Array.from(document.querySelectorAll('[data-launcher-target]'));
const projectsList = $('launcherProjectsList');
const updatesList = $('launcherUpdatesList');
const projectCount = $('launcherProjectCount');
const installButtons = Array.from(document.querySelectorAll('[data-install-template]'));

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

function getInstalledTemplates() {
  return readStorage('launcher-installed-templates', []);
}

function saveInstalledTemplates(templateIds) {
  writeStorage('launcher-installed-templates', templateIds);
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

function setTemplateState(templateId, state) {
  const card = document.querySelector(`[data-template-card="${templateId}"]`);
  const status = document.querySelector(`[data-template-status="${templateId}"]`);
  const button = document.querySelector(`[data-install-template="${templateId}"]`);
  const progress = document.querySelector(`[data-template-progress="${templateId}"]`);

  if (!card || !status || !button || !progress) return;

  card.dataset.state = state;

  if (state === 'installed') {
    status.textContent = 'Instalada';
    button.textContent = 'Instalada';
    button.disabled = true;
    progress.classList.remove('running');
    progress.querySelector('span').style.width = '100%';
    return;
  }

  if (state === 'installing') {
    status.textContent = 'Instalando';
    button.textContent = 'Instalando...';
    button.disabled = true;
    progress.classList.add('running');
    progress.querySelector('span').style.width = '100%';
    return;
  }

  status.textContent = 'No instalada';
  button.textContent = 'Instalar';
  button.disabled = false;
  progress.classList.remove('running');
  progress.querySelector('span').style.width = '0%';
}

function renderTemplateStates() {
  const installed = new Set(getInstalledTemplates());
  installButtons.forEach((button) => {
    const templateId = button.dataset.installTemplate;
    setTemplateState(templateId, installed.has(templateId) ? 'installed' : 'not-installed');
  });
}

function installTemplate(templateId) {
  setTemplateState(templateId, 'installing');

  window.setTimeout(() => {
    const installed = new Set(getInstalledTemplates());
    installed.add(templateId);
    saveInstalledTemplates(Array.from(installed));
    setTemplateState(templateId, 'installed');
  }, 900);
}

navButtons.forEach((button) => {
  button.addEventListener('click', () => showView(button.dataset.launcherTarget));
});

installButtons.forEach((button) => {
  button.addEventListener('click', () => installTemplate(button.dataset.installTemplate));
});

renderProjects();
renderUpdates();
renderTemplateStates();
showView('projects');
