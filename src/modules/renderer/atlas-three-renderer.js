import { ViewportRenderer } from '../viewport/viewport-renderer.js';

export class AtlasThreeRenderer {
  constructor(canvas) {
    this.viewport = new ViewportRenderer(canvas);
    this.cameraController = this.viewport.cameraController;
  }

  moveCameraTo(axis) {
    this.viewport.cameraController.moveTo(axis);
  }

  resetCamera() {
    this.viewport.cameraController.reset();
  }
}
