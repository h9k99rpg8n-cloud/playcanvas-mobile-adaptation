# Atlas Engine

Motor gráfico web móvil, open source, creado por módulos para crear, editar y probar juegos 3D desde navegador móvil.

## Demo

https://h9k99rpg8n-cloud.github.io/playcanvas-mobile-adaptation/

## Versión actual

**0.0.4 — Primer editor**

Esta versión agrega la primera pantalla del editor visual:

- Página `editor.html`.
- Barra superior del editor.
- Viewport inicial simulado.
- Panel de jerarquía.
- Panel de inspector.
- Panel de assets.
- Botón para agregar objetos demo.
- Apertura del editor desde proyectos.

Todavía no incluye render 3D real. Esta versión crea el cascarón del editor para que el motor ya tenga forma de herramienta.

## Arquitectura por módulos

El proyecto se organiza por módulos para que el motor pueda crecer sin volverse un solo archivo gigante.

```text
src/
├── app/
│   ├── editor-page.js
│   └── projects-page.js
├── core/
│   └── storage.js
└── modules/
    ├── editor/
    │   ├── editor-state.js
    │   └── editor-ui.js
    ├── projects/
    │   ├── project-store.js
    │   └── project-ui.js
    └── templates/
        └── template-registry.js
```

## Objetivo

La idea es construir una experiencia móvil ordenada:

1. **Launcher**: pantalla inicial para entrar al motor.
2. **Gestión de proyectos**: crear, abrir, eliminar y listar proyectos.
3. **Plantillas**: elegir la base del proyecto antes de abrir el editor.
4. **Editor visual**: escena 3D, cámara táctil, jerarquía, inspector y assets.
5. **Editor de código**: pantalla para escribir y editar scripts.
6. **Modo probar juego**: ejecutar la escena en pantalla completa desde el móvil.

## Estrategia inicial

En vez de modificar todo el código fuente de PlayCanvas desde el primer día, este proyecto empezará con una base limpia:

- Documentar la arquitectura móvil.
- Crear una interfaz prototipo desde cero.
- Conectar el prototipo al motor cuando la base sea estable.
- Mantener separada la adaptación móvil del código original para facilitar futuras actualizaciones.

## Relación con PlayCanvas

Este es un proyecto no oficial. PlayCanvas y sus proyectos originales pertenecen a sus respectivos autores. Si se reutiliza código de PlayCanvas, se conservarán los avisos de copyright y licencia correspondientes.

## Licencia

Este repositorio usa licencia MIT. Revisa el archivo `LICENSE`.
