import { readStorage, writeStorage } from '../modules/data/Storage.js';
import { TEMPLATES } from '../modules/templates/template-registry.js';

const key = 'launcher-installed-templates';

function make(tag, text = '') {
  const node = document.createElement(tag);
  node.textContent = text;
  return node;
}

async function getSet() {
  return new Set(await readStorage(key, []));
}

async function saveSet(set) {
  await writeStorage(key, [...set]);
}

async function syncTemplates() {
  const section = document.querySelector('[data-launcher-view="templates"]');
  if (!section) return;
  const installed = await getSet();
  TEMPLATES.filter((item) => !['empty-scene', 'basic-3d-scene'].includes(item.id)).forEach((template) => {
    let card = section.querySelector(`[data-template-card="${template.id}"]`);
    if (!card) {
      card = document.createElement('article');
      card.className = 'atlas-store-card';
      card.dataset.templateCard = template.id;
      card.appendChild(make('span', template.icon));
      const body = document.createElement('div');
      body.appendChild(make('h3', template.name));
      const description = make('p', template.description + ' Estado: ');
      const status = make('strong', 'No instalada');
      status.dataset.templateStatus = template.id;
      description.appendChild(status);
      const progress = document.createElement('div');
      progress.className = 'template-install-progress';
      progress.dataset.templateProgress = template.id;
      progress.appendChild(document.createElement('span'));
      body.append(description, progress);
      const button = make('button', 'Instalar');
      button.type = 'button';
      button.className = 'atlas-install-template';
      button.dataset.installTemplate = template.id;
      card.append(body, button);
      section.appendChild(card);
    }
    const ok = installed.has(template.id);
    const status = section.querySelector(`[data-template-status="${template.id}"]`);
    const button = section.querySelector(`[data-install-template="${template.id}"]`);
    const bar = section.querySelector(`[data-template-progress="${template.id}"] span`);
    if (status) status.textContent = ok ? 'Instalada' : 'No instalada';
    if (button) { button.textContent = ok ? 'Instalada' : 'Instalar'; button.disabled = ok; }
    if (bar) bar.style.width = ok ? '100%' : '0%';
  });
}

window.addEventListener('DOMContentLoaded', () => {
  syncTemplates();
  document.addEventListener('click', async (event) => {
    const button = event.target.closest?.('[data-install-template]');
    if (!button) return;
    const set = await getSet();
    set.add(button.dataset.installTemplate);
    await saveSet(set);
    await syncTemplates();
  });
});
