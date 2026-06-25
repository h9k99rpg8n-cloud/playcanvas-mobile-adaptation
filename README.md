# PlayCanvas Mobile Adaptation

Adaptación móvil no oficial inspirada en PlayCanvas para crear, editar y probar juegos 3D desde navegador móvil.

## Objetivo

El objetivo de este repositorio no es copiar todo el editor oficial de golpe ni romper el motor. La idea es construir una experiencia móvil ordenada:

1. **Launcher**: pantalla inicial para crear o abrir proyectos.
2. **Editor visual**: escena 3D, cámara táctil, jerarquía, inspector y assets.
3. **Editor de código**: pantalla para escribir y editar scripts.
4. **Modo probar juego**: ejecutar la escena en pantalla completa desde el móvil.

## Estrategia inicial

En vez de modificar todo el código fuente de PlayCanvas desde el primer día, este proyecto empezará con una base limpia:

- Documentar la arquitectura móvil.
- Crear una interfaz prototipo desde cero.
- Conectar el prototipo al motor cuando la base sea estable.
- Mantener separada la adaptación móvil del código original para facilitar futuras actualizaciones.

## Decisión técnica inicial

La ruta recomendada es **híbrida**:

- Reescribir la interfaz móvil desde cero.
- No reescribir el renderizado 3D desde cero.
- Conectar la interfaz móvil al engine cuando ya exista una base estable.
- Reutilizar código abierto solo cuando sea necesario y manteniendo sus avisos de licencia.

## Relación con PlayCanvas

Este es un proyecto no oficial. PlayCanvas y sus proyectos originales pertenecen a sus respectivos autores. Si se reutiliza código de PlayCanvas, se conservarán los avisos de copyright y licencia correspondientes.

## Licencia

Este repositorio usa licencia MIT. Revisa el archivo `LICENSE`.
