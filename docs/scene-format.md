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

## Riesgo conocido

Al reconstruir padres se debe evitar interpretar una transformación local como transformación global. La prueba mínima será:

1. Crear un padre desplazado.
2. Crear un hijo con posición local distinta de cero.
3. Añadir un nieto.
4. Guardar y recargar.
5. Confirmar transformaciones locales y globales.

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
