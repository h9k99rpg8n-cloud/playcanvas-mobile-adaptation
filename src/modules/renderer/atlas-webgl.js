function createShader(gl, type, source) {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    throw new Error(gl.getShaderInfoLog(shader));
  }

  return shader;
}

function createProgram(gl, vertexSource, fragmentSource) {
  const program = gl.createProgram();
  gl.attachShader(program, createShader(gl, gl.VERTEX_SHADER, vertexSource));
  gl.attachShader(program, createShader(gl, gl.FRAGMENT_SHADER, fragmentSource));
  gl.linkProgram(program);

  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    throw new Error(gl.getProgramInfoLog(program));
  }

  return program;
}

function identity() {
  return [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
}

function multiply(a, b) {
  const out = new Array(16).fill(0);

  for (let row = 0; row < 4; row += 1) {
    for (let col = 0; col < 4; col += 1) {
      for (let i = 0; i < 4; i += 1) {
        out[row * 4 + col] += a[row * 4 + i] * b[i * 4 + col];
      }
    }
  }

  return out;
}

function perspective(fov, aspect, near, far) {
  const f = 1 / Math.tan(fov / 2);
  const range = 1 / (near - far);

  return [
    f / aspect, 0, 0, 0,
    0, f, 0, 0,
    0, 0, (near + far) * range, -1,
    0, 0, near * far * range * 2, 0
  ];
}

function lookAt(eye, target, up) {
  const z = normalize([eye[0] - target[0], eye[1] - target[1], eye[2] - target[2]]);
  const x = normalize(cross(up, z));
  const y = cross(z, x);

  return [
    x[0], y[0], z[0], 0,
    x[1], y[1], z[1], 0,
    x[2], y[2], z[2], 0,
    -dot(x, eye), -dot(y, eye), -dot(z, eye), 1
  ];
}

function normalize(v) {
  const length = Math.hypot(v[0], v[1], v[2]) || 1;
  return [v[0] / length, v[1] / length, v[2] / length];
}

function cross(a, b) {
  return [
    a[1] * b[2] - a[2] * b[1],
    a[2] * b[0] - a[0] * b[2],
    a[0] * b[1] - a[1] * b[0]
  ];
}

function dot(a, b) {
  return a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
}

export class AtlasWebGLRenderer {
  constructor(canvas) {
    this.canvas = canvas;
    this.gl = canvas.getContext('webgl', { antialias: true });

    if (!this.gl) {
      throw new Error('WebGL no está disponible en este navegador.');
    }

    this.camera = {
      yaw: -0.72,
      pitch: 0.72,
      distance: 6.5,
      target: [0, 0, 0]
    };

    this.lastPoint = null;
    this.lastPinchDistance = null;
    this.init();
    this.bindControls();
    this.render();
  }

  init() {
    const vertexSource = `
      attribute vec3 position;
      attribute vec3 normal;
      uniform mat4 matrix;
      varying vec3 vNormal;
      void main() {
        vNormal = normal;
        gl_Position = matrix * vec4(position, 1.0);
      }
    `;

    const fragmentSource = `
      precision mediump float;
      varying vec3 vNormal;
      void main() {
        vec3 light = normalize(vec3(0.4, 0.9, 0.7));
        float brightness = max(dot(normalize(vNormal), light), 0.0);
        vec3 base = vec3(0.18, 0.38, 0.48);
        vec3 color = base * (0.35 + brightness * 0.85);
        gl_FragColor = vec4(color, 1.0);
      }
    `;

    const gl = this.gl;
    this.program = createProgram(gl, vertexSource, fragmentSource);
    this.matrixLocation = gl.getUniformLocation(this.program, 'matrix');
    this.positionLocation = gl.getAttribLocation(this.program, 'position');
    this.normalLocation = gl.getAttribLocation(this.program, 'normal');

    const size = 8;
    const vertices = new Float32Array([
      -size, 0, -size, 0, 1, 0,
       size, 0, -size, 0, 1, 0,
      -size, 0,  size, 0, 1, 0,
       size, 0,  size, 0, 1, 0
    ]);

    this.buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
    gl.enable(gl.DEPTH_TEST);
  }

  bindControls() {
    this.canvas.addEventListener('pointerdown', (event) => {
      this.canvas.setPointerCapture(event.pointerId);
      this.lastPoint = { x: event.clientX, y: event.clientY };
    });

    this.canvas.addEventListener('pointermove', (event) => {
      if (!this.lastPoint) return;

      const dx = event.clientX - this.lastPoint.x;
      const dy = event.clientY - this.lastPoint.y;
      this.camera.yaw += dx * 0.008;
      this.camera.pitch = Math.max(0.18, Math.min(1.34, this.camera.pitch + dy * 0.006));
      this.lastPoint = { x: event.clientX, y: event.clientY };
      this.render();
    });

    this.canvas.addEventListener('pointerup', () => {
      this.lastPoint = null;
    });

    this.canvas.addEventListener('wheel', (event) => {
      event.preventDefault();
      this.camera.distance = Math.max(2.5, Math.min(14, this.camera.distance + event.deltaY * 0.01));
      this.render();
    }, { passive: false });

    this.canvas.addEventListener('touchmove', (event) => {
      if (event.touches.length !== 2) return;
      event.preventDefault();
      const [a, b] = event.touches;
      const distance = Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY);

      if (this.lastPinchDistance) {
        this.camera.distance = Math.max(2.5, Math.min(14, this.camera.distance + (this.lastPinchDistance - distance) * 0.025));
        this.render();
      }

      this.lastPinchDistance = distance;
    }, { passive: false });

    this.canvas.addEventListener('touchend', () => {
      this.lastPinchDistance = null;
    });
  }

  resetCamera() {
    this.camera.yaw = -0.72;
    this.camera.pitch = 0.72;
    this.camera.distance = 6.5;
    this.render();
  }

  resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const width = Math.floor(this.canvas.clientWidth * dpr);
    const height = Math.floor(this.canvas.clientHeight * dpr);

    if (this.canvas.width !== width || this.canvas.height !== height) {
      this.canvas.width = width;
      this.canvas.height = height;
    }
  }

  render() {
    this.resize();
    const gl = this.gl;
    const aspect = this.canvas.width / this.canvas.height;
    const cam = this.camera;
    const eye = [
      Math.sin(cam.yaw) * Math.cos(cam.pitch) * cam.distance,
      Math.sin(cam.pitch) * cam.distance,
      Math.cos(cam.yaw) * Math.cos(cam.pitch) * cam.distance
    ];

    const matrix = multiply(perspective(Math.PI / 3, aspect, 0.1, 100), lookAt(eye, cam.target, [0, 1, 0]));

    gl.viewport(0, 0, this.canvas.width, this.canvas.height);
    gl.clearColor(0.03, 0.05, 0.11, 1);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.useProgram(this.program);
    gl.uniformMatrix4fv(this.matrixLocation, false, new Float32Array(matrix));

    gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
    gl.enableVertexAttribArray(this.positionLocation);
    gl.vertexAttribPointer(this.positionLocation, 3, gl.FLOAT, false, 24, 0);
    gl.enableVertexAttribArray(this.normalLocation);
    gl.vertexAttribPointer(this.normalLocation, 3, gl.FLOAT, false, 24, 12);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  }
}
