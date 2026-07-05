import { readStorage, writeStorage } from '../core/storage.js';
import { ATLAS_ENGINE_LABEL, ATLAS_LAUNCHER_VERSION, ATLAS_UPDATE_SUMMARY } from '../core/version.js';
import { TEMPLATES } from '../modules/templates/template-registry.js';
import { createProject } from '../modules/projects/project-store.js';

const $ = (id) => document.getElementById(id);
const views = Array.from(document.querySelectorAll('[data-launcher-view]'));
const navButtons = Array.from(document.querySelectorAll('[data-launcher-target]'));
const projectsList = $('launcherProjectsList');
const updatesList = $('launcherUpdatesList');
const projectCount = $('launcherProjectCount');
const installButtons = Array.from(document.querySelectorAll('[data-install-template]'));
const createForm = $('launcherCreateProjectForm');
const openCreateButton = $('openCreateProjectButton');
const closeCreateButton = $('closeCreateProjectButton');
const templateSelect = $('launcherTemplateSelect');
const templateHelp = $('launcherTemplateHelp');

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

function showView(viewId) {
  views.forEach((view) => {
    view.classList.toggle('active', view.dataset.launcherView === viewId);
  });

  navButtons.forEach((button) => {
    button.classList.toggle('active', button.dataset.launcherTarget === viewId);
  });
}

function readIconFile(file) {
  return new Promise((resolve) => {
    if (!file) {
      resolve(null);
      return;
    }

    if (!file.type.startsWith('image/')) {
      window.alert('El icono debe ser una imagen.');
      resolve(null);
      return;
    }

    const reader = new FileReader();
    reader.addEventListener('load', () => resolve(reader.result));
    reader.addEventListener('error', () => {
      window.alert('No se pudo importar el icono.');
      resolve(null);
    });
    reader.readAsDataURL(file);
  });
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

function getTemplate(templateId) {
  return TEMPLATES.find((template) => template.id === templateId) || null;
}

function renderTemplateSelect() {
  if (!templateSelect) return;
  const installedIds = new Set(getInstalledTemplates());
  const installedTemplates = TEMPLATES.filter((template) => installedIds.has(template.id));

  if (installedTemplates.length === 0) {
    templateSelect.innerHTML = '<option value="">Instala una plantilla primero</option>';
    templateSelect.disabled = true;
    if (templateHelp) templateHelp.textContent = 'No hay plantillas instaladas. Ve a Plantillas e instala una antes de crear un proyecto.';
    return;
  }

  templateSelect.disabled = false;
  templateSelect.innerHTML = installedTemplates.map((template) => `
    <option value="${escapeHtml(template.id)}">${escapeHtml(template.name)}</option>
  `).join('');
  if (templateHelp) templateHelp.textContent = 'Solo aparecen plantillas instaladas desde la tienda del Launcher.';
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
  renderTemplateSelect();
}

function installTemplate(templateId) {
  setTemplateState(templateId, 'installing');

  window.setTimeout(() => {
    const installed = new Set(getInstalledTemplates());
    installed.add(templateId);
    saveInstalledTemplates(Array.from(installed));
    setTemplateState(templateId, 'installed');
    renderTemplateSelect();
  }, 900);
}

function openCreateProjectForm() {
  renderTemplateSelect();
  createForm.hidden = false;
  $('launcherProjectName').focus();
}

function closeCreateProjectForm() {
  createForm.hidden = true;
}

async function handleCreateProject(event) {
  event.preventDefault();

  const name = $('launcherProjectName').value.trim();
  const description = $('launcherProjectDescription').value.trim();
  const templateId = templateSelect.value;
  const template = getTemplate(templateId);
  const iconFile = $('launcherProjectIcon').files?.[0] || null;

  if (!name || !description || !templateId || !template) {
    window.alert('Completa el formulario e instala una plantilla antes de crear el proyecto.');
    return;
  }

  const projectIcon = await readIconFile(iconFile);
  const project = createProject({ name, description, templateId, projectIcon });
  createForm.reset();
  closeCreateProjectForm();
  renderProjects();
  location.assign('scene-editor.html?project=' + encodeURIComponent(project.id));
}

navButtons.forEach((button) => {
  button.addEventListener('click', () => showView(button.dataset.launcherTarget));
});

installButtons.forEach((button) => {
  button.addEventListener('click', () => installTemplate(button.dataset.installTemplate));
});

if (openCreateButton) openCreateButton.addEventListener('click', openCreateProjectForm);
if (closeCreateButton) closeCreateButton.addEventListener('click', closeCreateProjectForm);
if (createForm) createForm.addEventListener('submit', handleCreateProject);

renderProjects();
renderUpdates();
renderTemplateStates();
showView('projects');
