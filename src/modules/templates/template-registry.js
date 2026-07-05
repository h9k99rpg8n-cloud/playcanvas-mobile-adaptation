import { ATLAS_ENGINE_LABEL } from '../../core/version.js';
import { TEMPLATE_SCENES } from './template-scenes.js';

const meta = { source: 'local', version: '1.0.0', remote: null, installMode: 'bundled-primitives', editorVersion: ATLAS_ENGINE_LABEL };

export const TEMPLATES = [
  { ...meta, id: 'empty-scene', name: 'Escena vacía', icon: '◇', description: 'Proyecto limpio sin objetos iniciales.', installed: true, data: { scene: { objects: [], ui: [] } } },
  { ...meta, id: 'basic-3d-scene', name: 'Escena básica', icon: '⬛', description: 'Base 3D limpia con piso y cubo inicial.', installed: true, data: TEMPLATE_SCENES.basic3d },
  { ...meta, id: 'test-car-3d', name: 'Carrito de prueba', icon: '🚗', description: 'Carrito armado con primitivas para probar composición 3D.', installed: false, data: TEMPLATE_SCENES.testCar },
  { ...meta, id: 'garden-3d', name: 'Jardín 3D', icon: '🌳', description: 'Escena simple para probar rendimiento.', installed: false, data: TEMPLATE_SCENES.garden3d }
];

export function getDefaultTemplate() { return TEMPLATES[0]; }
export function getTemplateById(id) { return TEMPLATES.find((template) => template.id === id) || getDefaultTemplate(); }
