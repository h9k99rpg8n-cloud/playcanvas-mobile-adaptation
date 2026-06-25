export const TEMPLATES = [
  {
    id: 'empty-scene',
    name: 'Escena vacía',
    icon: '⬛',
    description: 'Proyecto limpio para empezar desde cero.',
    editorVersion: 'Atlas 0.0.4',
    installed: true,
    data: {
      scene: {
        objects: [],
        ui: []
      }
    }
  },
  {
    id: 'game-2d',
    name: '2D',
    icon: '🟦',
    description: 'Base para juegos 2D, UI y prototipos ligeros.',
    editorVersion: 'Atlas 0.0.4',
    installed: true,
    data: {
      scene: {
        objects: ['camera-2d'],
        ui: []
      }
    }
  },
  {
    id: 'game-3d',
    name: '3D',
    icon: '🎮',
    description: 'Escena 3D básica con cámara, luz y plano.',
    editorVersion: 'Atlas 0.0.4',
    installed: true,
    data: {
      scene: {
        objects: ['camera', 'light', 'floor'],
        ui: []
      }
    }
  },
  {
    id: 'game-3d-hdrp',
    name: '3D HDRP',
    icon: '🌄',
    description: 'Plantilla visual de alto realismo. Próximamente.',
    editorVersion: 'Atlas 0.1.0',
    installed: false,
    data: {
      scene: {
        objects: ['camera', 'sun', 'environment'],
        ui: []
      }
    }
  },
  {
    id: 'web-app',
    name: 'Aplicación web',
    icon: '📱',
    description: 'Base para crear pantallas, botones y menús.',
    editorVersion: 'Atlas 0.0.4',
    installed: true,
    data: {
      scene: {
        objects: [],
        ui: ['screen', 'button']
      }
    }
  },
  {
    id: 'basic-demo',
    name: 'Demo básica',
    icon: '✨',
    description: 'Solo interfaz por ahora; tendrá función con el editor.',
    editorVersion: 'Atlas 0.0.4',
    installed: false,
    data: {
      scene: {
        objects: [],
        ui: ['demo-panel']
      }
    }
  }
];

export function getDefaultTemplate() {
  return TEMPLATES[0];
}

export function getTemplateById(id) {
  return TEMPLATES.find((template) => template.id === id) || getDefaultTemplate();
}
