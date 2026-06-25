# Atlas Engine

Motor gráfico web móvil, open source, creado por módulos para crear, editar y probar juegos 3D desde navegador móvil.

## Demo

https://h9k99rpg8n-cloud.github.io/playcanvas-mobile-adaptation/

## Versión actual

**0.0.3 — Plantillas**

Esta versión agrega el flujo de creación por plantillas:

- Escena vacía.
- Juego 3D.
- Aplicación web.
- Demo básica.
- Panel móvil para crear proyecto sin salir de la página.
- Eliminación por icono en cada proyecto para ahorrar espacio.
- Guardado de plantilla elegida en `localStorage` del navegador.

La demo básica todavía es solo interfaz; tendrá funcionalidad cuando llegue el editor visual.

## Arquitectura por módulos

El proyecto se organiza por módulos para que el motor pueda crecer sin volverse un solo archivo gigante.

```text
src/
├── app/
│   └── projects-page.js
├── core/
│   └── storage.js
└── modules/
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
