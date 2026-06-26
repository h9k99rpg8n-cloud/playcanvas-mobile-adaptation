export class StatsMonitor {
  constructor(container) {
    this.container = container;
    this.frames = 0;
    this.last = performance.now();
    this.frameStart = this.last;
    this.fps = 0;
    this.ms = 0;
  }

  begin() {
    this.frameStart = performance.now();
  }

  end() {
    const now = performance.now();
    this.ms = now - this.frameStart;
    this.frames += 1;
    if (now >= this.last + 500) {
      this.fps = Math.round((this.frames * 1000) / (now - this.last));
      this.frames = 0;
      this.last = now;
      this.container.textContent = `${this.fps} FPS · ${this.ms.toFixed(1)} MS`;
    }
  }
}
