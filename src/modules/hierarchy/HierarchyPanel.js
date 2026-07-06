export class HierarchyPanel {
  constructor({ sceneManager, transformGizmo }) {
    this.sceneManager = sceneManager;
    this.transformGizmo = transformGizmo;
    this.collapsed = new Set();
    this.draggedObject = null;

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
    document.querySelector('.scene-editor').append(this.root);

    this.sceneManager.addEventListener('objects-changed', () => this.render());
    this.sceneManager.addEventListener('selection-changed', () => this.render());
    this.render();
  }

  objectId(object) {
    return this.sceneManager.ensureObjectId(object);
  }

  toggleCollapse(object) {
    const id = this.objectId(object);
    if (this.collapsed.has(id)) this.collapsed.delete(id);
    else this.collapsed.add(id);
    this.render();
  }

  selectObject(object) {
    this.sceneManager.select(object);
    this.transformGizmo.attach(object);
  }

  render() {
    this.list.replaceChildren();
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
    arrow.addEventListener('click', (event) => {
      event.stopPropagation();
      if (hasChildren) this.toggleCollapse(object);
    });

    const main = document.createElement('button');
    main.type = 'button';
    main.className = 'atlas-hierarchy-main';
    main.innerHTML = `<span>${object.userData.primitiveType || 'objeto'}</span><strong>${object.name || 'Objeto'}</strong>`;
    main.addEventListener('click', () => this.selectObject(object));

    const rename = document.createElement('input');
    rename.className = 'atlas-hierarchy-name';
    rename.value = object.name || 'Objeto';
    rename.addEventListener('change', () => this.sceneManager.renameObject(object, rename.value));
    rename.addEventListener('click', (event) => event.stopPropagation());

    row.append(arrow, main, rename);

    row.addEventListener('dragstart', () => {
      this.draggedObject = object;
      row.classList.add('dragging');
    });
    row.addEventListener('dragend', () => {
      this.draggedObject = null;
      row.classList.remove('dragging');
    });
    row.addEventListener('dragover', (event) => {
      event.preventDefault();
      if (this.draggedObject && this.draggedObject !== object) row.classList.add('drop-target');
    });
    row.addEventListener('dragleave', () => row.classList.remove('drop-target'));
    row.addEventListener('drop', (event) => {
      event.preventDefault();
      event.stopPropagation();
      row.classList.remove('drop-target');
      if (this.draggedObject && this.draggedObject !== object) this.sceneManager.setParent(this.draggedObject, object);
      this.draggedObject = null;
    });

    this.list.append(row);
    if (!isCollapsed) children.forEach((child) => this.renderObject(child, depth + 1));
  }
}
