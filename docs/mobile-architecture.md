# Arquitectura móvil de Atlas Engine

Este documento describe la aplicación que existe actualmente. No representa funciones imaginadas ni prototipos antiguos.

## Superficies principales

### Launcher

Archivo: `index.html`

Responsabilidades:

- Mostrar proyectos.
- Crear proyectos desde una plantilla.
- Renombrar, duplicar y eliminar.
- Instalar plantillas.
- Configurar FPS por proyecto.
- Abrir el editor con el identificador del proyecto.

### Editor 3D

Archivo: `scene-editor.html`

Responsabilidades:

- Crear el viewport de Three.js.
- Cargar la escena del proyecto activo.
- Controlar la cámara táctil.
- Seleccionar y transformar objetos.
- Crear primitivas.
- Mostrar la jerarquía.
- Guardar la escena en IndexedDB.

### Compatibilidad

`projects.html` existe únicamente para enviar enlaces antiguos al launcher actual.

### Audio experimental

`audio.html` y `src/modules/audio/` están separados del motor activo. No deben conectarse al editor hasta que exista una especificación para assets y componentes de audio.

## Flujo de datos

```text
Launcher
  ↓ crea o abre
ProjectStore
  ↓ lee y escribe
Storage / IndexedDB
  ↓ entrega proyecto
EditorCore
  ├── ViewportRenderer
  ├── SceneManager
  ├── HierarchyPanel
  ├── TransformGizmo
  └── ToolboxUI
```

## Controles móviles actuales

- Un dedo sobre el viewport: orbitar.
- Pellizco con dos dedos: zoom.
- Movimiento de dos dedos: desplazamiento.
- Gizmo seleccionado: mover, rotar o escalar.
- Botón Crear: abrir la lista de primitivas.
- Botón de jerarquía: abrir o cerrar el árbol.
- Toque normal en la jerarquía: seleccionar sin mover el objeto.
- Desplazamiento vertical en la jerarquía: recorrer la lista sin cambiar padres.
- Pulsación de 360 ms y arrastre: iniciar parenting táctil.
- Zona del encabezado: soltar un objeto para convertirlo en raíz.

## Problemas móviles que deben resolverse

- Diferenciar claramente un toque de selección de un arrastre para orbitar.
- Mantener botones fuera de las áreas seguras del iPhone.
- Reducir superposiciones en pantallas estrechas.
- Evitar redimensionar renderizadores cuando las dimensiones no cambian.
- Confirmar que el borde de selección sigue al objeto transformado.

## Orden de desarrollo inmediato

1. Saneamiento estructural: completado.
2. Persistencia de padre, hijo y nieto: cubierta por pruebas automáticas.
3. Conflictos de gestos táctiles: implementación completada; falta validación física en iPhone.
4. Añadir un inspector inicialmente de solo lectura después de esa validación.
5. Habilitar edición de posición, rotación y escala por partes.

El inspector no debe comenzar hasta que la jerarquía y las transformaciones sobrevivan correctamente a una recarga.
