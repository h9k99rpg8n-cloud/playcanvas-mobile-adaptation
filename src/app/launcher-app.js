import { readStorage, writeStorage } from '../modules/data/Storage.js';
import { ATLAS_ENGINE_LABEL, ATLAS_LAUNCHER_VERSION, ATLAS_UPDATE_SUMMARY } from '../core/version.js';
import { TEMPLATES } from '../modules/templates/template-registry.js';
import { createProject, deleteProject, duplicateProject, getProjects, renameProject } from '../modules/data/ProjectStore.js';

const $ = (id) => document.getElementById(id);
const views = [...document.querySelectorAll('[data-launcher-view]')];
const nav = [...document.querySelectorAll('[data-launcher-target]')];
const installedKey = 'launcher-installed-templates';

function safe(value) {
  return String(value ?? '').replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&#039;');
}

function showView(id) {
  views.forEach((view) => view.classList.toggle('active', view.dataset.launcherView === id));
  nav.forEach((button) => button.classList.toggle('active', button.dataset.launcherTarget === id));
}

function readFile(file) {
  return new Promise((resolve) => {
    if (!file || !file.type.startsWith('image/')) return resolve(null);
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => resolve(null);
    reader.readAsDataURL(file);
  });
}

async function installedTemplates() {
  return new Set(await readStorage(installedKey, []));
}

async function saveInstalled(set) {
  await writeStorage(installedKey, [...set]);
}

async function renderTemplates() {
  const set = await installedTemplates();
  document.querySelectorAll('[data-install-template]').forEach((button) => {
    const id = button.dataset.installTemplate;
    const status = document.querySelector(`[data-template-status="${id}"]`);
    const progress = document.querySelector(`[data-template-progress="${id}"] span`);
    const installed = set.has(id);
    button.textContent = installed ? 'Instalada' : 'Instalar';
    button.disabled = installed;
    if (status) status.textContent = installed ? 'Instalada' : 'No instalada';
    if (progress) progress.style.width = installed ? '100%' : '0%';
  });

  const select = $('launcherTemplateSelect');
  if (select) {
    select.innerHTML = TEMPLATES
      .filter((template) => template.id === 'empty-scene' || set.has(template.id))
      .map((template) => `<option value="${safe(template.id)}">${safe(template.name)}</option>`)
      .join('');
  }
}

function card(project) {
  const icon = project.projectIcon ? `<img src="${project.projectIcon}" alt="" />` : `<span>${safe(project.templateIcon || '◇')}</span>`;
  return `<article class="atlas-project-card"><div class="atlas-project-icon">${icon}</div><div class="atlas-project-info"><h3>${safe(project.name)}</h3><p>${safe(project.description || project.template || 'Proyecto 3D')}</p><div class="atlas-project-data"><small>Actualizado: ${safe(project.updatedAt || 'Sin fecha')}</small><small>${safe(project.editorVersion || ATLAS_ENGINE_LABEL)}</small></div></div><div class="atlas-project-actions"><a class="atlas-open-project" href="scene-editor.html?project=${encodeURIComponent(project.id)}">Abrir</a><button class="atlas-project-menu-button" data-menu="${safe(project.id)}" type="button">⋯</button><div class="atlas-project-menu" data-options="${safe(project.id)}" hidden><button data-rename="${safe(project.id)}" type="button">Renombrar</button><button data-copy="${safe(project.id)}" type="button">Duplicar</button><button data-remove="${safe(project.id)}" type="button">Eliminar</button></div></div></article>`;
}

async function renderProjects() {
  const list = $('launcherProjectsList');
  const projects = await getProjects();
  if ($('launcherProjectCount')) $('launcherProjectCount').textContent = String(projects.length);
  if (!list) return;

  list.innerHTML = projects.length ? projects.map(card).join('') : '<article class="atlas-project-empty-card"><span>◇</span><h3>No hay proyectos todavía</h3><p>Crea una escena vacía o instala una plantilla.</p></article>';

  list.querySelectorAll('[data-menu]').forEach((button) => button.onclick = () => {
    const menu = list.querySelector(`[data-options="${button.dataset.menu}"]`);
    document.querySelectorAll('.atlas-project-menu').forEach((item) => { if (item !== menu) item.hidden = true; });
    menu.hidden = !menu.hidden;
  });

  list.querySelectorAll('[data-rename]').forEach((button) => button.onclick = async () => {
    const project = projects.find((item) => item.id === button.dataset.rename);
    const name = prompt('Nuevo nombre:', project?.name || 'Proyecto Atlas');
    if (name) await renameProject(button.dataset.rename, name);
    await renderProjects();
  });

  list.querySelectorAll('[data-copy]').forEach((button) => button.onclick = async () => {
    await duplicateProject(button.dataset.copy);
    await renderProjects();
  });

  list.querySelectorAll('[data-remove]').forEach((button) => button.onclick = async () => {
    const project = projects.find((item) => item.id === button.dataset.remove);
    if (confirm(`¿Eliminar "${project?.name || 'este proyecto'}"?`)) await deleteProject(button.dataset.remove);
    await renderProjects();
  });
}

async function openCreate() {
  await renderTemplates();
  $('launcherCreateModal').hidden = false;
  requestAnimationFrame(() => $('launcherCreateModal').classList.add('open'));
}

function closeCreate() {
  $('launcherCreateModal').classList.remove('open');
  setTimeout(() => $('launcherCreateModal').hidden = true, 160);
}

async function createFromForm(event) {
  event.preventDefault();
  const icon = await readFile($('launcherProjectIcon').files?.[0]);
  const project = await createProject({ name: $('launcherProjectName').value, description: $('launcherProjectDescription').value, templateId: $('launcherTemplateSelect').value, projectIcon: icon });
  location.assign('scene-editor.html?project=' + encodeURIComponent(project.id));
}

async function boot() {
  nav.forEach((button) => button.onclick = () => showView(button.dataset.launcherTarget));
  document.querySelectorAll('[data-install-template]').forEach((button) => button.onclick = async () => { const set = await installedTemplates(); set.add(button.dataset.installTemplate); await saveInstalled(set); await renderTemplates(); });
  $('openCreateProjectButton')?.addEventListener('click', openCreate);
  $('closeCreateProjectButton')?.addEventListener('click', closeCreate);
  $('launcherCreateProjectForm')?.addEventListener('submit', createFromForm);
  if ($('launcherUpdatesList')) $('launcherUpdatesList').innerHTML = ATLAS_UPDATE_SUMMARY.map((item) => `<li>${safe(item)}</li>`).join('');
  if ($('launcherVersionLabel')) $('launcherVersionLabel').textContent = `Launcher ${ATLAS_LAUNCHER_VERSION} · ${ATLAS_ENGINE_LABEL}`;
  await renderTemplates();
  await renderProjects();
  showView('projects');
}

boot();
