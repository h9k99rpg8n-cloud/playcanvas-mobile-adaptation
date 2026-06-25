export const TEMPLATES = [
  {
    id: 'empty-scene',
    name: 'Escena vacía',
    icon: '⬛',
    description: 'Proyecto limpio para empezar desde cero.',
    data: {
      scene: {
        objects: [],
        ui: []
      }
    }
  },
  {
    id: 'game-3d',
    name: 'Juego 3D',
    icon: '🎮',
    description: 'Base preparada para una escena 3D futura.',
    data: {
      scene: {
        objects: ['camera', 'light', 'floor'],
        ui: []
      }
    }
  },
  {
    id: 'web-app',
    name: 'Aplicación web',
    icon: '📱',
    description: 'Base para crear una app con pantallas y botones.',
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
    description: 'Solo interfaz por ahora; tendrá función cuando llegue el editor.',
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
