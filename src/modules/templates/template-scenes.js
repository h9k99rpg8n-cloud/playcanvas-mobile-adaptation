export const TEMPLATE_SCENES = {
  basic3d: {
    scene: {
      objects: [
        { id: 'camera-main', name: 'Camara principal', type: 'camera', position: [0, 6, 10], rotation: [-28, 0, 0], scale: [1, 1, 1] },
        { id: 'sun-main', name: 'Luz direccional', type: 'directional-light', position: [6, 8, 4], rotation: [-35, 35, 0], scale: [1, 1, 1] },
        { id: 'floor-main', name: 'Piso base', type: 'quad', position: [0, 0, 0], rotation: [-90, 0, 0], scale: [8, 8, 1] }
      ],
      ui: []
    }
  },
  testCar: {
    scene: {
      objects: [
        { id: 'car-body', name: 'Carro cuerpo', type: 'cube', position: [0, 1, 0], rotation: [0, 0, 0], scale: [2.4, 0.7, 1.2] },
        { id: 'car-cabin', name: 'Carro cabina', type: 'cube', position: [0.25, 1.65, 0], rotation: [0, 0, 0], scale: [1.1, 0.7, 1] },
        { id: 'wheel-front-left', name: 'Rueda frontal izquierda', type: 'cylinder', position: [0.85, 0.55, 0.7], rotation: [90, 0, 0], scale: [0.45, 0.45, 0.3] },
        { id: 'wheel-front-right', name: 'Rueda frontal derecha', type: 'cylinder', position: [0.85, 0.55, -0.7], rotation: [90, 0, 0], scale: [0.45, 0.45, 0.3] },
        { id: 'wheel-back-left', name: 'Rueda trasera izquierda', type: 'cylinder', position: [-0.85, 0.55, 0.7], rotation: [90, 0, 0], scale: [0.45, 0.45, 0.3] },
        { id: 'wheel-back-right', name: 'Rueda trasera derecha', type: 'cylinder', position: [-0.85, 0.55, -0.7], rotation: [90, 0, 0], scale: [0.45, 0.45, 0.3] },
        { id: 'car-floor', name: 'Pista simple', type: 'quad', position: [0, 0, 0], rotation: [-90, 0, 0], scale: [10, 10, 1] }
      ],
      ui: []
    }
  },
  garden3d: {
    scene: {
      objects: [
        { id: 'garden-ground', name: 'Suelo jardin', type: 'quad', position: [0, 0, 0], rotation: [-90, 0, 0], scale: [12, 12, 1] },
        { id: 'tree-1-trunk', name: 'Arbol 1 tronco', type: 'cylinder', position: [-3, 0.8, -2], rotation: [0, 0, 0], scale: [0.35, 1.6, 0.35] },
        { id: 'tree-1-top', name: 'Arbol 1 copa', type: 'sphere', position: [-3, 2.2, -2], rotation: [0, 0, 0], scale: [1.2, 1.2, 1.2] },
        { id: 'tree-2-trunk', name: 'Arbol 2 tronco', type: 'cylinder', position: [3, 0.8, -1.5], rotation: [0, 0, 0], scale: [0.35, 1.6, 0.35] },
        { id: 'tree-2-top', name: 'Arbol 2 copa', type: 'sphere', position: [3, 2.2, -1.5], rotation: [0, 0, 0], scale: [1.2, 1.2, 1.2] },
        { id: 'rock-1', name: 'Piedra 1', type: 'sphere', position: [-1.2, 0.25, 2], rotation: [0, 0, 0], scale: [0.7, 0.35, 0.55] },
        { id: 'rock-2', name: 'Piedra 2', type: 'sphere', position: [1.4, 0.18, 2.4], rotation: [0, 0, 0], scale: [0.5, 0.28, 0.45] },
        { id: 'garden-center', name: 'Centro del jardin', type: 'cube', position: [0, 0.15, 0], rotation: [0, 0, 0], scale: [1.4, 0.3, 1.4] }
      ],
      ui: []
    }
  }
};
