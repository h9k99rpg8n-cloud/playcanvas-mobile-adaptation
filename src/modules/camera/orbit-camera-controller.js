import * as THREE from 'three';

const PRESETS = {
  x: new THREE.Vector3(10, 0, 0),
  y: new THREE.Vector3(0, 10, 0.001),
  z: new THREE.Vector3(0, 0, 10),
  home: new THREE.Vector3(7, 5, 7)
};

const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const smooth = (t) => 0.5 - Math.cos(t * Math.PI) * 0.5;

export class OrbitCameraController {
  constructor(camera, canvas) {
    this.camera = camera;
    this.canvas = canvas;
    this.target = new THREE.Vector3(0, 0, 0);
    this.from = PRESETS.home.clone();
    this.to = PRESETS.home.clone();
    this.pointer = null;
    this.radius = 11;
    this.theta = Math.PI / 4;
    this.phi = Math.PI / 3;
    this.clock = 1;
    this.isMoving = false;
    this.bind();
    this.camera.position.copy(PRESETS.home);
  }

  bind() {
    this.canvas.addEventListener('pointerdown', (e) => {
      this.canvas.setPointerCapture(e.pointerId);
      this.pointer = { x: e.clientX, y: e.clientY };
      this.isMoving = true;
    });

    this.canvas.addEventListener('pointermove', (e) => {
      if (!this.pointer) return;
      const dx = e.clientX - this.pointer.x;
      const dy = e.clientY - this.pointer.y;
      this.theta -= dx * 0.008;
      this.phi = clamp(this.phi + dy * 0.006, 0.14, Math.PI - 0.14);
      this.pointer = { x: e.clientX, y: e.clientY };
      this.setOrbitTarget();
    });

    this.canvas.addEventListener('pointerup', () => { this.pointer = null; });
    this.canvas.addEventListener('pointercancel', () => { this.pointer = null; });

    this.canvas.addEventListener('wheel', (e) => {
      e.preventDefault();
      this.radius = clamp(this.radius + e.deltaY * 0.01, 3.4, 40);
      this.setOrbitTarget();
    }, { passive: false });
  }

  setOrbitTarget() {
    const x = this.radius * Math.sin(this.phi) * Math.sin(this.theta);
    const y = this.radius * Math.cos(this.phi);
    const z = this.radius * Math.sin(this.phi) * Math.cos(this.theta);
    this.from.copy(this.camera.position);
    this.to.set(x, y, z);
    this.clock = 0;
    this.isMoving = true;
  }

  moveTo(axis) {
    const next = PRESETS[axis] || PRESETS.home;
    this.from.copy(this.camera.position);
    this.to.copy(next);
    this.clock = 0;
    this.isMoving = true;
  }

  reset() {
    this.moveTo('home');
  }

  update(delta) {
    if (this.clock < 1) {
      this.clock = clamp(this.clock + delta * 2.7, 0, 1);
      this.camera.position.lerpVectors(this.from, this.to, smooth(this.clock));
      this.isMoving = true;
    } else {
      this.isMoving = false;
    }
    this.camera.lookAt(this.target);
  }
}
