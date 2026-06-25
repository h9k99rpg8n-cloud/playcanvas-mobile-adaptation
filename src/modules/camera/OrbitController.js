import * as THREE from 'three';

const DIR = {
  x: new THREE.Vector3(1, 0, 0),
  y: new THREE.Vector3(0, 1, 0),
  z: new THREE.Vector3(0, 0, 1),
  home: new THREE.Vector3(1, 0.65, 1).normalize()
};

const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const ease = (t) => 1 - Math.pow(1 - t, 3);

export class OrbitController {
  constructor(camera, canvas) {
    this.camera = camera;
    this.canvas = canvas;
    this.target = new THREE.Vector3(0, 0, 0);
    this.enableDamping = true;
    this.dampingFactor = 0.05;
    this.maxPolarAngle = Math.PI / 2.1;
    this.minPolarAngle = 0.08;
    this.distance = 14;
    this.targetDistance = 14;
    this.theta = Math.PI / 4;
    this.phi = Math.PI / 3;
    this.targetTheta = this.theta;
    this.targetPhi = this.phi;
    this.drag = null;
    this.touches = new Map();
    this.lastPinch = null;
    this.tween = null;
    this.isMoving = false;
    this.bind();
    this.applyOrbit(true);
  }

  bind() {
    this.canvas.addEventListener('pointerdown', (e) => {
      this.canvas.setPointerCapture(e.pointerId);
      this.touches.set(e.pointerId, e);
      this.drag = { x: e.clientX, y: e.clientY };
      this.tween = null;
    });
    this.canvas.addEventListener('pointermove', (e) => this.handleMove(e));
    this.canvas.addEventListener('pointerup', (e) => this.end(e));
    this.canvas.addEventListener('pointercancel', (e) => this.end(e));
    this.canvas.addEventListener('wheel', (e) => {
      e.preventDefault();
      this.targetDistance = clamp(this.targetDistance + e.deltaY * 0.018, 3, 90);
      this.isMoving = true;
    }, { passive: false });
  }

  handleMove(e) {
    if (!this.touches.has(e.pointerId)) return;
    this.touches.set(e.pointerId, e);
    if (this.touches.size === 2) {
      const p = Array.from(this.touches.values());
      const d = Math.hypot(p[0].clientX - p[1].clientX, p[0].clientY - p[1].clientY);
      if (this.lastPinch !== null) this.targetDistance = clamp(this.targetDistance + (this.lastPinch - d) * 0.035, 3, 90);
      this.lastPinch = d;
      this.isMoving = true;
      return;
    }
    if (!this.drag) return;
    const dx = e.clientX - this.drag.x;
    const dy = e.clientY - this.drag.y;
    this.targetTheta -= dx * 0.005;
    this.targetPhi = clamp(this.targetPhi + dy * 0.005, this.minPolarAngle, this.maxPolarAngle);
    this.drag = { x: e.clientX, y: e.clientY };
    this.isMoving = true;
  }

  end(e) {
    this.touches.delete(e.pointerId);
    this.drag = null;
    this.lastPinch = null;
  }

  applyOrbit(instant = false) {
    const pos = new THREE.Vector3(
      this.distance * Math.sin(this.phi) * Math.sin(this.theta),
      this.distance * Math.cos(this.phi),
      this.distance * Math.sin(this.phi) * Math.cos(this.theta)
    );
    if (instant) this.camera.position.copy(pos);
    else this.camera.position.lerp(pos, 0.35);
    this.camera.up.set(0, 1, 0);
    this.camera.lookAt(this.target);
  }

  moveToView(axis) {
    const direction = (DIR[axis] || DIR.home).clone().normalize();
    const to = direction.multiplyScalar(this.targetDistance);
    this.tween = { t: 0, from: this.camera.position.clone(), to };
    this.targetTheta = Math.atan2(to.x, to.z);
    this.targetPhi = clamp(Math.acos(clamp(to.y / this.targetDistance, -1, 1)), this.minPolarAngle, this.maxPolarAngle);
    this.isMoving = true;
  }

  reset() {
    this.targetDistance = 14;
    this.moveToView('home');
  }

  update(delta) {
    if (this.tween) {
      this.tween.t = clamp(this.tween.t + delta / 0.3, 0, 1);
      this.camera.position.lerpVectors(this.tween.from, this.tween.to, ease(this.tween.t));
      this.camera.lookAt(this.target);
      this.isMoving = this.tween.t < 1;
      if (this.tween.t >= 1) this.tween = null;
      return;
    }
    const before = this.camera.position.clone();
    const d = this.enableDamping ? this.dampingFactor * 60 : 20;
    this.theta = THREE.MathUtils.damp(this.theta, this.targetTheta, d, delta);
    this.phi = THREE.MathUtils.damp(this.phi, this.targetPhi, d, delta);
    this.distance = THREE.MathUtils.damp(this.distance, this.targetDistance, d, delta);
    this.applyOrbit(false);
    this.isMoving = before.distanceTo(this.camera.position) > 0.0008 || this.touches.size > 0;
  }
}
