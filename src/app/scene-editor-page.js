import { ViewportRenderer } from '../modules/viewport/viewport-renderer.js';
import { getActiveProject, getProjects, setActiveProject } from '../modules/projects/project-store.js';

function getElement(id) {
  return document.getElementById(id);
}

function getCurrentProject() {
  const params = new URLSearchParams(location.search);
  const id = params.get('project');
  const projects = getProjects();
  const project = projects.find((item) => item.id === id) || getActiveProject() || projects[0] || null;
  if (project) setActiveProject(project.id);
  return project;
}

window.addEventListener('DOMContentLoaded', () => {
  const project = getCurrentProject();
  getElement('sceneProjectName').textContent = project?.name || 'Sin proyecto';

  const viewport = new ViewportRenderer(getElement('sceneCanvas'), getElement('viewGizmoCanvas'));
  getElement('resetCameraButton').addEventListener('click', () => viewport.cameraController.reset());
});
