import * as THREE from 'three';
import { createPrimitiveMesh } from './PrimitiveFactory.js';

export class SceneManager {
  constructor(scene) {
    this.scene = scene;
    this.objects = [];
    this.selected = null;
    this.selectionOutline = null;
  }

  addPrimitive(type) {
    const mesh = createPrimitiveMesh(type);
    this.scene.add(mesh);
    this.objects.push(mesh);
    this.select(mesh);
    return mesh;
  }

  select(object) {
    if (this.selectionOutline) {
      this.scene.remove(this.selectionOutline);
      this.selectionOutline.geometry.dispose();
      this.selectionOutline.material.dispose();
      this.selectionOutline = null;
    }

    this.selected = object;
    this.selectionOutline = this.createSelectionOutline(object);
    this.scene.add(this.selectionOutline);
  }

  createSelectionOutline(object) {
    const outline = new THREE.LineSegments(
      new THREE.EdgesGeometry(object.geometry),
      new THREE.LineBasicMaterial({ color: '#00d4ff', transparent: true, opacity: 0.95 })
    );
    outline.position.copy(object.position);
    outline.rotation.copy(object.rotation);
    outline.scale.copy(object.scale).multiplyScalar(1.015);
    outline.name = 'Atlas Selection Outline';
    return outline;
  }
}
