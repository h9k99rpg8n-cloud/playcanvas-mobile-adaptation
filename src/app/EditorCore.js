import * as THREE from 'three';
import { ViewportRenderer } from '../modules/rendering/ViewportRenderer.js';
import { ToolboxUI } from '../modules/tools/ToolboxUI.js';
import { TransformGizmo } from '../modules/tools/TransformGizmo.js';
import { HierarchyPanel } from '../modules/hierarchy/HierarchyPanel.js';
import { StatsMonitor } from '../modules/utils/StatsMonitor.js';
import { getActiveProject, getProjects, setActiveProject, updateProject } from '../modules/data/ProjectStore.js';

const $ = (id) => document.getElementById(id);
const round = (n) => Number(n.toFixed(3));
const vec = (v) => [round(v.x), round(v.y), round(v.z)];
const rot = (e) => [round(THREE.MathUtils.radToDeg(e.x)), round(THREE.MathUtils.radToDeg(e.y)), round(THREE.MathUtils.radToDeg(e.z))];

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

async function currentProject() {
  const id = new URLSearchParams(location.search).get('project');
  const projects = await getProjects();
  const active = await getActiveProject();
  const project = projects.find((item) => item.id === id) || active || projects[0] || null;
  if (project) await setActiveProject(project.id);
  return project;
}

function pickObject(event, viewport, pointer, raycaster) {
  const rect = viewport.canvas.getBoundingClientRect();
  pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
  pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
  raycaster.setFromCamera(pointer, viewport.camera);
  return raycaster.intersectObjects(viewport.sceneManager.objects, false)[0]?.object || null;
}

function serializeScene(manager) {
  return { objects: manager.objects.map((object) => ({
    id: manager.ensureObjectId(object),
    parentId: manager.objects.includes(object.parent) ? manager.ensureObjectId(object.parent) : null,
    name: object.name || 'Objeto',
    type: object.userData.primitiveType || 'cube',
    position: vec(object.position),
    rotation: rot(object.rotation),
    scale: vec(object.scale)
  })), ui: [] };
}

function restoreParenting(project, manager) {
  const items = project?.data?.scene?.objects || [];
  const map = new Map(manager.objects.map((object) => [object.userData.atlasId, object]));
  items.forEach((item) => {
    const object = map.get(item.id);
    const group = map.get(item.parentId);
    if (object && group) manager.setParent(object, group);
  });
}

function loadProjectScene(project, viewport) {
  const sceneData = project?.data?.scene;
  if (!sceneData) return;
  viewport.sceneManager.loadSceneData(sceneData);
  restoreParenting(project, viewport.sceneManager);
}

window.addEventListener('DOMContentLoaded', async () => {
  let project = await currentProject();
  $('sceneProjectName').textContent = project?.name || 'Sin proyecto';

  const statsBox = makeDiv('fpsMonitor', 'fps-monitor');
  statsBox.textContent = '-- FPS · -- MS';
  if (!project?.settings?.showFps) statsBox.hidden = true;

  const modeBar = makeDiv('transformModeBar', 'transform-mode-bar');
  const selectBtn = makeButton('selectionModeButton', 'Seleccionar', modeBar);
  const moveBtn = makeButton('moveModeButton', 'Mover', modeBar);
  const rotateBtn = makeButton('rotateModeButton', 'Rotar', modeBar);
  const scaleBtn = makeButton('scaleModeButton', 'Escalar', modeBar);
  let selectionEnabled = true;
  let loadingScene = true;
  let saveTimer = null;
  selectBtn.classList.add('active');

  const viewport = new ViewportRenderer($('sceneCanvas'), $('viewGizmoCanvas'));
  const transform = new TransformGizmo(viewport.camera, viewport.canvas, viewport.cameraController);

  async function saveSceneNow() {
    if (!project || loadingScene) return;
    project = await updateProject(project.id, { data: { ...(project.data || {}), scene: serializeScene(viewport.sceneManager) } }) || project;
  }

  function scheduleSave() {
    clearTimeout(saveTimer);
    saveTimer = setTimeout(saveSceneNow, 120);
  }

  const hierarchy = new HierarchyPanel({
    sceneManager: viewport.sceneManager,
    transformGizmo: transform,
    onAddChild: (parent, type = 'sphere') => {
      const object = viewport.addPrimitive(type);
      viewport.sceneManager.setParent(object, parent);
      viewport.sceneManager.select(object);
      if (selectionEnabled) transform.attach(object);
      saveSceneNow();
    }
  });

  const stats = new StatsMonitor(statsBox);
  const raycaster = new THREE.Raycaster();
  const pointer = new THREE.Vector2();

  viewport.scene.add(transform.control);
  loadProjectScene(project, viewport);
  loadingScene = false;
  await saveSceneNow();

  viewport.sceneManager.addEventListener('objects-changed', () => saveSceneNow());
  transform.control.addEventListener('objectChange', scheduleSave);

  $('resetCameraButton').addEventListener('click', () => viewport.cameraController.reset());
  selectBtn.addEventListener('click', () => {
    selectionEnabled = !selectionEnabled;
    selectBtn.classList.toggle('active', selectionEnabled);
    hierarchy.setSelectionEnabled(selectionEnabled);
    if (!selectionEnabled) transform.detach();
  });
  moveBtn.addEventListener('click', () => transform.setMode('translate'));
  rotateBtn.addEventListener('click', () => transform.setMode('rotate'));
  scaleBtn.addEventListener('click', () => transform.setMode('scale'));

  viewport.canvas.addEventListener('pointerdown', (event) => {
    if (!selectionEnabled || transform.control.dragging) return;
    const picked = pickObject(event, viewport, pointer, raycaster);
    if (picked) { viewport.sceneManager.select(picked); transform.attach(picked); return; }
    if (viewport.sceneManager.selected) return;
    viewport.sceneManager.clearSelection();
    transform.detach();
  });

  viewport.canvas.addEventListener('dblclick', () => { viewport.sceneManager.clearSelection(); transform.detach(); });

  const render = viewport.renderer.render.bind(viewport.renderer);
  viewport.renderer.render = (scene, camera) => { stats.begin(); render(scene, camera); stats.end(); };

  new ToolboxUI({
    openButton: $('toolboxButton'),
    modal: $('toolboxModal'),
    closeButton: $('toolboxCloseButton'),
    grid: $('primitiveGrid'),
    onCreate: (type) => {
      const object = viewport.addPrimitive(type);
      if (selectionEnabled) transform.attach(object);
      saveSceneNow();
    }
  });
});
