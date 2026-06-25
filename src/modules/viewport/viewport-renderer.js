import * as THREE from 'three';
import { OrbitCameraController } from '../camera/orbit-camera-controller.js';
import { createViewportGrid } from '../grid/viewport-grid.js';
import { setupViewportEnvironment } from './viewport-environment.js';

export class ViewportRenderer {
  constructor(canvas) {
    this.canvas = canvas;
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(60, 1, 0.1, 300);
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    setupViewportEnvironment(this.scene, this.renderer);
    this.scene.add(createViewportGrid());
    this.cameraController = new OrbitCameraController(this.camera, canvas);
    this.clock = new THREE.Clock();
    this.animate();
  }

  resize() {
    const width = this.canvas.clientWidth;
    const height = this.canvas.clientHeight;
    this.renderer.setSize(width, height, false);
    this.camera.aspect = width / Math.max(height, 1);
    this.camera.updateProjectionMatrix();
  }

  animate() {
    const delta = this.clock.getDelta();
    this.resize();
    this.cameraController.update(delta);
    this.renderer.render(this.scene, this.camera);
    requestAnimationFrame(() => this.animate());
  }
}
