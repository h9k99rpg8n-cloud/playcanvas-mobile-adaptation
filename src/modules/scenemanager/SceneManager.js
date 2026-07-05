import * as THREE from 'three';
import { createPrimitiveMesh } from './PrimitiveFactory.js';

const PRIMITIVE_TYPES = new Set(['cube', 'sphere', 'capsule', 'cylinder', 'quad', 'torus']);

function toVector3(values, fallback = [0, 0, 0]) {
  const source = Array.isArray(values) ? values : fallback;
  return new THREE.Vector3(
    Number(source[0] ?? fallback[0]),
    Number(source[1] ?? fallback[1]),
    Number(source[2] ?? fallback[2])
  );
}

function degreesToEuler(values) {
  const rotation = toVector3(values, [0, 0, 0]);
  return new THREE.Euler(
    THREE.MathUtils.degToRad(rotation.x),
    THREE.MathUtils.degToRad(rotation.y),
    THREE.MathUtils.degToRad(rotation.z)
  );
}

export class SceneManager extends EventTarget {
  constructor(scene) {
    super();
    this.scene = scene;
    this.objects = [];
    this.selected = null;
    this.selectionOutline = null;
  }

  emitChange() {
    this.dispatchEvent(new CustomEvent('objects-changed', { detail: { objects: this.objects } }));
  }

  emitSelection() {
    this.dispatchEvent(new CustomEvent('selection-changed', { detail: { selected: this.selected } }));
  }

  addPrimitive(type, options = {}) {
    const mesh = createPrimitiveMesh(type);
    this.applyObjectData(mesh, options);
    this.scene.add(mesh);
    this.objects.push(mesh);
    this.emitChange();

    if (options.select !== false) {
      this.select(mesh);
    }

    return mesh;
  }

  addSceneObject(objectData = {}) {
    if (!PRIMITIVE_TYPES.has(objectData.type)) {
      return null;
    }

    return this.addPrimitive(objectData.type, {
      ...objectData,
      select: false
    });
  }

  loadSceneData(sceneData = {}) {
    const objects = Array.isArray(sceneData.objects) ? sceneData.objects : [];
    objects.forEach((objectData) => this.addSceneObject(objectData));
    this.clearSelection();
    this.emitChange();
  }

  applyObjectData(mesh, objectData = {}) {
    if (objectData.id) mesh.userData.atlasId = objectData.id;
    if (objectData.name) mesh.name = objectData.name;
    if (objectData.type) mesh.userData.primitiveType = objectData.type;

    const position = toVector3(objectData.position, [0, 0, 0]);
    const scale = toVector3(objectData.scale, [1, 1, 1]);
    const rotation = degreesToEuler(objectData.rotation);

    mesh.position.copy(position);
    mesh.rotation.copy(rotation);
    mesh.scale.copy(scale);
  }

  renameObject(object, nextName) {
    const cleanName = nextName?.trim();
    if (!object || !cleanName) return null;
    object.name = cleanName;
    this.emitChange();
    this.emitSelection();
    return object;
  }

  clearSelection() {
    if (this.selectionOutline) {
      this.scene.remove(this.selectionOutline);
      this.selectionOutline.geometry.dispose();
      this.selectionOutline.material.dispose();
      this.selectionOutline = null;
    }
    this.selected = null;
    this.emitSelection();
  }

  select(object) {
    this.clearSelection();
    this.selected = object;
    this.selectionOutline = this.createSelectionOutline(object);
    this.scene.add(this.selectionOutline);
    this.emitSelection();
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
