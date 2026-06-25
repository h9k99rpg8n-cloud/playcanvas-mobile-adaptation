import * as THREE from 'three';

const CAMERA_PRESETS = {
  x: new THREE.Vector3(8, 2.5, 0),
  y: new THREE.Vector3(0, 9, 0.01),
  z: new THREE.Vector3(0, 2.5, 8),
  home: new THREE.Vector3(6, 4, 6)
};

const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

export class AtlasThreeRenderer {
  constructor(canvas) {
    this.canvas = canvas;
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(60, 1, 0.1, 200);
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));

    this.target = new THREE.Vector3(0, 0, 0);
    this.cameraTarget = CAMERA_PRESETS.home.clone();
    this.pointer = null;
    this.radius = 9;
    this.theta = Math.PI / 4;
    this.phi = Math.PI / 3;
    this.lastPinch = null;

    this.createSkybox();
    this.createBaseScene();
    this.bindControls();
    this.moveCameraTo('home', true);
    this.animate();
  }

  createSkybox() {
    const material = new THREE.ShaderMaterial({
      depthWrite: false,
      depthTest: false,
      side: THREE.BackSide,
      uniforms: {
        topColor: { value: new THREE.Color('#8da6c0') },
        bottomColor: { value: new THREE.Color('#5e6b78') }
      },
      vertexShader: 'varying vec3 vPos; void main(){ vPos=(modelMatrix*vec4(position,1.0)).xyz; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0); }',
      fragmentShader: 'uniform vec3 topColor; uniform vec3 bottomColor; varying vec3 vPos; void main(){ float h=normalize(vPos).y*0.5+0.5; gl_FragColor=vec4(mix(bottomColor,topColor,h),1.0); }'
    });
    this.scene.add(new THREE.Mesh(new THREE.SphereGeometry(120, 32, 16), material));
  }

  createBaseScene() {
    this.scene.add(new THREE.HemisphereLight('#c9dfff', '#6a6460', 1.45));
    const sun = new THREE.DirectionalLight('#ffffff', 1.25);
    sun.position.set(5, 8, 4);
    this.scene.add(sun);

    const grid = new THREE.GridHelper(20, 20, '#7d8794', '#68727f');
    grid.material.transparent = true;
    grid.material.opacity = 0.48;
    this.scene.add(grid);

    const plane = new THREE.Mesh(
      new THREE.PlaneGeometry(20, 20),
      new THREE.MeshStandardMaterial({ color: '#6f7882', roughness: 0.92 })
    );
    plane.rotation.x = -Math.PI / 2;
    plane.position.y = -0.01;
    this.scene.add(plane);

    const axes = new THREE.Group();
    axes.add(this.createAxis(new THREE.Vector3(1, 0, 0), '#ff4d4d'));
    axes.add(this.createAxis(new THREE.Vector3(0, 1, 0), '#36c76b'));
    axes.add(this.createAxis(new THREE.Vector3(0, 0, 1), '#3d7cff'));
    this.scene.add(axes);
  }

  createAxis(direction, color) {
    const group = new THREE.Group();
    const material = new THREE.MeshBasicMaterial({ color });
    const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 2.2, 12), material);
    const head = new THREE.Mesh(new THREE.ConeGeometry(0.09, 0.24, 16), material);
    shaft.position.y = 1.1;
    head.position.y = 2.32;
    group.add(shaft, head);
    group.quaternion.copy(new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction.normalize()));
    return group;
  }

  bindControls() {
    this.canvas.addEventListener('pointerdown', (event) => {
      this.canvas.setPointerCapture(event.pointerId);
      this.pointer = { x: event.clientX, y: event.clientY };
    });

    this.canvas.addEventListener('pointermove', (event) => {
      if (!this.pointer) return;
      const dx = event.clientX - this.pointer.x;
      const dy = event.clientY - this.pointer.y;
      this.theta -= dx * 0.008;
      this.phi = clamp(this.phi + dy * 0.006, 0.18, Math.PI - 0.18);
      this.updateOrbitTarget();
      this.pointer = { x: event.clientX, y: event.clientY };
    });

    this.canvas.addEventListener('pointerup', () => { this.pointer = null; });
    this.canvas.addEventListener('pointercancel', () => { this.pointer = null; });

    this.canvas.addEventListener('wheel', (event) => {
      event.preventDefault();
      this.radius = clamp(this.radius + event.deltaY * 0.01, 3.2, 30);
      this.updateOrbitTarget();
    }, { passive: false });

    this.canvas.addEventListener('touchmove', (event) => {
      if (event.touches.length !== 2) return;
      event.preventDefault();
      const a = event.touches[0];
      const b = event.touches[1];
      const distance = Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY);
      if (this.lastPinch) {
        this.radius = clamp(this.radius + (this.lastPinch - distance) * 0.026, 3.2, 30);
        this.updateOrbitTarget();
      }
      this.lastPinch = distance;
    }, { passive: false });

    this.canvas.addEventListener('touchend', () => { this.lastPinch = null; });
  }

  updateOrbitTarget() {
    const x = this.radius * Math.sin(this.phi) * Math.sin(this.theta);
    const y = this.radius * Math.cos(this.phi);
    const z = this.radius * Math.sin(this.phi) * Math.cos(this.theta);
    this.cameraTarget.set(x, y, z);
  }

  moveCameraTo(axis, instant = false) {
    this.cameraTarget.copy(CAMERA_PRESETS[axis] || CAMERA_PRESETS.home);
    this.radius = this.cameraTarget.length();
    this.theta = Math.atan2(this.cameraTarget.x, this.cameraTarget.z);
    this.phi = Math.acos(clamp(this.cameraTarget.y / this.radius, -1, 1));
    if (instant) this.camera.position.copy(this.cameraTarget);
  }

  resetCamera() {
    this.moveCameraTo('home');
  }

  resize() {
    const width = this.canvas.clientWidth;
    const height = this.canvas.clientHeight;
    this.renderer.setSize(width, height, false);
    this.camera.aspect = width / Math.max(height, 1);
    this.camera.updateProjectionMatrix();
  }

  animate() {
    this.resize();
    this.camera.position.lerp(this.cameraTarget, 0.12);
    this.camera.lookAt(this.target);
    this.renderer.render(this.scene, this.camera);
    requestAnimationFrame(() => this.animate());
  }
}
