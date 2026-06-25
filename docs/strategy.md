# Estrategia de adaptación móvil

## Decisión principal

No vamos a descargar y modificar todo el código fuente de PlayCanvas de golpe. Eso haría el proyecto difícil de entender, difícil de actualizar y fácil de romper.

La estrategia será **híbrida**:

1. **Interfaz móvil reescrita desde cero**
   - Launcher.
   - Editor visual.
   - Editor de código.
   - Menús táctiles.
   - Paneles inferiores.
   - Inspector simplificado.

2. **Motor/renderizado no reescrito desde cero**
   - El renderizado 3D ya existe y funciona.
   - No conviene reescribir luces, cámara, materiales y WebGL desde cero al inicio.
   - Primero se crea la interfaz y luego se conecta al motor.

3. **Código abierto reutilizado con cuidado**
   - Si se toma código de PlayCanvas u otro proyecto, se conservarán sus avisos de licencia.
   - La adaptación móvil será no oficial.
   - No se debe presentar como producto oficial de PlayCanvas.

## Por qué no copiar todo desde el inicio

Copiar todo el código fuente al principio tiene problemas:

- Es demasiado grande.
- Puede ser difícil entender qué archivo hace qué.
- Cada actualización oficial puede romper nuestros cambios.
- Sería complicado trabajar desde móvil.

## Camino recomendado

1. Crear documentación y diseño.
2. Crear un prototipo pequeño de interfaz móvil.
3. Crear navegación entre tres pantallas: Launcher, Editor y Código.
4. Agregar controles táctiles de cámara.
5. Agregar un visor 3D básico.
6. Conectar gradualmente con PlayCanvas Engine.
7. Revisar qué partes del editor original conviene estudiar o adaptar.

## Regla de oro

Primero hacer algo pequeño que funcione en móvil. Después crecerlo poco a poco.
