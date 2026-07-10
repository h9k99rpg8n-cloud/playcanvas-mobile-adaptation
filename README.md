# Atlas Engine

Atlas Engine es un editor 3D web móvil y de código abierto. Está diseñado para crear, organizar y editar escenas 3D directamente desde el navegador de un teléfono.

## Estado actual

**0.0.12.4.2 — Pre-alpha funcional del editor**

Atlas ya incluye un launcher, gestión local de proyectos y un viewport 3D real basado en Three.js. Todavía no ofrece el ciclo completo para crear y exportar un juego.

## Demo pública

https://h9k99rpg8n-cloud.github.io/playcanvas-mobile-adaptation/

## Funciones disponibles

- Launcher adaptable a móvil.
- Crear, abrir, renombrar, duplicar y eliminar proyectos.
- Plantillas locales instalables.
- Persistencia mediante IndexedDB y localForage.
- Viewport 3D con Three.js.
- Cámara orbital táctil con giro, zoom y desplazamiento.
- Cubo, esfera, cápsula, cilindro, quad y toroide.
- Selección de objetos y gizmos de mover, rotar y escalar.
- Jerarquía con objetos padre e hijo.
- Parenting móvil mediante pulsación prolongada, sin activarse al desplazar la lista.
- Renombrado y creación de hijos desde la jerarquía.
- Guardado de escena, transformaciones y `parentId`.
- Contador de FPS configurable por proyecto.

## Funciones todavía pendientes

- Inspector de propiedades.
- Deshacer y rehacer.
- Eliminación y duplicación de objetos dentro del editor.
- Importación de modelos, texturas y otros assets.
- Materiales y luces editables.
- Modo de juego.
- Componentes o scripts.
- Física, animación y audio integrado.
- Exportación de juegos.

## Entradas activas

- `index.html`: launcher y administración de proyectos.
- `scene-editor.html`: editor y viewport 3D.
- `projects.html`: redirección compatible hacia el launcher actual.
- `audio.html`: experimento independiente, todavía no integrado al motor.

## Arquitectura activa

```text
src/
├── app/
│   ├── EditorCore.js
│   ├── launcher-app.js
│   ├── atlas-welcome.js
│   ├── atlas-fps-settings.js
│   └── atlas-template-sync.js
├── core/
│   └── version.js
└── modules/
    ├── camera/
    │   └── OrbitController.js
    ├── data/
    │   ├── ProjectStore.js
    │   └── Storage.js
    ├── grid/
    │   └── viewport-grid.js
    ├── hierarchy/
    │   ├── HierarchyPanel.js
    │   └── LongPressDragGesture.js
    ├── rendering/
    │   ├── PrimitiveFactory.js
    │   ├── ViewportEnvironment.js
    │   └── ViewportRenderer.js
    ├── scenemanager/
    │   └── SceneManager.js
    ├── templates/
    │   ├── template-registry.js
    │   └── template-scenes.js
    ├── tools/
    │   ├── ToolboxUI.js
    │   ├── TransformGizmo.js
    │   └── ViewGizmo.js
    └── utils/
        └── StatsMonitor.js
```

Consulta `docs/mobile-architecture.md` para el mapa funcional y `docs/scene-format.md` para el formato de guardado actual.

## Tecnologías

- JavaScript con módulos ES.
- Three.js 0.165.0.
- localForage 1.10.0.
- IndexedDB.
- HTML y CSS sin framework.
- GitHub Pages.

Las dependencias se mantienen congeladas durante el saneamiento. Cualquier actualización de Three.js debe realizarse aparte y con pruebas específicas.

## Principios del proyecto

1. Móvil primero.
2. Una responsabilidad clara por módulo.
3. No agregar funciones sobre una base inestable.
4. Proteger proyectos guardados.
5. Probar en iPhone antes de fusionar cambios.
6. Mantener separado Atlas de Jumbo, Studio Lite y Sentrix Studio.

## Licencia

Este repositorio utiliza la licencia MIT. Consulta `LICENSE`.
