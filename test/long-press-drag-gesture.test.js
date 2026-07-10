import assert from 'node:assert/strict';
import test from 'node:test';
import { LongPressDragGesture } from '../src/modules/hierarchy/LongPressDragGesture.js';

function createGesture() {
  let scheduled = null;
  const activations = [];
  const gesture = new LongPressDragGesture({
    delay: 360,
    movementTolerance: 12,
    onActivate: (payload) => activations.push(payload),
    schedule: (callback) => { scheduled = callback; return 1; },
    cancelSchedule: () => { scheduled = null; }
  });

  return {
    gesture,
    activations,
    fireTimer() {
      const callback = scheduled;
      scheduled = null;
      callback?.();
    }
  };
}

test('a normal tap never starts a drag', () => {
  const { gesture, activations, fireTimer } = createGesture();
  gesture.begin({ x: 10, y: 10 }, 'cube');

  assert.equal(gesture.finish(), null);
  fireTimer();
  assert.deepEqual(activations, []);
});

test('scroll movement cancels the pending long press', () => {
  const { gesture, activations, fireTimer } = createGesture();
  gesture.begin({ x: 10, y: 10 }, 'cube');

  assert.equal(gesture.move({ x: 10, y: 30 }), false);
  fireTimer();
  assert.equal(gesture.finish(), null);
  assert.deepEqual(activations, []);
});

test('holding still activates dragging and returns its payload', () => {
  const { gesture, activations, fireTimer } = createGesture();
  const payload = { id: 'object-1' };
  gesture.begin({ x: 10, y: 10 }, payload);

  fireTimer();

  assert.equal(gesture.active, true);
  assert.equal(gesture.move({ x: 200, y: 200 }), true);
  assert.equal(gesture.finish(), payload);
  assert.deepEqual(activations, [payload]);
});
