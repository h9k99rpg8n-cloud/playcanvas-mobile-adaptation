export class HierarchyPanel {
  constructor({ sceneManager, transformGizmo }) {
    this.sceneManager = sceneManager;
    this.transformGizmo = transformGizmo;
    this.opened = false;

    this.button = document.createElement('button');
    this.button.className = 'atlas-hierarchy-toggle';
    this.button.type = 'button';
    this.button.textContent = '☰ Jerarquía';
    Object.assign(this.button.style, {
      position: 'fixed',
      left: '14px',
      top: '96px',
      zIndex: '9999',
      minWidth: '118px',
      height: '46px',
      border: '1px solid #00d4ff',
      borderRadius: '16px',
      color: '#ffffff',
      background: '#0b1020',
      fontWeight: '900',
      boxShadow: '0 16px 36px rgba(0,0,0,.35)'
    });

    this.root = document.createElement('section');
    this.root.className = 'atlas-hierarchy-panel';
    Object.assign(this.root.style, {
      position: 'fixed',
      left: '12px',
      top: '150px',
      zIndex: '9998',
      width: 'min(84vw, 330px)',
      maxHeight: 'calc(100dvh - 178px)',
      overflow: 'auto',
      padding: '14px',
      border: '1px solid #00d4ff',
      borderRadius: '22px',
      background: '#080d18',
      boxShadow: '0 22px 56px rgba(0,0,0,.42)',
      transform: 'translateX(-120%)',
      transition: 'transform .18s ease',
      display: 'grid',
      gap: '12px'
    });

    const header = document.createElement('div');
    header.className = 'atlas-hierarchy-header';
    Object.assign(header.style, { display: 'flex', justifyContent: 'space-between', gap: '10px' });

    const titleBox = document.createElement('div');
    const kicker = document.createElement('p');
    kicker.textContent = 'El Orden de Atlas';
    Object.assign(kicker.style, { margin: '0', color: '#00d4ff', fontSize: '.68rem', fontWeight: '900' });
    const title = document.createElement('h2');
    title.textContent = 'Jerarquía';
    Object.assign(title.style, { margin: '0', color: '#fff', fontSize: '1.25rem' });
    titleBox.append(kicker, title);

    const close = document.createElement('button');
    close.className = 'atlas-hierarchy-close';
    close.type = 'button';
    close.textContent = '×';
    Object.assign(close.style, {
      width: '40px',
      height: '40px',
      border: '1px solid #2a3a55',
      borderRadius: '14px',
      color: '#fff',
      background: '#101827',
      fontSize: '1.25rem'
    });

    this.list = document.createElement('div');
    this.list.className = 'atlas-hierarchy-list';
    Object.assign(this.list.style, { display: 'grid', gap: '10px' });

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
    this.root.style.transform = 'translateX(0)';
    this.button.style.background = '#0b7cff';
  }

  close() {
    this.opened = false;
    this.root.style.transform = 'translateX(-120%)';
    this.button.style.background = '#0b1020';
  }

  render() {
    const objects = this.sceneManager.objects;
    this.list.replaceChildren();

    if (objects.length === 0) {
      const empty = document.createElement('article');
      Object.assign(empty.style, { border: '1px solid #26344f', borderRadius: '16px', background: '#111827', padding: '10px', color: '#fff', display: 'grid', gap: '4px' });
      const strong = document.createElement('strong');
      strong.textContent = 'Sin objetos';
      const small = document.createElement('small');
      small.textContent = 'Crea una figura o abre una plantilla.';
      small.style.color = '#aeb7d8';
      empty.append(strong, small);
      this.list.append(empty);
      return;
    }

    objects.forEach((object, index) => {
      const item = document.createElement('article');
      Object.assign(item.style, { border: '1px solid #26344f', borderRadius: '16px', background: object === this.sceneManager.selected ? '#0b2546' : '#111827', padding: '10px', display: 'grid', gap: '8px' });
      if (object === this.sceneManager.selected) item.style.borderColor = '#00d4ff';

      const select = document.createElement('button');
      select.type = 'button';
      Object.assign(select.style, { width: '100%', border: '0', padding: '0', display: 'grid', gap: '2px', color: '#fff', textAlign: 'left', background: 'transparent' });

      const type = document.createElement('span');
      type.textContent = object.userData.primitiveType || 'objeto';
      Object.assign(type.style, { color: '#00d4ff', fontSize: '.68rem', fontWeight: '900', textTransform: 'uppercase' });
      const name = document.createElement('strong');
      name.textContent = object.name || `Objeto ${index + 1}`;
      select.append(type, name);

      const input = document.createElement('input');
      input.value = object.name || `Objeto ${index + 1}`;
      Object.assign(input.style, { width: '100%', minHeight: '38px', border: '1px solid #2a3a55', borderRadius: '12px', padding: '8px 10px', color: '#fff', background: '#050914', outline: 'none' });

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
