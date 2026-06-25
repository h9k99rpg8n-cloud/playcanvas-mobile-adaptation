import { AtlasThreeRenderer } from '../modules/renderer/atlas-three-renderer.js';
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

function bindPerspectiveGizmo(renderer) {
  document.querySelectorAll('[data-camera-axis]').forEach((button) => {
    button.addEventListener('click', () => {
      renderer.moveCameraTo(button.dataset.cameraAxis);
    });
  });
}

window.addEventListener('DOMContentLoaded', () => {
  const project = getCurrentProject();
  getElement('sceneProjectName').textContent = project?.name || 'Sin proyecto';

  const renderer = new AtlasThreeRenderer(getElement('sceneCanvas'));
  getElement('resetCameraButton').addEventListener('click', () => renderer.resetCamera());
  bindPerspectiveGizmo(renderer);
});
