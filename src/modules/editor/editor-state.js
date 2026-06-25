import { readStorage, writeStorage } from '../../core/storage.js';
import { getActiveProject, getProjects } from '../projects/project-store.js';

const EDITOR_STATE_KEY = 'editor-state';

const DEFAULT_OBJECTS = [
  { id: 'camera', name: 'Cámara principal', type: 'camera', icon: '📷' },
  { id: 'light', name: 'Luz direccional', type: 'light', icon: '💡' },
  { id: 'cube', name: 'Cubo demo', type: 'mesh', icon: '🧊' }
];

const DEFAULT_ASSETS = [
  { id: 'material', name: 'Material base', type: 'Material', icon: '🎨' },
  { id: 'starter', name: 'Archivo inicial', type: 'Archivo', icon: '📄' }
];

function getProjectFromUrl() {
  const params = new URLSearchParams(window.location.search);
  const projectId = params.get('project');
  const projects = getProjects();
  return projects.find((project) => project.id === projectId) || getActiveProject() || projects[0] || null;
}

export function loadEditorState() {
  const project = getProjectFromUrl();
  const allStates = readStorage(EDITOR_STATE_KEY, {});

  if (!project) {
    return {
      project: null,
      selectedObjectId: 'cube',
      objects: DEFAULT_OBJECTS,
      assets: DEFAULT_ASSETS
    };
  }

  const savedState = allStates[project.id];

  return {
    project,
    selectedObjectId: savedState?.selectedObjectId || 'cube',
    objects: savedState?.objects || DEFAULT_OBJECTS,
    assets: savedState?.assets || DEFAULT_ASSETS
  };
}

export function saveEditorState(state) {
  if (!state.project) return;

  const allStates = readStorage(EDITOR_STATE_KEY, {});
  allStates[state.project.id] = {
    selectedObjectId: state.selectedObjectId,
    objects: state.objects,
    assets: state.assets
  };

  writeStorage(EDITOR_STATE_KEY, allStates);
}
