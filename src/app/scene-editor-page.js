import { AtlasWebGLRenderer } from '../modules/renderer/atlas-webgl.js';
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

function renderPanels(project) {
  getElement('sceneProjectName').textContent = project?.name || 'Sin proyecto';

  getElement('hierarchyList').innerHTML = `
    <article class="scene-row"><div><strong>📷 Cámara</strong><small>camera</small></div><span>activa</span></article>
    <article class="scene-row"><div><strong>💡 Luz</strong><small>directional light</small></div><span>activa</span></article>
    <article class="scene-row"><div><strong>⬛ Plano</strong><small>mesh plane</small></div><span>visible</span></article>
  `;

  getElement('inspectorContent').innerHTML = `
    <article class="scene-row"><span>Proyecto</span><strong>${project?.name || 'Sin proyecto'}</strong></article>
    <article class="scene-row"><span>Plantilla</span><strong>${project?.template || 'Escena vacía'}</strong></article>
    <article class="scene-row"><span>Objeto</span><strong>Plano</strong></article>
    <article class="scene-row"><span>Luz</span><strong>Direccional</strong></article>
    <article class="scene-row"><span>Cámara</span><strong>Orbital</strong></article>
  `;
}

function bindPanels() {
  const inspector = getElement('inspectorPanel');
  const hierarchy = getElement('hierarchyPanel');

  getElement('inspectorButton').addEventListener('click', () => inspector.classList.add('open'));
  getElement('hierarchyButton').addEventListener('click', () => hierarchy.classList.add('open'));
  getElement('closeInspectorButton').addEventListener('click', () => inspector.classList.remove('open'));
  getElement('closeHierarchyButton').addEventListener('click', () => hierarchy.classList.remove('open'));
}

window.addEventListener('DOMContentLoaded', () => {
  const project = getCurrentProject();
  renderPanels(project);
  bindPanels();

  const renderer = new AtlasWebGLRenderer(getElement('sceneCanvas'));
  getElement('resetCameraButton').addEventListener('click', () => renderer.resetCamera());
  window.addEventListener('resize', () => renderer.render());
});
