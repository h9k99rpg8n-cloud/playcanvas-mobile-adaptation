import * as THREE from 'three';

export function setupViewportEnvironment(scene, renderer) {
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 0.95;
  scene.background = new THREE.Color('#2f353d');
  scene.fog = new THREE.Fog('#2f353d', 55, 180);

  const hemi = new THREE.HemisphereLight('#d8e6ff', '#34302c', 1.15);
  const key = new THREE.DirectionalLight('#ffffff', 1.6);
  key.position.set(8, 12, 7);

  scene.add(hemi, key);
}
