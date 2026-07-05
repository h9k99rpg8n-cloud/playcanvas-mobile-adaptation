export class HierarchyPanel {
  constructor({ sceneManager, transformGizmo }) {
    this.sceneManager = sceneManager;
    this.transformGizmo = transformGizmo;
    this.opened = false;

    this.button = document.createElement('button');
    this.button.className = 'atlas-hierarchy-toggle';
    this.button.type = 'button';
    this.button.textContent = '☰';

    this.root = document.createElement('section');
    this.root.className = 'atlas-hierarchy-panel';

    const header = document.createElement('div');
    header.className = 'atlas-hierarchy-header';

    const titleBox = document.createElement('div');
    const kicker = document.createElement('p');
    kicker.textContent = 'El Orden de Atlas';
    const title = document.createElement('h2');
    title.textContent = 'Jerarquía';
    titleBox.append(kicker, title);

    const close = document.createElement('button');
    close.className = 'atlas-hierarchy-close';
    close.type = 'button';
    close.textContent = '×';

    this.list = document.createElement('div');
    this.list.className = 'atlas-hierarchy-list';

    header.append(titleBox, close);
    this.root.append(header, this.list);
    document.querySelector('.scene-editor').append(this.button, this.root);

    this.button.addEventListener('click', () => this.toggle());
    close.addEventListener('click', () => this.close());
    this.sceneManager.addEventListener('objects-changed', () => this.render());
    this.sceneManager.addEventListener('selection-changed', () => this.render());
    this.render();
  }

  toggle() {
    this.opened ? this.close() : this.open();
  }

  open() {
    this.opened = true;
    this.root.classList.add('open');
    this.button.classList.add('active');
  }

  close() {
    this.opened = false;
    this.root.classList.remove('open');
    this.button.classList.remove('active');
  }

  render() {
    const objects = this.sceneManager.objects;
    this.list.replaceChildren();

    if (objects.length === 0) {
      const empty = document.createElement('article');
      empty.className = 'atlas-hierarchy-empty';
      const strong = document.createElement('strong');
      strong.textContent = 'Sin objetos';
      const small = document.createElement('small');
      small.textContent = 'Crea una figura o abre una plantilla.';
      empty.append(strong, small);
      this.list.append(empty);
      return;
    }

    objects.forEach((object, index) => {
      const item = document.createElement('article');
      item.className = 'atlas-hierarchy-item';
      if (object === this.sceneManager.selected) item.classList.add('selected');

      const select = document.createElement('button');
      select.className = 'atlas-hierarchy-select';
      select.type = 'button';

      const type = document.createElement('span');
      type.textContent = object.userData.primitiveType || 'objeto';
      const name = document.createElement('strong');
      name.textContent = object.name || `Objeto ${index + 1}`;
      select.append(type, name);

      const input = document.createElement('input');
      input.className = 'atlas-hierarchy-name';
      input.value = object.name || `Objeto ${index + 1}`;

      select.addEventListener('click', () => {
        this.sceneManager.select(object);
        this.transformGizmo.attach(object);
      });

      input.addEventListener('change', () => {
        this.sceneManager.renameObject(object, input.value);
      });

      item.append(select, input);
      this.list.append(item);
    });
  }
}
