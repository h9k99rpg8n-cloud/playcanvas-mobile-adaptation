import * as THREE from 'three';

export function createViewportGrid() {
  const grid = new THREE.GridHelper(200, 200, '#8a8f96', '#4e555e');
  grid.name = 'Atlas Infinite Grid Guide';
  grid.material.transparent = true;
  grid.material.opacity = 0.34;
  grid.material.depthWrite = false;
  return grid;
}
