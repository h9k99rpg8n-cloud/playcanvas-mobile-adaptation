export const ATLAS_LAUNCHER_VERSION = '0.3.4';
export const ATLAS_ENGINE_VERSION = '0.0.12.4.2';
export const ATLAS_ENGINE_LABEL = `Atlas ${ATLAS_ENGINE_VERSION}`;

export const ATLAS_UPDATE_SUMMARY = [
  'Experiencia Profesional y Optimización.',
  'Jerarquía estilo Unity con renombrado solo al seleccionar.',
  'Botón verde para añadir objetos hijos desde la Jerarquía.',
  'Persistencia de nombre, posición y parentId en IndexedDB.',
  'Splash Screen con resumen de actualización.',
  'Historial de versiones en tarjetas profesionales.',
  'Toggle FPS desde Ajustes.',
  'Nueva plantilla Carreras con pista de Toroide.'
];

export const ATLAS_UPDATE_HISTORY = [
  { version: '0.0.12.4.2', title: 'Experiencia Profesional y Optimización', items: ATLAS_UPDATE_SUMMARY },
  { version: '0.0.12.2', title: 'Launcher Hub e IndexedDB', items: ['Launcher tipo Hub profesional.', 'ProjectStore migrado a IndexedDB con localForage.', 'Menú de acciones en proyectos.', 'Plantillas preparadas para contenido remoto.'] },
  { version: '0.0.12.1', title: 'Limpieza Visual', items: ['FPS reubicado.', 'Jerarquía más limpia.', 'Proyecto vacío disponible.', 'Formulario de crear proyecto como panel flotante.'] },
  { version: '0.0.12', title: 'Jerarquía y Toroide', items: ['Figura Toroide añadida.', 'Jerarquía básica del editor.', 'Primer sistema de selección por árbol.'] }
];
