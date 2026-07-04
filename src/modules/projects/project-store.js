import { readStorage, writeStorage } from '../../core/storage.js';
import { ATLAS_ENGINE_LABEL } from '../../core/version.js';
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

function cloneProjectData(data) {
  return JSON.parse(JSON.stringify(data || {}));
}

function normalizeProject(project) {
  return {
    ...project,
    editorVersion: project.editorVersion || ATLAS_ENGINE_LABEL,
    updatedAt: project.updatedAt || getNowLabel(),
    data: project.data || { scene: { objects: [], ui: [] } }
  };
}

export function getProjects() {
  return readStorage(PROJECTS_KEY, []).map(normalizeProject);
}

export function saveProjects(projects) {
  const normalized = projects.map(normalizeProject);
  return writeStorage(PROJECTS_KEY, normalized);
}

export function createProject(options = {}) {
  const projects = getProjects();
  const template = getTemplateById(options.templateId || getDefaultTemplate().id);
  const cleanName = options.name?.trim() || `${template.name} ${projects.length + 1}`;

  const project = {
    id: createId(),
    name: cleanName,
    description: options.description?.trim() || 'Sin descripción',
    gameType: options.gameType || '3D',
    templateId: template.id,
    template: template.name,
    templateIcon: template.icon,
    projectIcon: options.projectIcon || null,
    editorVersion: template.editorVersion || ATLAS_ENGINE_LABEL,
    createdAt: getNowLabel(),
    updatedAt: getNowLabel(),
    favorite: projects.length === 0,
    data: cloneProjectData(template.data)
  };

  projects.unshift(project);
  saveProjects(projects);
  setActiveProject(project.id);
  return project;
}

export function renameProject(id, nextName) {
  const cleanName = nextName?.trim();
  if (!cleanName) return null;

  const projects = getProjects();
  const project = projects.find((item) => item.id === id);
  if (!project) return null;

  project.name = cleanName;
  project.updatedAt = getNowLabel();
  saveProjects(projects);
  return project;
}

export function duplicateProject(id) {
  const projects = getProjects();
  const source = projects.find((project) => project.id === id);
  if (!source) return null;

  const copy = {
    ...cloneProjectData(source),
    id: createId(),
    name: `${source.name} copia`,
    favorite: false,
    createdAt: getNowLabel(),
    updatedAt: getNowLabel(),
    editorVersion: source.editorVersion || ATLAS_ENGINE_LABEL,
    data: cloneProjectData(source.data)
  };

  const sourceIndex = projects.findIndex((project) => project.id === id);
  projects.splice(sourceIndex + 1, 0, copy);
  saveProjects(projects);
  setActiveProject(copy.id);
  return copy;
}

export function updateProject(id, patch = {}) {
  const projects = getProjects();
  const project = projects.find((item) => item.id === id);
  if (!project) return null;

  Object.assign(project, patch, { updatedAt: getNowLabel() });
  saveProjects(projects);
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
