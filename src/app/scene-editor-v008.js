import * as THREE from 'three';
import { ViewportRenderer } from '../modules/viewport/viewport-renderer.js';
import { ToolboxUI } from '../modules/ui/ToolboxUI.js';
import { TransformGizmo } from '../modules/gizmos/TransformGizmo.js';
import { StatsMonitor } from '../modules/utils/StatsMonitor.js';
import { getActiveProject, getProjects, setActiveProject } from '../modules/projects/project-store.js';

const $ = (id) => document.getElementById(id);

function makeDiv(id, className) {
  let el = $(id);
  if (el) return el;
  el = document.createElement('div');
  el.id = id;
  el.className = className;
  document.querySelector('.scene-editor').appendChild(el);
  return el;
}

function makeButton(id, label, parent) {
  let el = $(id);
  if (el) return el;
  el = document.createElement('button');
  el.id = id;
  el.type = 'button';
  el.textContent = label;
  parent.appendChild(el);
  return el;
}

function currentProject() {
  const id = new URLSearchParams(location.search).get('project');
  const projects = getProjects();
  const project = projects.find((item) => item.id === id) || getActiveProject() || projects[0] || null;
  if (project) setActiveProject(project.id);
  return project;
}

window.addEventListener('DOMContentLoaded', () => {
  const project = currentProject();
  $('sceneProjectName').textContent = project?.name || 'Sin proyecto';

  const statsBox = makeDiv('fpsMonitor', 'fps-monitor');
  statsBox.textContent = '-- FPS · -- MS';

  const modeBar = makeDiv('transformModeBar', 'transform-mode-bar');
  const moveBtn = makeButton('moveModeButton', 'Mover', modeBar);
  const rotateBtn = makeButton('rotateModeButton', 'Rotar', modeBar);
  const scaleBtn = makeButton('scaleModeButton', 'Escalar', modeBar);

  const viewport = new ViewportRenderer($('sceneCanvas'), $('viewGizmoCanvas'));
  const transform = new TransformGizmo(viewport.camera, viewport.canvas, viewport.cameraController);
  const stats = new StatsMonitor(statsBox);
  const raycaster = new THREE.Raycaster();
  const pointer = new THREE.Vector2();

  viewport.scene.add(transform.control);
  $('resetCameraButton').addEventListener('click', () => viewport.cameraController.reset());
  moveBtn.addEventListener('click', () => transform.setMode('translate'));
  rotateBtn.addEventListener('click', () => transform.setMode('rotate'));
  scaleBtn.addEventListener('click', () => transform.setMode('scale'));

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

  const render = viewport.renderer.render.bind(viewport.renderer);
  viewport.renderer.render = (scene, camera) => {
    stats.begin();
    render(scene, camera);
    stats.end();
  };

  new ToolboxUI({
    openButton: $('toolboxButton'),
    modal: $('toolboxModal'),
    closeButton: $('toolboxCloseButton'),
    grid: $('primitiveGrid'),
    onCreate: (type) => {
      const object = viewport.addPrimitive(type);
      transform.attach(object);
    }
  });
});
