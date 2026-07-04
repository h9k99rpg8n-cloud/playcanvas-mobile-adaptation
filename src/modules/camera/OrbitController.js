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
    this.targetGoal = this.target.clone();
    this.enabled = true;
    this.enableDamping = true;
    this.dampingFactor = 0.09;
    this.panDampingFactor = 0.12;
    this.rotateSpeed = 0.0042;
    this.panSpeed = 0.0035;
    this.zoomSpeed = 0.035;
    this.wheelZoomSpeed = 0.0018;
    this.maxPolarAngle = Math.PI / 2.06;
    this.minPolarAngle = 0.12;
    this.minDistance = 2.5;
    this.maxDistance = 120;
    this.distance = 14;
    this.targetDistance = 14;
    this.theta = Math.PI / 4;
    this.phi = Math.PI / 3;
    this.targetTheta = this.theta;
    this.targetPhi = this.phi;
    this.drag = null;
    this.touches = new Map();
    this.lastPinch = null;
    this.lastTouchCenter = null;
    this.tween = null;
    this.isMoving = false;
    this.bind();
    this.applyOrbit(true);
  }

  bind() {
    this.canvas.style.touchAction = 'none';
    this.canvas.addEventListener('contextmenu', (event) => event.preventDefault());

    this.canvas.addEventListener('pointerdown', (event) => {
      if (!this.enabled) return;
      this.canvas.setPointerCapture(event.pointerId);
      this.touches.set(event.pointerId, event);
      this.drag = {
        x: event.clientX,
        y: event.clientY,
        button: event.button,
        pan: event.button === 1 || event.button === 2 || event.shiftKey || event.altKey || event.metaKey
      };
      this.lastTouchCenter = this.getTouchCenter();
      this.tween = null;
    });

    this.canvas.addEventListener('pointermove', (event) => this.handleMove(event));
    this.canvas.addEventListener('pointerup', (event) => this.end(event));
    this.canvas.addEventListener('pointercancel', (event) => this.end(event));
    this.canvas.addEventListener('wheel', (event) => this.handleWheel(event), { passive: false });
  }

  getTouchCenter() {
    if (this.touches.size === 0) return null;
    const points = Array.from(this.touches.values());
    const x = points.reduce((sum, point) => sum + point.clientX, 0) / points.length;
    const y = points.reduce((sum, point) => sum + point.clientY, 0) / points.length;
    return { x, y };
  }

  panByPixels(dx, dy) {
    const direction = new THREE.Vector3();
    const right = new THREE.Vector3();
    const up = new THREE.Vector3();

    this.camera.getWorldDirection(direction);
    right.crossVectors(direction, this.camera.up).normalize();
    up.crossVectors(right, direction).normalize();

    const scale = this.targetDistance * this.panSpeed;
    const move = right.multiplyScalar(-dx * scale).add(up.multiplyScalar(dy * scale));
    this.targetGoal.add(move);
    this.isMoving = true;
  }

  handleMove(event) {
    if (!this.enabled || !this.touches.has(event.pointerId)) return;
    this.touches.set(event.pointerId, event);

    if (this.touches.size === 2) {
      const points = Array.from(this.touches.values());
      const distance = Math.hypot(points[0].clientX - points[1].clientX, points[0].clientY - points[1].clientY);
      const center = this.getTouchCenter();

      if (this.lastPinch !== null) {
        this.targetDistance = clamp(this.targetDistance + (this.lastPinch - distance) * this.zoomSpeed, this.minDistance, this.maxDistance);
      }

      if (this.lastTouchCenter && center) {
        this.panByPixels(center.x - this.lastTouchCenter.x, center.y - this.lastTouchCenter.y);
      }

      this.lastPinch = distance;
      this.lastTouchCenter = center;
      this.isMoving = true;
      return;
    }

    if (!this.drag) return;

    const dx = event.clientX - this.drag.x;
    const dy = event.clientY - this.drag.y;

    if (this.drag.pan) {
      this.panByPixels(dx, dy);
    } else {
      this.targetTheta -= dx * this.rotateSpeed;
      this.targetPhi = clamp(this.targetPhi + dy * this.rotateSpeed, this.minPolarAngle, this.maxPolarAngle);
      this.isMoving = true;
    }

    this.drag = { ...this.drag, x: event.clientX, y: event.clientY };
  }

  handleWheel(event) {
    if (!this.enabled) return;
    event.preventDefault();
    const multiplier = event.ctrlKey ? 2.4 : 1;
    this.targetDistance = clamp(this.targetDistance + event.deltaY * this.wheelZoomSpeed * this.targetDistance * multiplier, this.minDistance, this.maxDistance);
    this.tween = null;
    this.isMoving = true;
  }

  end(event) {
    this.touches.delete(event.pointerId);
    this.drag = null;
    this.lastPinch = null;
    this.lastTouchCenter = this.getTouchCenter();
  }

  setEnabled(value) {
    this.enabled = value;
    if (!value) {
      this.drag = null;
      this.touches.clear();
      this.lastPinch = null;
      this.lastTouchCenter = null;
    }
  }

  applyOrbit(instant = false) {
    if (instant) this.target.copy(this.targetGoal);
    else this.target.lerp(this.targetGoal, this.panDampingFactor);

    const pos = new THREE.Vector3(
      this.distance * Math.sin(this.phi) * Math.sin(this.theta),
      this.distance * Math.cos(this.phi),
      this.distance * Math.sin(this.phi) * Math.cos(this.theta)
    ).add(this.target);

    if (instant) this.camera.position.copy(pos);
    else this.camera.position.lerp(pos, 0.28);

    this.camera.up.set(0, 1, 0);
    this.camera.lookAt(this.target);
  }

  moveToView(axis) {
    const direction = (DIR[axis] || DIR.home).clone().normalize();
    const to = direction.multiplyScalar(this.targetDistance).add(this.targetGoal);
    this.tween = { t: 0, from: this.camera.position.clone(), to };
    const relative = to.clone().sub(this.targetGoal);
    this.targetTheta = Math.atan2(relative.x, relative.z);
    this.targetPhi = clamp(Math.acos(clamp(relative.y / this.targetDistance, -1, 1)), this.minPolarAngle, this.maxPolarAngle);
    this.isMoving = true;
  }

  focusOn(object) {
    if (!object) return;
    object.updateWorldMatrix(true, false);
    const box = new THREE.Box3().setFromObject(object);
    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3()).length();
    this.targetGoal.copy(center);
    this.targetDistance = clamp(size * 2.2 || 8, this.minDistance, this.maxDistance);
    this.isMoving = true;
  }

  reset() {
    this.targetGoal.set(0, 0, 0);
    this.targetDistance = 14;
    this.moveToView('home');
  }

  update(delta) {
    if (this.tween) {
      this.tween.t = clamp(this.tween.t + delta / 0.32, 0, 1);
      this.camera.position.lerpVectors(this.tween.from, this.tween.to, ease(this.tween.t));
      this.target.lerp(this.targetGoal, this.panDampingFactor);
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
