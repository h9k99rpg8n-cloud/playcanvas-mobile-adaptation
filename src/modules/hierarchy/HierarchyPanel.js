import { LongPressDragGesture } from './LongPressDragGesture.js';

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
    this.touchDropElement = null;
    this.activeTouchPayload = null;
    this.touchGesture = new LongPressDragGesture({
      onActivate: (payload) => this.activateTouchDrag(payload)
    });

    this.toggleButton = document.createElement('button');
    this.toggleButton.type = 'button';
    this.toggleButton.className = 'atlas-hierarchy-toggle';
    this.toggleButton.setAttribute('aria-label', 'Abrir jerarquía');
    this.toggleButton.textContent = '☷';

    this.root = document.createElement('aside');
    this.root.className = 'atlas-hierarchy-sidebar';

    const header = document.createElement('header');
    header.className = 'atlas-hierarchy-header';
    header.innerHTML = '<div><p>Atlas</p><h2>Jerarquía</h2></div><small>Arrastra · en móvil mantén pulsado</small>';

    this.rootDropZone = document.createElement('div');
    this.rootDropZone.className = 'atlas-hierarchy-root-drop';
    this.rootDropZone.textContent = 'Suelta aquí para dejarlo como raíz';
    this.rootDropZone.setAttribute('role', 'status');
    header.append(this.rootDropZone);

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
  toggleCollapse(object) { const id = this.objectId(object); if (this.collapsed.has(id)) this.collapsed.delete(id); else this.collapsed.add(id); this.render(); }
  selectObject(object) { this.sceneManager.select(object); if (this.selectionEnabled) this.transformGizmo.attach(object); }

  touchPoint(touch) {
    return { x: touch.clientX, y: touch.clientY };
  }

  canParent(child, parent) {
    return Boolean(parent && parent !== child && !this.sceneManager.isDescendant(parent, child));
  }

  activateTouchDrag(payload) {
    this.draggedObject = payload.object;
    this.activeTouchPayload = payload;
    payload.row.classList.add('dragging');
    this.root.classList.add('touch-reparenting');
    navigator.vibrate?.(18);
  }

  setTouchDropElement(element) {
    if (this.touchDropElement === element) return;
    this.touchDropElement?.classList.remove('drop-target');
    this.touchDropElement = element;
    this.touchDropElement?.classList.add('drop-target');
  }

  updateTouchDropTarget(touch) {
    const element = document.elementFromPoint(touch.clientX, touch.clientY);
    if (element && this.rootDropZone.contains(element)) {
      this.setTouchDropElement(this.rootDropZone);
      return;
    }

    const row = element?.closest?.('[data-object-id]');
    const parent = row ? this.objectMap.get(row.dataset.objectId) : null;
    this.setTouchDropElement(this.canParent(this.draggedObject, parent) ? row : null);
  }

  clearTouchDrag() {
    this.touchGesture.cancel();
    this.activeTouchPayload?.row.classList.remove('dragging');
    this.activeTouchPayload = null;
    this.draggedObject = null;
    this.root.classList.remove('touch-reparenting');
    this.setTouchDropElement(null);
  }

  startTouchDrag(event, object, row) {
    if (event.touches.length !== 1) return;
    if (event.target.closest('.atlas-hierarchy-arrow, .atlas-hierarchy-name, .atlas-hierarchy-add-child')) return;
    this.touchGesture.begin(this.touchPoint(event.touches[0]), { object, row });
  }

  moveTouchDrag(event) {
    const touch = event.touches[0];
    if (!touch || !this.touchGesture.move(this.touchPoint(touch))) return;
    if (event.cancelable) event.preventDefault();
    this.updateTouchDropTarget(touch);
  }

  endTouchDrag(event) {
    const payload = this.touchGesture.finish();
    if (!payload) {
      this.clearTouchDrag();
      return;
    }

    if (event.cancelable) event.preventDefault();
    const touch = event.changedTouches?.[0];
    const element = touch ? document.elementFromPoint(touch.clientX, touch.clientY) : null;
    const dropOnRoot = Boolean(element && this.rootDropZone.contains(element));
    const row = element?.closest?.('[data-object-id]');
    const parent = row ? this.objectMap.get(row.dataset.objectId) : null;
    const child = payload.object;
    this.clearTouchDrag();

    if (dropOnRoot) this.sceneManager.setParent(child, null);
    else if (this.canParent(child, parent)) this.sceneManager.setParent(child, parent);
  }

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
    row.addEventListener('dragover', (event) => { event.preventDefault(); if (this.canParent(this.draggedObject, object)) row.classList.add('drop-target'); });
    row.addEventListener('dragleave', () => row.classList.remove('drop-target'));
    row.addEventListener('drop', (event) => { event.preventDefault(); event.stopPropagation(); row.classList.remove('drop-target'); if (this.draggedObject && this.draggedObject !== object) this.sceneManager.setParent(this.draggedObject, object); this.draggedObject = null; });
    row.addEventListener('touchstart', (event) => this.startTouchDrag(event, object, row), { passive: true });
    row.addEventListener('touchmove', (event) => this.moveTouchDrag(event), { passive: false });
    row.addEventListener('touchend', (event) => this.endTouchDrag(event), { passive: false });
    row.addEventListener('touchcancel', () => this.clearTouchDrag(), { passive: true });

    this.list.append(row);
    if (!isCollapsed) children.forEach((child) => this.renderObject(child, depth + 1));
  }
}
