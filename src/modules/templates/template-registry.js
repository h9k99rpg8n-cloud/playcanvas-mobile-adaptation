import { ATLAS_ENGINE_LABEL } from '../../core/version.js';
import { TEMPLATE_SCENES } from './template-scenes.js';

export const TEMPLATES = [
  {
    id: 'empty-scene',
    name: 'Escena vacía',
    icon: '◇',
    description: 'Proyecto limpio sin objetos iniciales.',
    editorVersion: ATLAS_ENGINE_LABEL,
    installed: true,
    data: { scene: { objects: [], ui: [] } }
  },
  {
    id: 'basic-3d-scene',
    name: 'Escena básica',
    icon: '⬛',
    description: 'Base 3D limpia con piso y cubo inicial.',
    editorVersion: ATLAS_ENGINE_LABEL,
    installed: true,
    data: TEMPLATE_SCENES.basic3d
  },
  {
    id: 'test-car-3d',
    name: 'Carrito de prueba',
    icon: '🚗',
    description: 'Carrito armado con primitivas para probar composición 3D.',
    editorVersion: ATLAS_ENGINE_LABEL,
    installed: true,
    data: TEMPLATE_SCENES.testCar
  },
  {
    id: 'garden-3d',
    name: 'Jardín 3D',
    icon: '🌳',
    description: 'Escena simple con árboles, piedras y suelo para probar rendimiento.',
    editorVersion: ATLAS_ENGINE_LABEL,
    installed: true,
    data: TEMPLATE_SCENES.garden3d
  }
];

export function getDefaultTemplate() {
  return TEMPLATES[0];
}

export function getTemplateById(id) {
  return TEMPLATES.find((template) => template.id === id) || getDefaultTemplate();
}
