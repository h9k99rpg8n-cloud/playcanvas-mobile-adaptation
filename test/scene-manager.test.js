import assert from 'node:assert/strict';
import test from 'node:test';
import * as THREE from 'three';
import { SceneManager } from '../src/modules/scenemanager/SceneManager.js';

const xyz = (vector) => vector.toArray().map((value) => Number(value.toFixed(6)));

test('interactive reparenting preserves the child world transform', () => {
  const scene = new THREE.Scene();
  const manager = new SceneManager(scene);
  const parent = manager.addPrimitive('cube', { id: 'parent', position: [5, 0, 0], select: false });
  const child = manager.addPrimitive('sphere', { id: 'child', position: [2, 0, 0], select: false });
  const worldBefore = child.getWorldPosition(new THREE.Vector3());

  assert.equal(manager.setParent(child, parent), true);

  assert.deepEqual(xyz(child.getWorldPosition(new THREE.Vector3())), xyz(worldBefore));
  assert.deepEqual(xyz(child.position), [-3, 0, 0]);
});

test('scene loading restores local transforms for parent, child and grandchild', () => {
  const scene = new THREE.Scene();
  const manager = new SceneManager(scene);

  manager.loadSceneData({
    objects: [
      { id: 'parent', parentId: null, name: 'Padre', type: 'cube', position: [5, 0, 0], rotation: [0, 0, 0], scale: [1, 1, 1] },
      { id: 'child', parentId: 'parent', name: 'Hijo', type: 'sphere', position: [2, 0, 0], rotation: [0, 30, 0], scale: [1, 1, 1] },
      { id: 'grandchild', parentId: 'child', name: 'Nieto', type: 'torus', position: [3, 0, 0], rotation: [0, 0, 45], scale: [0.5, 0.5, 0.5] }
    ]
  });

  const byId = new Map(manager.objects.map((object) => [object.userData.atlasId, object]));
  const parent = byId.get('parent');
  const child = byId.get('child');
  const grandchild = byId.get('grandchild');

  assert.equal(child.parent, parent);
  assert.equal(grandchild.parent, child);
  assert.deepEqual(xyz(child.position), [2, 0, 0]);
  assert.deepEqual(xyz(grandchild.position), [3, 0, 0]);
  assert.deepEqual(xyz(grandchild.scale), [0.5, 0.5, 0.5]);
  assert.equal(Number(THREE.MathUtils.radToDeg(child.rotation.y).toFixed(6)), 30);
  assert.equal(Number(THREE.MathUtils.radToDeg(grandchild.rotation.z).toFixed(6)), 45);
  assert.deepEqual(xyz(child.getWorldPosition(new THREE.Vector3())), [7, 0, 0]);
});

test('scene loading rejects circular parenting', () => {
  const scene = new THREE.Scene();
  const manager = new SceneManager(scene);

  manager.loadSceneData({
    objects: [
      { id: 'a', parentId: 'b', type: 'cube' },
      { id: 'b', parentId: 'a', type: 'sphere' }
    ]
  });

  const [a, b] = manager.objects;
  assert.notEqual(a.parent, b.parent);
  assert.ok(a.parent === b || b.parent === a);
  assert.ok(a.parent === scene || b.parent === scene);
});
