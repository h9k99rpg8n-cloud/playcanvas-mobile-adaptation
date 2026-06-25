import { TEMPLATES, getDefaultTemplate } from '../templates/template-registry.js';
import {
  createProject,
  deleteProject,
  getActiveProjectId,
  getProjects,
  setActiveProject
} from './project-store.js';

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

function renderTemplateCard(template) {
  const isSelected = template.id === selectedTemplateId;
  const installButton = template.installed ? '<span class="install-badge">Instalada</span>' : '<span class="install-badge">Instalar</span>';

  return `
    <button class="hub-template-card ${isSelected ? 'selected' : ''}" data-template-id="${template.id}" type="button">
      <div class="hub-template-thumb">
        <span>${template.icon}</span>
        ${installButton}
      </div>
      <div class="hub-template-body">
        <strong>${escapeHtml(template.name)}</strong>
        <small>${escapeHtml(template.description)}</small>
      </div>
    </button>
  `;
}

function renderTemplates() {
  const grid = getElement('templateGrid');
  grid.innerHTML = TEMPLATES.map(renderTemplateCard).join('');

  grid.querySelectorAll('[data-template-id]').forEach((button) => {
    button.addEventListener('click', () => {
      selectedTemplateId = button.dataset.templateId;
      renderTemplates();
      openTemplatePanel();
    });
  });
}

function renderProjectItem(project, activeId) {
  const isActive = project.id === activeId;
  const icon = project.templateIcon || (project.favorite ? '⭐' : '▣');

  return `
    <article class="hub-project-card ${isActive ? 'active' : ''}">
      <span class="hub-project-icon">${icon}</span>
      <button class="project-open-area hub-project-main" data-open-project-id="${project.id}" type="button">
        <strong>${escapeHtml(project.name)}</strong>
        <small>Modificado: ${escapeHtml(project.updatedAt)}</small>
      </button>
      <span class="hub-project-meta">${escapeHtml(getProjectVersion(project))}</span>
      <div class="hub-project-actions">
        <span class="hub-status-icon">✓</span>
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
  getElement('templatePanel').hidden = false;
  getElement('projectNameInput').focus();
}

function closeTemplatePanel() {
  getElement('templatePanel').hidden = true;
}

function handleCreateProject() {
  const input = getElement('projectNameInput');
  const project = createProject(input.value, selectedTemplateId);
  input.value = '';
  closeTemplatePanel();
  renderProjects();
  goToEditor(project.id);
}

export function mountProjectsPage() {
  getElement('createProjectButton').addEventListener('click', openTemplatePanel);
  getElement('openTemplatePanelButton').addEventListener('click', openTemplatePanel);
  getElement('closeTemplatePanelButton').addEventListener('click', closeTemplatePanel);
  getElement('confirmCreateProjectButton').addEventListener('click', handleCreateProject);
  getElement('projectSearchInput').addEventListener('input', renderProjects);

  renderTemplates();
  renderProjects();
}
