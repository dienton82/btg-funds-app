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

## Uso de inteligencia artificial y control de desarrollo

La inteligencia artificial se utilizó como herramienta de apoyo durante el desarrollo, no como sustituto del criterio técnico. Su uso se concentró en tareas de generación asistida de código, refactorización localizada, revisión de consistencia y validación de alternativas de implementación.

Todas las decisiones relevantes fueron revisadas manualmente antes de incorporarse al proyecto. La definición de arquitectura, la interpretación de reglas del negocio, la validación de flujos y la aceptación final de cada cambio quedaron bajo control humano. Este criterio fue especialmente importante porque las herramientas de IA no conocen por sí mismas el contexto completo del problema ni los objetivos específicos de la prueba.

El trabajo se condujo bajo un flujo estructurado de análisis, diseño, implementación y verificación. Este enfoque permitió utilizar la IA como acelerador de tareas concretas sin perder control sobre mantenibilidad, alcance ni coherencia técnica.

## Enfoque de calidad y verificación

El proyecto se desarrolló con TypeScript en modo estricto para reforzar consistencia de tipos y reducir errores en tiempo de compilación. La solución mantiene una separación clara entre lógica de negocio, utilidades compartidas y componentes de presentación.

Además de la validación automática por compilación, se realizó verificación manual de los flujos principales de suscripción, cancelación, actualización de saldo e historial. Antes de considerar la entrega, se comprobó el comportamiento funcional esperado y se revisaron estados visibles, mensajes y validaciones.

También se incorporó una capa ligera de control del repositorio mediante scripts de verificación. Esto permitió validar compilación, build y revisión básica del estado general del proyecto antes del cierre.

## Seguridad y buenas prácticas

La implementación sigue un conjunto de prácticas básicas de seguridad frontend alineadas con criterios comunes de OWASP para este tipo de solución. No se utiliza `innerHTML` ni mecanismos de renderizado inseguro en la UI. La entrada del usuario se valida desde formularios reactivos y las reglas sensibles del flujo se concentran en servicios en lugar de dispersarse en componentes.

El proyecto no expone secretos, claves ni configuración sensible en frontend. El uso de tipado fuerte ayuda a reducir errores accidentales y a hacer más predecible el manejo del estado. Los errores visibles al usuario se presentan de forma controlada, sin exponer detalles internos innecesarios.

Adicionalmente, se realizó una revisión manual orientada a detectar riesgos frontend frecuentes, duplicación innecesaria y prácticas que pudieran afectar mantenibilidad o seguridad básica.

## Scripts y revisión del código

El repositorio incluye una carpeta `scripts/` con utilidades de apoyo para validación previa a entrega. Estos scripts no reemplazan la revisión técnica, pero agregan una capa ligera y repetible de control.

Scripts disponibles:

- `verify.ps1`: ejecuta validaciones de compilación, build y, cuando aplica, pruebas disponibles.
- `review-security.ps1`: guía una revisión manual breve de aspectos de seguridad y robustez.
- `review-frontend.ps1`: guía una revisión manual de UI, responsive, estados y consistencia visual.

En conjunto, estos scripts permiten verificar compilación, build, checklist de seguridad y revisión básica de frontend antes de cerrar cambios relevantes.

## Orquestación del desarrollo

El desarrollo se ejecutó con apoyo de herramientas de IA, pero dentro de un flujo controlado. La dinámica seguida fue: definición del problema, generación asistida de propuestas de implementación, validación manual de los cambios y posterior iteración controlada.

Se evitó incorporar código generado sin contexto suficiente o sin revisión explícita. Cuando surgieron alternativas con impacto funcional o visual, se priorizó una solución entendible, mantenible y consistente con el alcance de la prueba.

El criterio principal durante todo el proceso fue favorecer claridad, control y capacidad de revisión por encima de velocidad de entrega o volumen de cambios.
