import { readStorage, writeStorage } from '../../core/storage.js';
import { getDefaultTemplate, getTemplateById } from '../templates/template-registry.js';

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

export function createProject(name, templateId = getDefaultTemplate().id) {
  const projects = getProjects();
  const template = getTemplateById(templateId);
  const cleanName = name?.trim() || `${template.name} ${projects.length + 1}`;

  const project = {
    id: createId(),
    name: cleanName,
    templateId: template.id,
    template: template.name,
    templateIcon: template.icon,
    createdAt: getNowLabel(),
    updatedAt: getNowLabel(),
    favorite: projects.length === 0,
    data: template.data
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
