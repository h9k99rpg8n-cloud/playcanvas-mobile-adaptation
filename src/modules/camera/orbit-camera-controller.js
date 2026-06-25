import * as THREE from 'three';

const PRESETS = {
  x: new THREE.Vector3(12, 0, 0),
  y: new THREE.Vector3(0, 12, 0),
  z: new THREE.Vector3(0, 0, 12),
  home: new THREE.Vector3(8, 6, 8)
};

const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const ease = (t) => 1 - Math.pow(1 - t, 3);

export class OrbitCameraController {
  constructor(camera, canvas) {
    this.camera = camera;
    this.canvas = canvas;
    this.target = new THREE.Vector3(0, 0, 0);
    this.from = PRESETS.home.clone();
    this.to = PRESETS.home.clone();
    this.pointer = null;
    this.radius = PRESETS.home.length();
    this.theta = Math.atan2(PRESETS.home.x, PRESETS.home.z);
    this.phi = Math.acos(PRESETS.home.y / this.radius);
    this.clock = 1;
    this.isMoving = false;
    this.dragSensitivity = 0.0048;
    this.zoomSensitivity = 0.006;
    this.bind();
    this.camera.position.copy(PRESETS.home);
    this.camera.lookAt(this.target);
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
      this.theta -= dx * this.dragSensitivity;
      this.phi = clamp(this.phi + dy * this.dragSensitivity, 0.08, Math.PI - 0.08);
      this.pointer = { x: e.clientX, y: e.clientY };
      this.orbitToTarget();
    });

    this.canvas.addEventListener('pointerup', () => { this.pointer = null; });
    this.canvas.addEventListener('pointercancel', () => { this.pointer = null; });

    this.canvas.addEventListener('wheel', (e) => {
      e.preventDefault();
      this.radius = clamp(this.radius + e.deltaY * this.zoomSensitivity, 2.8, 60);
      this.orbitToTarget();
    }, { passive: false });
  }

  orbitToTarget() {
    const x = this.radius * Math.sin(this.phi) * Math.sin(this.theta);
    const y = this.radius * Math.cos(this.phi);
    const z = this.radius * Math.sin(this.phi) * Math.cos(this.theta);
    this.beginMove(new THREE.Vector3(x, y, z));
  }

  beginMove(position) {
    this.from.copy(this.camera.position);
    this.to.copy(position);
    this.clock = 0;
    this.isMoving = true;
  }

  moveTo(axis) {
    const position = PRESETS[axis] || PRESETS.home;
    this.radius = position.length();
    this.theta = Math.atan2(position.x, position.z);
    this.phi = Math.acos(clamp(position.y / this.radius, -1, 1));
    this.beginMove(position);
  }

  reset() {
    this.moveTo('home');
  }

  update(delta) {
    if (this.clock < 1) {
      this.clock = clamp(this.clock + delta * 3.8, 0, 1);
      this.camera.position.lerpVectors(this.from, this.to, ease(this.clock));
      this.isMoving = true;
    } else {
      this.isMoving = Boolean(this.pointer);
    }

    this.camera.up.set(0, 1, 0);
    this.camera.lookAt(this.target);
  }
}
