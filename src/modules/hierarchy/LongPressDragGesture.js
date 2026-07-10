export class LongPressDragGesture {
  constructor({
    delay = 360,
    movementTolerance = 12,
    onActivate = () => {},
    schedule = (callback, timeout) => setTimeout(callback, timeout),
    cancelSchedule = (timerId) => clearTimeout(timerId)
  } = {}) {
    this.delay = delay;
    this.movementTolerance = movementTolerance;
    this.onActivate = onActivate;
    this.schedule = schedule;
    this.cancelSchedule = cancelSchedule;
    this.timerId = null;
    this.startPoint = null;
    this.pendingPayload = null;
    this.activePayload = null;
  }

  get active() {
    return this.activePayload !== null;
  }

  begin(point, payload) {
    this.cancel();
    this.startPoint = { x: point.x, y: point.y };
    this.pendingPayload = payload;
    this.timerId = this.schedule(() => {
      this.timerId = null;
      if (this.pendingPayload === null) return;
      this.activePayload = this.pendingPayload;
      this.pendingPayload = null;
      this.onActivate(this.activePayload);
    }, this.delay);
  }

  move(point) {
    if (this.active) return true;
    if (!this.startPoint || this.pendingPayload === null) return false;

    const deltaX = point.x - this.startPoint.x;
    const deltaY = point.y - this.startPoint.y;
    if (Math.hypot(deltaX, deltaY) > this.movementTolerance) this.cancel();
    return this.active;
  }

  finish() {
    const payload = this.activePayload;
    this.reset();
    return payload;
  }

  cancel() {
    this.reset();
  }

  reset() {
    if (this.timerId !== null) this.cancelSchedule(this.timerId);
    this.timerId = null;
    this.startPoint = null;
    this.pendingPayload = null;
    this.activePayload = null;
  }
}
