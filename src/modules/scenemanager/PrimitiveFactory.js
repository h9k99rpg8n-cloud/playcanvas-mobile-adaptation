import * as THREE from 'three';

const DEFAULT_MATERIAL = new THREE.MeshStandardMaterial({
  color: '#9ca3ad',
  roughness: 0.82,
  metalness: 0.02
});

export function createPrimitiveMesh(type) {
  const geometryMap = {
    cube: () => new THREE.BoxGeometry(1, 1, 1),
    sphere: () => new THREE.SphereGeometry(0.5, 32, 20),
    capsule: () => new THREE.CapsuleGeometry(0.35, 0.9, 8, 16),
    cylinder: () => new THREE.CylinderGeometry(0.5, 0.5, 1, 32),
    quad: () => new THREE.PlaneGeometry(1, 1)
  };

  const geometryFactory = geometryMap[type] || geometryMap.cube;
  const mesh = new THREE.Mesh(geometryFactory(), DEFAULT_MATERIAL.clone());
  mesh.name = `Atlas ${type}`;
  mesh.position.set(0, 0, 0);
  mesh.userData.primitiveType = type;
  return mesh;
}
