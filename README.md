# BTG Funds App

Aplicación Angular desarrollada como prueba técnica para la gestión de fondos. El proyecto permite consultar el portafolio disponible, suscribirse a un fondo con validaciones de negocio, cancelar participaciones activas y revisar el historial de transacciones con actualización reactiva del saldo.

## Descripción

La solución está construida como una SPA con Angular standalone. El estado del dominio se mantiene en memoria y se centraliza en un servicio que actúa como fuente de verdad. La interfaz prioriza claridad, consistencia visual y una separación simple entre presentación y reglas de negocio.

## Stack tecnológico

- Angular 20 con standalone components
- TypeScript en modo estricto
- RxJS con `BehaviorSubject` para manejo de estado local
- Reactive Forms para el flujo de suscripción
- SCSS para estilos modulares y responsive
- Angular CLI para ejecución y build

## Funcionalidades principales

- Visualización de fondos disponibles con estado `Disponible` o `Suscrito`
- Consulta del saldo actual y del número de movimientos registrados
- Suscripción a fondos desde un modal standalone
- Validación de monto mínimo, saldo suficiente y método de notificación
- Cancelación de participación con confirmación desde la UI
- Actualización inmediata del saldo y del historial de transacciones
- Historial responsive con tabla en desktop y tarjetas en mobile
- Mensajes de feedback para operaciones exitosas o fallidas

## Decisiones técnicas

- `FundsService` concentra la lógica de negocio y opera como fuente de verdad del estado.
- El estado se maneja con `BehaviorSubject` para mantener la solución simple, reactiva y fácil de seguir durante la evaluación.
- Los componentes de UI se limitan a orquestar interacciones, mostrar datos y manejar estados de presentación.
- El flujo de suscripción utiliza formularios reactivos con validaciones explícitas y tipado fuerte.
- Los resultados de acciones críticas se normalizan con un tipo de retorno consistente para éxito y error.
- El proyecto se entrega como SPA browser-only. Se descartó SSR para evitar complejidad innecesaria y la fricción de prerender que no aporta valor al alcance de esta prueba.

## Estructura del proyecto

```text
src/app
|-- core
|   `-- services
|-- shared
|   |-- models
|   `-- utils
`-- features
    |-- funds
    |   |-- components
    |   `-- pages
    `-- transactions
        |-- components
        `-- pages
```

## Instalación

```bash
npm install
```

## Ejecución en desarrollo

```bash
npm start
```

La aplicación queda disponible en `http://localhost:4200/`.

## Build

```bash
npm run build
```

Verificación de TypeScript:

```bash
npx tsc -p tsconfig.app.json --noEmit
```

Comando de validación rápida del repositorio:

```powershell
./scripts/verify.ps1
```

## Supuestos del negocio

- El saldo inicial del usuario es `500000`.
- Un fondo solo puede tener una participación activa a la vez.
- La suscripción debe cumplir el monto mínimo definido por cada fondo.
- La suscripción no puede superar el saldo disponible.
- La cancelación devuelve el monto efectivamente suscrito, no solo el monto mínimo del fondo.
- El método de notificación seleccionado en la suscripción se conserva para registrar la cancelación en el historial.
- No existe persistencia externa ni integración con backend. El estado vive en memoria durante la sesión.

## Posibles mejoras futuras

- Incorporar pruebas unitarias para `FundsService` y para los componentes principales.
- Agregar filtros y ordenamiento al historial de transacciones.
- Extraer tokens visuales compartidos para consolidar colores, sombras y espaciados.
- Persistir el estado en backend o almacenamiento local.
- Añadir autenticación y gestión de perfiles si el alcance del producto creciera.

## Notas técnicas relevantes

- La navegación principal se resuelve con rutas standalone para `/funds` y `/transactions`.
- El historial registra operaciones `SUBSCRIBE` y `CANCEL` con monto, fondo, fecha y método de notificación.
- La UI refleja en tiempo real el saldo, el estado de cada fondo y el historial a partir del estado centralizado en el servicio.
- Los nombres de fondos se formatean en la capa de presentación para mejorar legibilidad sin alterar el dato original.
- El proyecto está preparado para revisión local sin configuración adicional distinta a `npm install`.
