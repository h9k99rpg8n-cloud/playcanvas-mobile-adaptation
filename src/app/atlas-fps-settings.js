import { getProjects, updateProjectSettings } from '../modules/data/ProjectStore.js';

function make(tag, text = '') {
  const node = document.createElement(tag);
  node.textContent = text;
  return node;
}

async function drawFpsPanel() {
  const settings = document.querySelector('[data-launcher-view="settings"]');
  if (!settings) return;
  let panel = document.getElementById('atlasFpsSettingsPanel');
  if (!panel) {
    panel = document.createElement('article');
    panel.id = 'atlasFpsSettingsPanel';
    panel.className = 'atlas-info-card atlas-fps-settings';
    settings.appendChild(panel);
  }
  panel.textContent = '';
  panel.appendChild(make('h3', 'Toggle de FPS'));
  panel.appendChild(make('p', 'Activa o desactiva el contador por proyecto.'));
  const projects = await getProjects();
  if (projects.length === 0) panel.appendChild(make('p', 'No hay proyectos todavía.'));
  projects.forEach((project) => {
    const label = document.createElement('label');
    label.className = 'atlas-fps-row';
    const input = document.createElement('input');
    input.type = 'checkbox';
    input.checked = Boolean(project.settings?.showFps);
    input.addEventListener('change', () => updateProjectSettings(project.id, { showFps: input.checked }));
    label.append(input, make('span', project.name));
    panel.appendChild(label);
  });
}

window.addEventListener('DOMContentLoaded', drawFpsPanel);
