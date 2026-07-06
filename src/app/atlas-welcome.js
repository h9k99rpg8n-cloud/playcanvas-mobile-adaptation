import { ATLAS_ENGINE_LABEL, ATLAS_UPDATE_SUMMARY } from '../core/version.js';

function addText(parent, tag, text, className = '') {
  const node = document.createElement(tag);
  node.textContent = text;
  if (className) node.className = className;
  parent.appendChild(node);
  return node;
}

window.addEventListener('DOMContentLoaded', () => {
  const layer = document.createElement('section');
  layer.className = 'atlas-welcome-layer';
  const card = document.createElement('div');
  card.className = 'atlas-welcome-card';
  addText(card, 'span', 'A');
  addText(card, 'p', 'Atlas Engine');
  addText(card, 'h1', ATLAS_ENGINE_LABEL);
  addText(card, 'strong', 'Nueva Actualización');
  const list = document.createElement('ul');
  ATLAS_UPDATE_SUMMARY.slice(0, 4).forEach((item) => addText(list, 'li', item));
  const button = addText(card, 'button', 'Entrar');
  button.type = 'button';
  card.appendChild(list);
  card.appendChild(button);
  layer.appendChild(card);
  document.body.appendChild(layer);
  const close = () => layer.classList.add('closing');
  button.addEventListener('click', close);
  window.setTimeout(close, 1500);
});
