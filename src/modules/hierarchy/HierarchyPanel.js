export class HierarchyPanel {
  constructor({ sceneManager, transformGizmo, onAddChild }) {
    this.sceneManager = sceneManager;
    this.transformGizmo = transformGizmo;
    this.onAddChild = onAddChild;
    this.collapsed = new Set();
    this.draggedObject = null;
    this.objectMap = new Map();
    this.opened = false;
    this.selectionEnabled = true;

    this.toggleButton = document.createElement('button');
    this.toggleButton.type = 'button';
    this.toggleButton.className = 'atlas-hierarchy-toggle';
    this.toggleButton.setAttribute('aria-label', 'Abrir jerarquía');
    this.toggleButton.textContent = '☷';

    this.root = document.createElement('aside');
    this.root.className = 'atlas-hierarchy-sidebar';

    const header = document.createElement('header');
    header.className = 'atlas-hierarchy-header';
    header.innerHTML = '<div><p>Atlas</p><h2>Jerarquía</h2></div><small>Arrastra para parenting</small>';

    this.list = document.createElement('div');
    this.list.className = 'atlas-hierarchy-tree';
    this.list.addEventListener('dragover', (event) => event.preventDefault());
    this.list.addEventListener('drop', (event) => {
      event.preventDefault();
      if (this.draggedObject) this.sceneManager.setParent(this.draggedObject, null);
      this.draggedObject = null;
    });

    this.root.append(header, this.list);
    document.querySelector('.scene-editor').append(this.toggleButton, this.root);

    this.toggleButton.addEventListener('click', () => this.toggle());
    this.sceneManager.addEventListener('objects-changed', () => this.render());
    this.sceneManager.addEventListener('selection-changed', () => this.render());
    this.render();
    this.close();
  }

  setSelectionEnabled(enabled) {
    this.selectionEnabled = Boolean(enabled);
    if (!this.selectionEnabled) this.transformGizmo.detach();
  }

  toggle() { this.opened ? this.close() : this.open(); }
  open() { this.opened = true; this.root.classList.add('open'); this.toggleButton.classList.add('active'); this.toggleButton.setAttribute('aria-label', 'Cerrar jerarquía'); document.querySelector('.scene-editor')?.classList.add('hierarchy-open'); }
  close() { this.opened = false; this.root.classList.remove('open'); this.toggleButton.classList.remove('active'); this.toggleButton.setAttribute('aria-label', 'Abrir jerarquía'); document.querySelector('.scene-editor')?.classList.remove('hierarchy-open'); }

  objectId(object) { return this.sceneManager.ensureObjectId(object); }
  objectFromPoint(x, y) { const row = document.elementFromPoint(x, y)?.closest?.('[data-object-id]'); return row ? this.objectMap.get(row.dataset.objectId) : null; }
  toggleCollapse(object) { const id = this.objectId(object); if (this.collapsed.has(id)) this.collapsed.delete(id); else this.collapsed.add(id); this.render(); }
  selectObject(object) { this.sceneManager.select(object); if (this.selectionEnabled) this.transformGizmo.attach(object); }

  render() {
    this.list.replaceChildren();
    this.objectMap.clear();
    const roots = this.sceneManager.getRootObjects();
    if (this.sceneManager.objects.length === 0) {
      const empty = document.createElement('article');
      empty.className = 'atlas-hierarchy-empty';
      empty.innerHTML = '<strong>Sin objetos</strong><small>Crea una figura o abre una plantilla.</small>';
      this.list.append(empty);
      return;
    }
    roots.forEach((object) => this.renderObject(object, 0));
  }

  renderObject(object, depth) {
    const children = this.sceneManager.getObjectChildren(object);
    const hasChildren = children.length > 0;
    const id = this.objectId(object);
    const isCollapsed = this.collapsed.has(id);
    const selected = object === this.sceneManager.selected;
    this.objectMap.set(id, object);

    const row = document.createElement('article');
    row.className = 'atlas-hierarchy-row' + (selected ? ' selected' : '');
    row.draggable = true;
    row.style.setProperty('--depth', String(depth));
    row.dataset.objectId = id;

    const arrow = document.createElement('button');
    arrow.type = 'button';
    arrow.className = 'atlas-hierarchy-arrow';
    arrow.textContent = hasChildren ? (isCollapsed ? '▸' : '▾') : '•';
    arrow.disabled = !hasChildren;
    arrow.addEventListener('click', (event) => { event.stopPropagation(); if (hasChildren) this.toggleCollapse(object); });

    const main = document.createElement('button');
    main.type = 'button';
    main.className = 'atlas-hierarchy-main';
    main.innerHTML = `<span>${object.userData.primitiveType || 'objeto'}</span><strong>${object.name || 'Objeto'}</strong>`;
    main.addEventListener('click', () => this.selectObject(object));

    const rename = document.createElement('input');
    rename.className = 'atlas-hierarchy-name';
    rename.value = object.name || 'Objeto';
    rename.disabled = !selected;
    rename.title = selected ? 'Renombrar objeto seleccionado' : 'Selecciona el objeto para renombrarlo';
    rename.addEventListener('change', () => { if (selected) this.sceneManager.renameObject(object, rename.value); });
    rename.addEventListener('click', (event) => event.stopPropagation());

    const addChild = document.createElement('button');
    addChild.type = 'button';
    addChild.className = 'atlas-hierarchy-add-child';
    addChild.textContent = '+';
    addChild.hidden = !selected;
    addChild.addEventListener('click', (event) => { event.stopPropagation(); this.onAddChild?.(object, 'sphere'); });

    row.append(arrow, main, rename, addChild);

    row.addEventListener('dragstart', () => { this.draggedObject = object; row.classList.add('dragging'); });
    row.addEventListener('dragend', () => { this.draggedObject = null; row.classList.remove('dragging'); });
    row.addEventListener('dragover', (event) => { event.preventDefault(); if (this.draggedObject && this.draggedObject !== object) row.classList.add('drop-target'); });
    row.addEventListener('dragleave', () => row.classList.remove('drop-target'));
    row.addEventListener('drop', (event) => { event.preventDefault(); event.stopPropagation(); row.classList.remove('drop-target'); if (this.draggedObject && this.draggedObject !== object) this.sceneManager.setParent(this.draggedObject, object); this.draggedObject = null; });
    row.addEventListener('touchstart', () => { this.draggedObject = object; row.classList.add('dragging'); }, { passive: true });
    row.addEventListener('touchend', (event) => { row.classList.remove('dragging'); const touch = event.changedTouches?.[0]; const target = touch ? this.objectFromPoint(touch.clientX, touch.clientY) : null; if (this.draggedObject && target && target !== this.draggedObject) this.sceneManager.setParent(this.draggedObject, target); else if (this.draggedObject && !target) this.sceneManager.setParent(this.draggedObject, null); this.draggedObject = null; });

    this.list.append(row);
    if (!isCollapsed) children.forEach((child) => this.renderObject(child, depth + 1));
  }
}
