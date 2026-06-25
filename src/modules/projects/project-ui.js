import { TEMPLATES, getDefaultTemplate } from '../templates/template-registry.js';
import {
  createProject,
  deleteProject,
  getActiveProjectId,
  getProjects,
  setActiveProject
} from './project-store.js';

const installedTemplateIds = new Set(TEMPLATES.filter((template) => template.installed).map((template) => template.id));
let selectedTemplateId = getDefaultTemplate().id;

function getElement(id) {
  return document.getElementById(id);
}

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function goToEditor(projectId) {
  setActiveProject(projectId);
  location.assign('scene-editor.html?project=' + projectId);
}

function getProjectVersion(project) {
  return project.editorVersion || 'Atlas 0.0.4';
}

function getInstalledTemplates() {
  return TEMPLATES.filter((template) => installedTemplateIds.has(template.id));
}

function switchView(viewId) {
  document.querySelectorAll('.hub-view').forEach((view) => {
    view.classList.toggle('active', view.id === viewId);
  });

  document.querySelectorAll('[data-view]').forEach((item) => {
    item.classList.toggle('active', item.dataset.view === viewId);
  });

  const titleMap = {
    projectsView: 'Proyectos',
    templatesView: 'Plantillas',
    learnView: 'Aprender',
    settingsView: 'Ajustes'
  };

  getElement('hubTitle').textContent = titleMap[viewId] || 'Atlas Hub';
  getElement('projectHeaderActions').hidden = viewId !== 'projectsView';
}

function renderTemplateCard(template) {
  const installed = installedTemplateIds.has(template.id);
  const action = installed ? '<span class="install-badge">Instalada</span>' : '<button class="install-badge install-action" data-install-template-id="' + template.id + '" type="button">Instalar</button>';

  return `
    <article class="hub-template-card" data-template-id="${template.id}">
      <div class="hub-template-thumb">
        <span>${template.icon}</span>
        ${action}
      </div>
      <div class="hub-template-body">
        <strong>${escapeHtml(template.name)}</strong>
        <small>${escapeHtml(template.description)}</small>
        <div class="install-progress" data-progress-id="${template.id}" hidden><span></span></div>
      </div>
    </article>
  `;
}

function renderTemplates() {
  const grid = getElement('templateGrid');
  grid.innerHTML = TEMPLATES.map(renderTemplateCard).join('');

  grid.querySelectorAll('[data-install-template-id]').forEach((button) => {
    button.addEventListener('click', (event) => {
      event.stopPropagation();
      const templateId = button.dataset.installTemplateId;
      const progress = grid.querySelector(`[data-progress-id="${templateId}"]`);
      button.disabled = true;
      button.textContent = 'Instalando';
      progress.hidden = false;
      progress.classList.add('running');

      window.setTimeout(() => {
        installedTemplateIds.add(templateId);
        renderTemplates();
        renderMyTemplates();
        renderInstalledTemplateSelect();
      }, 1200);
    });
  });
}

function renderMyTemplates() {
  const list = getElement('myTemplateList');
  const installed = getInstalledTemplates();

  list.innerHTML = installed.map((template) => `
    <button class="my-template-chip" data-my-template-id="${template.id}" type="button">
      <span>${template.icon}</span>
      <strong>${escapeHtml(template.name)}</strong>
    </button>
  `).join('');

  list.querySelectorAll('[data-my-template-id]').forEach((button) => {
    button.addEventListener('click', () => {
      selectedTemplateId = button.dataset.myTemplateId;
      openTemplatePanel();
    });
  });
}

function renderInstalledTemplateSelect() {
  const select = getElement('installedTemplateSelect');
  const installed = getInstalledTemplates();

  select.innerHTML = installed.map((template) => `
    <option value="${template.id}" ${template.id === selectedTemplateId ? 'selected' : ''}>${escapeHtml(template.name)}</option>
  `).join('');
}

function renderProjectItem(project, activeId) {
  const isActive = project.id === activeId;
  const icon = project.templateIcon || (project.favorite ? '⭐' : '▣');

  return `
    <article class="hub-project-card ${isActive ? 'active' : ''}">
      <span class="hub-project-icon">${icon}</span>
      <button class="project-open-area hub-project-main" data-open-project-id="${project.id}" type="button">
        <strong>${escapeHtml(project.name)}</strong>
        <small>${escapeHtml(project.description || project.template)} · ${escapeHtml(project.gameType || '3D')}</small>
      </button>
      <span class="hub-project-meta">${escapeHtml(getProjectVersion(project))}</span>
      <div class="hub-project-actions">
        <button class="icon-button danger" data-delete-project-id="${project.id}" type="button" aria-label="Eliminar proyecto">🗑️</button>
      </div>
    </article>
  `;
}

function applySearch(projects) {
  const input = getElement('projectSearchInput');
  const query = input ? input.value.trim().toLowerCase() : '';
  if (!query) return projects;
  return projects.filter((project) => project.name.toLowerCase().includes(query) || project.template.toLowerCase().includes(query));
}

function renderProjects() {
  const allProjects = getProjects();
  const projects = applySearch(allProjects);
  const activeId = getActiveProjectId();
  const list = getElement('projectList');
  const emptyState = getElement('emptyState');
  const count = getElement('projectCount');

  count.textContent = String(allProjects.length);
  emptyState.hidden = allProjects.length > 0;
  list.innerHTML = projects.map((project) => renderProjectItem(project, activeId)).join('');

  list.querySelectorAll('[data-open-project-id]').forEach((button) => {
    button.addEventListener('click', () => goToEditor(button.dataset.openProjectId));
  });

  list.querySelectorAll('[data-delete-project-id]').forEach((button) => {
    button.addEventListener('click', () => {
      const project = getProjects().find((item) => item.id === button.dataset.deleteProjectId);
      const shouldDelete = window.confirm(`¿Eliminar "${project?.name || 'este proyecto'}"?`);
      if (!shouldDelete) return;

      deleteProject(button.dataset.deleteProjectId);
      renderProjects();
    });
  });
}

function openTemplatePanel() {
  renderInstalledTemplateSelect();
  getElement('templatePanel').hidden = false;
  getElement('projectNameInput').focus();
}

function closeTemplatePanel() {
  getElement('templatePanel').hidden = true;
}

function handleCreateProject(event) {
  event.preventDefault();
  const name = getElement('projectNameInput').value.trim();
  const description = getElement('projectDescriptionInput').value.trim();
  const gameType = getElement('gameTypeSelect').value;
  const templateId = getElement('installedTemplateSelect').value;

  if (!name || !description || !gameType || !templateId) {
    window.alert('Completa todos los campos para crear el proyecto.');
    return;
  }

  const project = createProject({ name, description, gameType, templateId });
  getElement('createProjectForm').reset();
  closeTemplatePanel();
  renderProjects();
  goToEditor(project.id);
}

export function mountProjectsPage() {
  document.querySelectorAll('[data-view]').forEach((item) => {
    item.addEventListener('click', () => switchView(item.dataset.view));
  });

  getElement('createProjectButton').addEventListener('click', openTemplatePanel);
  getElement('closeTemplatePanelButton').addEventListener('click', closeTemplatePanel);
  getElement('createProjectForm').addEventListener('submit', handleCreateProject);
  getElement('projectSearchInput').addEventListener('input', renderProjects);

  renderTemplates();
  renderMyTemplates();
  renderInstalledTemplateSelect();
  renderProjects();
}
