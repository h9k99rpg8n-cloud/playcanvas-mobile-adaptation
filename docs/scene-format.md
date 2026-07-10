# Formato de escena de Atlas

## Estado

El formato actual es implícito y todavía no posee `schemaVersion`. Antes de construir el inspector deberá convertirse en un esquema versionado.

## Ubicación

La escena se almacena dentro de cada proyecto:

```text
project.data.scene
```

## Estructura actual

```json
{
  "objects": [
    {
      "id": "object-...",
      "parentId": null,
      "name": "Cubo",
      "type": "cube",
      "position": [0, 0, 0],
      "rotation": [0, 0, 0],
      "scale": [1, 1, 1]
    }
  ],
  "ui": []
}
```

## Reglas

- `id` debe ser único y estable.
- `parentId` es `null` para objetos raíz.
- `parentId` debe apuntar a otro objeto existente.
- `rotation` se guarda en grados.
- Posición, rotación y escala representan transformaciones locales.
- `type` debe corresponder a una primitiva admitida.
- Una relación circular debe rechazarse.

## Invariante de carga

Al reconstruir padres Atlas conserva las transformaciones locales guardadas. El reparenting interactivo, en cambio, conserva la transformación global para evitar que el objeto salte en el viewport.

La cobertura automática comprueba este caso mínimo:

1. Crear un padre desplazado.
2. Crear un hijo con posición local distinta de cero.
3. Añadir un nieto.
4. Guardar y recargar.
5. Confirmar transformaciones locales y globales.

También comprueba que una relación circular se rechace.

## Siguiente versión del esquema

El futuro formato deberá incorporar:

```json
{
  "schemaVersion": 1,
  "objects": [],
  "ui": []
}
```

Toda modificación posterior necesitará una migración explícita.
