import { readStorage, writeStorage } from '../../core/storage.js';

const PROJECTS_KEY = 'projects';
const ACTIVE_PROJECT_KEY = 'active-project-id';

function createId() {
  return 'project-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 7);
}

function getNowLabel() {
  return new Date().toLocaleString('es-MX', {
    dateStyle: 'medium',
    timeStyle: 'short'
  });
}

export function getProjects() {
  return readStorage(PROJECTS_KEY, []);
}

export function saveProjects(projects) {
  return writeStorage(PROJECTS_KEY, projects);
}

export function createProject(name) {
  const projects = getProjects();
  const cleanName = name?.trim() || `Proyecto ${projects.length + 1}`;

  const project = {
    id: createId(),
    name: cleanName,
    template: 'Escena vacía',
    createdAt: getNowLabel(),
    updatedAt: getNowLabel(),
    favorite: projects.length === 0
  };

  projects.unshift(project);
  saveProjects(projects);
  setActiveProject(project.id);
  return project;
}

export function deleteProject(id) {
  const projects = getProjects().filter((project) => project.id !== id);
  saveProjects(projects);

  if (getActiveProjectId() === id) {
    setActiveProject(projects[0]?.id || null);
  }

  return projects;
}

export function setActiveProject(id) {
  writeStorage(ACTIVE_PROJECT_KEY, id);
}

export function getActiveProjectId() {
  return readStorage(ACTIVE_PROJECT_KEY, null);
}

export function getActiveProject() {
  const activeId = getActiveProjectId();
  return getProjects().find((project) => project.id === activeId) || null;
}
