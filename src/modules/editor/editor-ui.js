import { loadEditorState, saveEditorState } from './editor-state.js';

let state = loadEditorState();

function getElement(id) {
  return document.getElementById(id);
}

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function getSelectedObject() {
  return state.objects.find((object) => object.id === state.selectedObjectId) || state.objects[0];
}

function renderHeader() {
  getElement('editorProjectName').textContent = state.project?.name || 'Sin proyecto';
  getElement('templateBadge').textContent = state.project?.template || 'Editor vacío';
}

function renderHierarchy() {
  const selectedObject = getSelectedObject();
  const list = getElement('hierarchyList');

  list.innerHTML = state.objects.map((object) => `
    <button class="hierarchy-item ${object.id === selectedObject?.id ? 'active' : ''}" data-object-id="${object.id}" type="button">
      <span>${object.icon}</span>
      <strong>${escapeHtml(object.name)}</strong>
      <small>${escapeHtml(object.type)}</small>
    </button>
  `).join('');

  list.querySelectorAll('[data-object-id]').forEach((button) => {
    button.addEventListener('click', () => {
      state.selectedObjectId = button.dataset.objectId;
      saveEditorState(state);
      renderEditor();
    });
  });
}

function renderInspector() {
  const object = getSelectedObject();
  const inspector = getElement('inspectorContent');

  if (!object) {
    inspector.innerHTML = '<p>No hay objeto seleccionado.</p>';
    return;
  }

  inspector.innerHTML = `
    <div class="property-row">
      <span>Nombre</span>
      <strong>${escapeHtml(object.name)}</strong>
    </div>
    <div class="property-row">
      <span>Tipo</span>
      <strong>${escapeHtml(object.type)}</strong>
    </div>
    <div class="property-row">
      <span>Posición</span>
      <strong>0, 0, 0</strong>
    </div>
    <div class="property-row">
      <span>Rotación</span>
      <strong>0°, 0°, 0°</strong>
    </div>
    <div class="property-row">
      <span>Escala</span>
      <strong>1, 1, 1</strong>
    </div>
  `;
}

function renderAssets() {
  getElement('assetList').innerHTML = state.assets.map((asset) => `
    <article class="asset-item">
      <span>${asset.icon}</span>
      <div>
        <strong>${escapeHtml(asset.name)}</strong>
        <small>${escapeHtml(asset.type)}</small>
      </div>
    </article>
  `).join('');
}

function renderEditor() {
  renderHeader();
  renderHierarchy();
  renderInspector();
  renderAssets();
}

function switchPanel(panelName) {
  document.querySelectorAll('.editor-tab').forEach((tab) => {
    tab.classList.toggle('active', tab.dataset.panel === panelName);
  });

  document.querySelectorAll('.editor-panel').forEach((panel) => {
    panel.classList.toggle('active', panel.id === `${panelName}Panel`);
  });
}

function addDemoObject() {
  const number = state.objects.length + 1;
  state.objects.push({
    id: `object-${Date.now()}`,
    name: `Objeto ${number}`,
    type: 'mesh',
    icon: '🧱'
  });

  state.selectedObjectId = state.objects.at(-1).id;
  saveEditorState(state);
  renderEditor();
}

function testProject() {
  window.alert('Modo probar juego llegará después. Por ahora este es el primer editor visual, carajo.');
}

export function mountEditorPage() {
  document.querySelectorAll('.editor-tab').forEach((tab) => {
    tab.addEventListener('click', () => switchPanel(tab.dataset.panel));
  });

  getElement('addObjectButton').addEventListener('click', addDemoObject);
  getElement('playButton').addEventListener('click', testProject);

  renderEditor();
}
