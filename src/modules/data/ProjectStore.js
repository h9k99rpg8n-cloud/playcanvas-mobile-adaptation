import { readStorage, writeStorage } from './Storage.js';
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

function normalizeProject(project = {}) {
  return {
    ...project,
    gameType: '3D',
    editorVersion: project.editorVersion || ATLAS_ENGINE_LABEL,
    createdAt: project.createdAt || getNowLabel(),
    updatedAt: project.updatedAt || getNowLabel(),
    settings: {
      showFps: Boolean(project.settings?.showFps),
      ...(project.settings || {})
    },
    assets: Array.isArray(project.assets) ? project.assets : [],
    data: project.data || { scene: { objects: [], ui: [] } }
  };
}

export async function getProjects() {
  const projects = await readStorage(PROJECTS_KEY, []);
  return Array.isArray(projects) ? projects.map(normalizeProject) : [];
}

export async function saveProjects(projects) {
  const normalized = projects.map(normalizeProject);
  return writeStorage(PROJECTS_KEY, normalized);
}

export async function createProject(options = {}) {
  const projects = await getProjects();
  const template = getTemplateById(options.templateId || getDefaultTemplate().id);
  const cleanName = options.name?.trim() || `${template.name} ${projects.length + 1}`;

  const project = normalizeProject({
    id: createId(),
    name: cleanName,
    description: options.description?.trim() || 'Sin descripción',
    gameType: '3D',
    templateId: template.id,
    template: template.name,
    templateIcon: template.icon,
    projectIcon: options.projectIcon || null,
    editorVersion: template.editorVersion || ATLAS_ENGINE_LABEL,
    createdAt: getNowLabel(),
    updatedAt: getNowLabel(),
    favorite: projects.length === 0,
    settings: { showFps: false },
    assets: [],
    data: cloneProjectData(template.data)
  });

  projects.unshift(project);
  await saveProjects(projects);
  await setActiveProject(project.id);
  return project;
}

export async function renameProject(id, nextName) {
  const cleanName = nextName?.trim();
  if (!cleanName) return null;

  const projects = await getProjects();
  const project = projects.find((item) => item.id === id);
  if (!project) return null;

  project.name = cleanName;
  project.updatedAt = getNowLabel();
  await saveProjects(projects);
  return normalizeProject(project);
}

export async function duplicateProject(id) {
  const projects = await getProjects();
  const source = projects.find((project) => project.id === id);
  if (!source) return null;

  const copy = normalizeProject({
    ...cloneProjectData(source),
    id: createId(),
    name: `${source.name} copia`,
    favorite: false,
    createdAt: getNowLabel(),
    updatedAt: getNowLabel(),
    editorVersion: source.editorVersion || ATLAS_ENGINE_LABEL,
    settings: cloneProjectData(source.settings || { showFps: false }),
    assets: cloneProjectData(source.assets || []),
    data: cloneProjectData(source.data)
  });

  const sourceIndex = projects.findIndex((project) => project.id === id);
  projects.splice(sourceIndex + 1, 0, copy);
  await saveProjects(projects);
  await setActiveProject(copy.id);
  return copy;
}

export async function updateProject(id, patch = {}) {
  const projects = await getProjects();
  const project = projects.find((item) => item.id === id);
  if (!project) return null;

  Object.assign(project, patch, { updatedAt: getNowLabel() });
  await saveProjects(projects);
  return normalizeProject(project);
}

export async function updateProjectSettings(id, nextSettings = {}) {
  const projects = await getProjects();
  const project = projects.find((item) => item.id === id);
  if (!project) return null;

  project.settings = {
    ...project.settings,
    ...nextSettings
  };
  project.updatedAt = getNowLabel();
  await saveProjects(projects);
  return normalizeProject(project);
}

export async function deleteProject(id) {
  const projects = (await getProjects()).filter((project) => project.id !== id);
  await saveProjects(projects);

  if ((await getActiveProjectId()) === id) {
    await setActiveProject(projects[0]?.id || null);
  }

  return projects;
}

export async function setActiveProject(id) {
  return writeStorage(ACTIVE_PROJECT_KEY, id);
}

export async function getActiveProjectId() {
  return readStorage(ACTIVE_PROJECT_KEY, null);
}

export async function getActiveProject() {
  const activeId = await getActiveProjectId();
  const projects = await getProjects();
  return projects.find((project) => project.id === activeId) || null;
}
