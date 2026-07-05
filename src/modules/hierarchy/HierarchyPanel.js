export class HierarchyPanel {
  constructor({ sceneManager, transformGizmo }) {
    this.sceneManager = sceneManager;
    this.transformGizmo = transformGizmo;
    this.opened = false;
    this.large = false;

    this.button = document.createElement('button');
    this.button.type = 'button';
    this.button.textContent = 'Jerarquía';
    Object.assign(this.button.style, {
      position: 'fixed', left: '14px', top: '96px', zIndex: '9999', minWidth: '110px', height: '42px',
      border: '1px solid #555', borderRadius: '12px', color: '#fff', background: '#242424', fontWeight: '900',
      boxShadow: '0 12px 28px rgba(0,0,0,.28)'
    });

    this.root = document.createElement('section');
    Object.assign(this.root.style, {
      position: 'fixed', left: '12px', top: '146px', zIndex: '9998', width: 'min(76vw, 290px)',
      maxHeight: 'calc(100dvh - 172px)', overflow: 'auto', padding: '12px', border: '1px solid #4a4a4a',
      borderRadius: '16px', background: '#1f1f1f', boxShadow: '0 22px 56px rgba(0,0,0,.42)',
      transform: 'translateX(-120%)', transition: 'transform .18s ease', display: 'grid', gap: '10px'
    });

    const header = document.createElement('div');
    Object.assign(header.style, { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' });

    const titleBox = document.createElement('div');
    const kicker = document.createElement('p');
    kicker.textContent = 'Atlas';
    Object.assign(kicker.style, { margin: '0', color: '#aaa', fontSize: '.66rem', fontWeight: '900', textTransform: 'uppercase' });
    const title = document.createElement('h2');
    title.textContent = 'Jerarquía';
    Object.assign(title.style, { margin: '0', color: '#fff', fontSize: '1.05rem' });
    titleBox.append(kicker, title);

    this.sizeButton = document.createElement('button');
    this.sizeButton.type = 'button';
    this.sizeButton.textContent = 'Grande';
    Object.assign(this.sizeButton.style, { minWidth: '64px', height: '34px', border: '1px solid #555', borderRadius: '10px', color: '#fff', background: '#333', fontWeight: '800' });

    const close = document.createElement('button');
    close.type = 'button';
    close.textContent = '×';
    Object.assign(close.style, { width: '34px', height: '34px', border: '1px solid #555', borderRadius: '10px', color: '#fff', background: '#333', fontSize: '1.1rem' });

    this.list = document.createElement('div');
    Object.assign(this.list.style, { display: 'grid', gap: '8px' });

    header.append(titleBox, this.sizeButton, close);
    this.root.append(header, this.list);
    document.querySelector('.scene-editor').append(this.button, this.root);

    this.button.addEventListener('click', () => this.toggle());
    this.sizeButton.addEventListener('click', () => this.toggleSize());
    close.addEventListener('click', () => this.close());
    this.sceneManager.addEventListener('objects-changed', () => this.render());
    this.sceneManager.addEventListener('selection-changed', () => this.render());
    this.render();
  }

  toggle() { this.opened ? this.close() : this.open(); }
  open() { this.opened = true; this.root.style.transform = 'translateX(0)'; this.button.style.background = '#3a3a3a'; }
  close() { this.opened = false; this.root.style.transform = 'translateX(-120%)'; this.button.style.background = '#242424'; }

  toggleSize() {
    this.large = !this.large;
    this.root.style.width = this.large ? 'min(94vw, 390px)' : 'min(76vw, 290px)';
    this.sizeButton.textContent = this.large ? 'Compacta' : 'Grande';
  }

  render() {
    const objects = this.sceneManager.objects;
    this.list.replaceChildren();

    if (objects.length === 0) {
      const empty = document.createElement('article');
      Object.assign(empty.style, { border: '1px solid #444', borderRadius: '12px', background: '#2b2b2b', padding: '10px', color: '#fff', display: 'grid', gap: '4px' });
      const strong = document.createElement('strong');
      strong.textContent = 'Sin objetos';
      const small = document.createElement('small');
      small.textContent = 'Crea una figura o abre una plantilla.';
      small.style.color = '#bbb';
      empty.append(strong, small);
      this.list.append(empty);
      return;
    }

    objects.forEach((object, index) => {
      const selected = object === this.sceneManager.selected;
      const item = document.createElement('article');
      Object.assign(item.style, { border: selected ? '1px solid #8ab4ff' : '1px solid #444', borderRadius: '12px', background: selected ? '#343a46' : '#2b2b2b', padding: '9px', display: 'grid', gap: '7px' });

      const select = document.createElement('button');
      select.type = 'button';
      Object.assign(select.style, { width: '100%', border: '0', padding: '0', display: 'grid', gap: '2px', color: '#fff', textAlign: 'left', background: 'transparent' });

      const type = document.createElement('span');
      type.textContent = object.userData.primitiveType || 'objeto';
      Object.assign(type.style, { color: '#cfcfcf', fontSize: '.66rem', fontWeight: '900', textTransform: 'uppercase' });
      const name = document.createElement('strong');
      name.textContent = object.name || `Objeto ${index + 1}`;
      select.append(type, name);

      const input = document.createElement('input');
      input.value = object.name || `Objeto ${index + 1}`;
      Object.assign(input.style, { width: '100%', minHeight: '36px', border: '1px solid #555', borderRadius: '10px', padding: '8px 10px', color: '#fff', background: '#181818', outline: 'none' });

      select.addEventListener('click', () => { this.sceneManager.select(object); this.transformGizmo.attach(object); });
      input.addEventListener('change', () => { this.sceneManager.renameObject(object, input.value); });

      item.append(select, input);
      this.list.append(item);
    });
  }
}
