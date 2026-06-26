import * as THREE from 'three';
import { OrbitController } from '../camera/OrbitController.js';
import { ViewGizmo } from '../gizmos/ViewGizmo.js';
import { SceneManager } from '../scenemanager/SceneManager.js';
import { createViewportGrid } from '../grid/viewport-grid.js';
import { setupViewportEnvironment } from './viewport-environment.js';

export class ViewportRenderer {
  constructor(canvas, gizmoCanvas = null) {
    this.canvas = canvas;
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(60, 1, 0.1, 1000);
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    setupViewportEnvironment(this.scene, this.renderer);
    this.scene.add(createViewportGrid());
    this.sceneManager = new SceneManager(this.scene);
    this.cameraController = new OrbitController(this.camera, canvas);
    this.viewGizmo = gizmoCanvas ? new ViewGizmo(gizmoCanvas, this.camera, this.cameraController) : null;
    this.clock = new THREE.Clock();
    this.animate();
  }

  addPrimitive(type) {
    return this.sceneManager.addPrimitive(type);
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
    if (this.viewGizmo) this.viewGizmo.update();
    requestAnimationFrame(() => this.animate());
  }
}
