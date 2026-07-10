import assert from 'node:assert/strict';
import test from 'node:test';
import { HierarchyPanel } from '../src/modules/hierarchy/HierarchyPanel.js';

function runTouchDrop({ element = null, parent = null, dropOnRoot = false } = {}) {
  const calls = [];
  const child = { id: 'child' };
  const panel = Object.create(HierarchyPanel.prototype);
  panel.touchGesture = {
    finish: () => ({ object: child }),
    cancel: () => {}
  };
  panel.activeTouchPayload = { row: { classList: { remove: () => {} } } };
  panel.touchDropElement = null;
  panel.draggedObject = child;
  panel.root = { classList: { remove: () => {} } };
  panel.rootDropZone = { contains: () => dropOnRoot };
  panel.objectMap = new Map(parent ? [['parent', parent]] : []);
  panel.sceneManager = {
    isDescendant: () => false,
    setParent: (...args) => calls.push(args)
  };

  const previousDocument = globalThis.document;
  globalThis.document = { elementFromPoint: () => element };
  try {
    panel.endTouchDrag({
      cancelable: true,
      preventDefault: () => {},
      changedTouches: [{ clientX: 20, clientY: 30 }]
    });
  } finally {
    if (previousDocument === undefined) delete globalThis.document;
    else globalThis.document = previousDocument;
  }

  return { calls, child };
}

test('dropping outside the hierarchy cancels instead of unparenting', () => {
  const { calls } = runTouchDrop();
  assert.deepEqual(calls, []);
});

test('dropping on the explicit root zone unparents the object', () => {
  const rootZoneElement = {};
  const { calls, child } = runTouchDrop({ element: rootZoneElement, dropOnRoot: true });
  assert.deepEqual(calls, [[child, null]]);
});

test('dropping on a valid row reparents the object', () => {
  const parent = { id: 'parent' };
  const row = { dataset: { objectId: 'parent' } };
  row.closest = () => row;
  const { calls, child } = runTouchDrop({ element: row, parent });
  assert.deepEqual(calls, [[child, parent]]);
});
