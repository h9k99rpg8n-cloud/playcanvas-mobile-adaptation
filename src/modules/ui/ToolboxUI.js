const PRIMITIVES = [
  { type: 'cube', label: 'Cubo', icon: '📦' },
  { type: 'sphere', label: 'Esfera', icon: '⚽' },
  { type: 'capsule', label: 'Cápsula', icon: '💊' },
  { type: 'cylinder', label: 'Cilindro', icon: '🧪' },
  { type: 'quad', label: 'Quad', icon: '🖼️' }
];

export class ToolboxUI {
  constructor({ openButton, modal, closeButton, grid, onCreate }) {
    this.openButton = openButton;
    this.modal = modal;
    this.closeButton = closeButton;
    this.grid = grid;
    this.onCreate = onCreate;
    this.render();
    this.bind();
  }

  render() {
    this.grid.innerHTML = PRIMITIVES.map((item) => `
      <button class="primitive-button" data-primitive="${item.type}" type="button">
        <span class="primitive-icon">${item.icon}</span>
        <strong>${item.label}</strong>
      </button>
    `).join('');
  }

  bind() {
    this.openButton.addEventListener('click', () => this.open());
    this.closeButton.addEventListener('click', () => this.close());
    this.modal.addEventListener('click', (event) => {
      if (event.target === this.modal) this.close();
    });

    this.grid.querySelectorAll('[data-primitive]').forEach((button) => {
      button.addEventListener('click', () => {
        const type = button.dataset.primitive;
        this.close();
        this.onCreate(type);
      });
    });
  }

  open() {
    this.modal.hidden = false;
    requestAnimationFrame(() => this.modal.classList.add('open'));
  }

  close() {
    this.modal.classList.remove('open');
    window.setTimeout(() => {
      this.modal.hidden = true;
    }, 160);
  }
}
