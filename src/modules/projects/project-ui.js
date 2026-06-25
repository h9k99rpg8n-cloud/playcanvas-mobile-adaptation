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

function renderTemplateCard(template) {
  const isSelected = template.id === selectedTemplateId;

  return `
    <button class="template-option ${isSelected ? 'selected' : ''}" data-template-id="${template.id}" type="button">
      <span class="template-icon">${template.icon}</span>
      <span>
        <strong>${template.name}</strong>
        <small>${template.description}</small>
      </span>
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
    });
  });
}

function renderProjectItem(project, activeId) {
  const isActive = project.id === activeId;
  const icon = project.templateIcon || (project.favorite ? '⭐' : '🧱');

  return `
    <article class="project-item ${isActive ? 'active' : ''}">
      <button class="project-open-area" data-open-project-id="${project.id}" type="button">
        <span class="project-avatar">${icon}</span>
        <span class="project-info">
          <strong>${escapeHtml(project.name)}</strong>
          <small>${escapeHtml(project.template)} • ${escapeHtml(project.updatedAt)}</small>
        </span>
        <span class="project-state">Editar</span>
      </button>
      <button class="icon-button danger" data-delete-project-id="${project.id}" type="button" aria-label="Eliminar proyecto">🗑️</button>
    </article>
  `;
}

function renderProjects() {
  const projects = getProjects();
  const activeId = getActiveProjectId();
  const list = getElement('projectList');
  const emptyState = getElement('emptyState');
  const count = getElement('projectCount');

  count.textContent = String(projects.length);
  emptyState.hidden = projects.length > 0;
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
  renderTemplates();
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
  getElement('closeTemplatePanelButton').addEventListener('click', closeTemplatePanel);
  getElement('confirmCreateProjectButton').addEventListener('click', handleCreateProject);

  renderTemplates();
  renderProjects();
}
