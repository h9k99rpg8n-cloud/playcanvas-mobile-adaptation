# Estrategia de desarrollo de Atlas Engine

## Objetivo

Construir un editor 3D móvil que funcione en navegador sin convertir el repositorio en un archivo gigante ni sacrificar proyectos guardados.

## Tecnología actual

Atlas utiliza Three.js como base de renderizado. El nombre histórico del repositorio conserva una referencia a PlayCanvas, pero el motor activo no carga PlayCanvas.

## Regla de saneamiento

La limpieza se realiza en este orden:

1. Crear una rama desde una versión conocida.
2. Identificar archivos alcanzables desde las páginas activas.
3. Retirar solamente código desconectado o reemplazado.
4. Comprobar sintaxis, imports y enlaces.
5. Probar launcher, editor y persistencia.
6. Fusionar únicamente después de la prueba móvil.

Una limpieza no debe modificar comportamiento visible.

## Regla de arquitectura

- `src/app/` coordina pantallas.
- `src/modules/data/` conserva proyectos y ajustes.
- `src/modules/rendering/` controla el viewport.
- `src/modules/scenemanager/` administra objetos.
- `src/modules/hierarchy/` representa relaciones padre-hijo.
- `src/modules/tools/` contiene herramientas del editor.
- `src/modules/templates/` define escenas iniciales.

Un módulo nuevo debe tener una responsabilidad clara y una entrada activa. No se conservarán copias antiguas sin referencias “por si acaso”; Git ya mantiene el historial.

## Compatibilidad de proyectos

Los datos guardados son parte del producto. Antes de cambiar el formato de escena se debe:

1. Añadir un número de esquema.
2. Crear una migración.
3. Probar un proyecto antiguo.
4. Conservar una copia antes de escribir datos convertidos.

## Dependencias

Three.js permanece fijado en 0.165.0 durante el saneamiento. Su actualización se realizará en una rama dedicada porque TransformControls puede cambiar entre versiones.

## Definición de terminado

Un cambio está terminado cuando:

- No introduce imports ausentes.
- No genera errores en consola.
- Funciona al recargar.
- Conserva los datos del proyecto.
- Respeta áreas seguras y objetivos táctiles.
- Supera la prueba real en iPhone.
- Está documentado cuando cambia arquitectura o datos.
