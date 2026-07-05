import * as THREE from 'three';

const AXES = [
  { id: 'x', color: '#e34b4b', position: new THREE.Vector3(1.35, 0, 0) },
  { id: 'y', color: '#38c86c', position: new THREE.Vector3(0, 1.35, 0) },
  { id: 'z', color: '#3478ff', position: new THREE.Vector3(0, 0, 1.35) }
];

export class ViewGizmo {
  constructor(canvas, mainCamera, controller) {
    this.canvas = canvas;
    this.mainCamera = mainCamera;
    this.controller = controller;
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(45, 1, 0.1, 20);
    this.camera.position.set(0, 0, 5);
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    this.raycaster = new THREE.Raycaster();
    this.pointer = new THREE.Vector2();
    this.pickables = [];
    this.root = new THREE.Group();
    this.scene.add(this.root);
    this.build();
    this.bind();
  }

  build() {
    const core = new THREE.Mesh(
      new THREE.BoxGeometry(0.68, 0.68, 0.68),
      new THREE.MeshStandardMaterial({ color: '#aab2bd', roughness: 0.45, metalness: 0.08 })
    );
    this.root.add(core);
    this.scene.add(new THREE.HemisphereLight('#ffffff', '#30343a', 2.2));

    for (const axis of AXES) {
      const material = new THREE.MeshBasicMaterial({ color: axis.color });
      const orb = new THREE.Mesh(new THREE.SphereGeometry(0.22, 24, 16), material);
      orb.position.copy(axis.position);
      orb.userData.axis = axis.id;
      this.pickables.push(orb);

      const lineGeometry = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0, 0, 0), axis.position.clone().multiplyScalar(0.86)]);
      const line = new THREE.Line(lineGeometry, material);
      this.root.add(line, orb);
    }
  }

  bind() {
    this.canvas.addEventListener('pointerdown', (event) => {
      const rect = this.canvas.getBoundingClientRect();
      this.pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      this.pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
      this.raycaster.setFromCamera(this.pointer, this.camera);
      const hit = this.raycaster.intersectObjects(this.pickables, false)[0];
      if (hit?.object?.userData?.axis) this.controller.moveToView(hit.object.userData.axis);
    });
  }

  resize() {
    const size = this.canvas.clientWidth || 96;
    this.renderer.setSize(size, size, false);
    this.camera.aspect = 1;
    this.camera.updateProjectionMatrix();
  }

  sync() {
    const q = this.mainCamera.quaternion.clone().invert();
    this.root.quaternion.slerp(q, 0.35);
  }

  update() {
    this.resize();
    this.sync();
    this.renderer.render(this.scene, this.camera);
  }
}
