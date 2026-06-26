import { TransformControls } from 'three/addons/controls/TransformControls.js';

export class TransformGizmo {
  constructor(camera, canvas, orbitController) {
    this.camera = camera;
    this.canvas = canvas;
    this.orbitController = orbitController;
    this.control = new TransformControls(camera, canvas);
    this.control.setMode('translate');
    this.control.setSize(1.45);
    this.control.visible = false;
    this.control.addEventListener('dragging-changed', (event) => {
      this.orbitController.setEnabled(!event.value);
    });
  }

  attach(object) {
    this.control.attach(object);
    this.control.visible = true;
  }

  detach() {
    this.control.detach();
    this.control.visible = false;
  }

  setMode(mode) {
    this.control.setMode(mode);
    this.control.setSize(mode === 'rotate' ? 1.35 : 1.6);
  }
}
