import {
  createProject,
  deleteProject,
  getActiveProjectId,
  getProjects,
  setActiveProject
} from './project-store.js';

function getElement(id) {
  return document.getElementById(id);
}

function showMessage(message) {
  window.alert(message);
}

function renderProjectItem(project, activeId) {
  const isActive = project.id === activeId;

  return `
    <button class="project-item ${isActive ? 'active' : ''}" data-project-id="${project.id}" type="button">
      <span class="project-avatar">${project.favorite ? '⭐' : '🧱'}</span>
      <span class="project-info">
        <strong>${project.name}</strong>
        <small>${project.template} • ${project.updatedAt}</small>
      </span>
      <span class="project-state">${isActive ? 'Abierto' : 'Abrir'}</span>
    </button>
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

  list.querySelectorAll('[data-project-id]').forEach((button) => {
    button.addEventListener('click', () => {
      setActiveProject(button.dataset.projectId);
      renderProjects();
    });
  });
}

function askProjectName() {
  return window.prompt('Nombre del proyecto:', 'Mi primer mundo');
}

function handleCreateProject() {
  const name = askProjectName();
  if (name === null) return;

  createProject(name);
  renderProjects();
}

function handleOpenProject() {
  const projects = getProjects();
  const activeId = getActiveProjectId();
  const activeProject = projects.find((project) => project.id === activeId);

  if (!projects.length) {
    showMessage('Primero crea un proyecto.');
    return;
  }

  showMessage(`Proyecto abierto: ${activeProject?.name || projects[0].name}\n\nEl editor visual llegará en la versión 0.0.4.`);
}

function handleDeleteProject() {
  const activeId = getActiveProjectId();
  const projects = getProjects();
  const activeProject = projects.find((project) => project.id === activeId);

  if (!projects.length) {
    showMessage('No hay proyectos para eliminar.');
    return;
  }

  const shouldDelete = window.confirm(`¿Eliminar "${activeProject?.name || projects[0].name}"?`);
  if (!shouldDelete) return;

  deleteProject(activeProject?.id || projects[0].id);
  renderProjects();
}

export function mountProjectsPage() {
  getElement('createProjectButton').addEventListener('click', handleCreateProject);
  getElement('openProjectButton').addEventListener('click', handleOpenProject);
  getElement('deleteProjectButton').addEventListener('click', handleDeleteProject);

  renderProjects();
}
