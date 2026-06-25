# Arquitectura móvil inicial

La app será una sola página web con tres pantallas principales.

```text
App móvil
│
├── Launcher
│   ├── Nuevo proyecto
│   ├── Mis proyectos
│   ├── Plantillas
│   └── Ajustes
│
├── Editor visual
│   ├── Vista 3D
│   ├── Cámara táctil
│   ├── Jerarquía
│   ├── Inspector
│   ├── Assets
│   └── Probar juego
│
└── Editor de código
    ├── Lista de scripts
    ├── Área de edición
    ├── Guardar
    └── Volver al editor
```

## 1. Launcher

El Launcher será la entrada del usuario.

Debe servir para:

- Crear proyecto.
- Abrir proyecto.
- Elegir plantilla.
- Cambiar ajustes.
- Entrar al editor visual.

## 2. Editor visual

El Editor visual será la parte principal.

Debe incluir:

- Escena 3D.
- Cámara táctil.
- Selección de objetos tocando la pantalla.
- Panel de jerarquía.
- Inspector de propiedades.
- Explorador de assets.
- Botón para probar el juego.

## 3. Editor de código

El Editor de código será otra pantalla dentro de la misma app.

Debe incluir:

- Lista de archivos script.
- Editor de texto.
- Botón guardar.
- Botón volver al editor visual.

## Navegación

No serán tres páginas separadas del navegador. Será una sola app con tres vistas internas.

Ejemplo:

```text
currentScreen = "launcher"
currentScreen = "editor"
currentScreen = "code"
```

## Controles móviles básicos

- Un dedo: girar cámara o seleccionar.
- Dos dedos: zoom.
- Arrastre con botón activo: mover objeto.
- Botón flotante: abrir menú de creación.
- Panel inferior: mostrar propiedades.

## Prioridad inicial

La primera versión no necesita todas las funciones. Debe lograr esto:

1. Abrir la app.
2. Cambiar entre Launcher, Editor y Código.
3. Mostrar una escena 3D básica.
4. Mover la cámara en móvil.
5. Guardar una estructura simple de proyecto.
