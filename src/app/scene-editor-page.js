import * as THREE from 'three';
import { ViewportRenderer } from '../modules/viewport/viewport-renderer.js';
import { ToolboxUI } from '../modules/ui/ToolboxUI.js';
import { TransformGizmo } from '../modules/gizmos/TransformGizmo.js';
import { StatsMonitor } from '../modules/utils/StatsMonitor.js';
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
  const transform = new TransformGizmo(viewport.camera, viewport.canvas, viewport.cameraController);
  const stats = new StatsMonitor(getElement('fpsMonitor'));
  const raycaster = new THREE.Raycaster();
  const pointer = new THREE.Vector2();

  viewport.scene.add(transform.control);
  getElement('resetCameraButton').addEventListener('click', () => viewport.cameraController.reset());

  getElement('moveModeButton').addEventListener('click', () => transform.setMode('translate'));
  getElement('rotateModeButton').addEventListener('click', () => transform.setMode('rotate'));
  getElement('scaleModeButton').addEventListener('click', () => transform.setMode('scale'));

  viewport.canvas.addEventListener('pointerdown', (event) => {
    const rect = viewport.canvas.getBoundingClientRect();
    pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    raycaster.setFromCamera(pointer, viewport.camera);
    const hit = raycaster.intersectObjects(viewport.sceneManager.objects, false)[0];
    if (hit) {
      viewport.sceneManager.select(hit.object);
      transform.attach(hit.object);
    } else {
      viewport.sceneManager.clearSelection();
      transform.detach();
    }
  });

  const oldAnimate = viewport.animate.bind(viewport);
  viewport.animate = () => {
    stats.begin();
    oldAnimate();
    stats.end();
  };

  new ToolboxUI({
    openButton: getElement('toolboxButton'),
    modal: getElement('toolboxModal'),
    closeButton: getElement('toolboxCloseButton'),
    grid: getElement('primitiveGrid'),
    onCreate: (type) => {
      const object = viewport.addPrimitive(type);
      transform.attach(object);
    }
  });
});
