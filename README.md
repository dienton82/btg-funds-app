# BTG Funds App

Aplicación Angular desarrollada como prueba técnica para la gestión de fondos FPV y FIC. El proyecto permite consultar el portafolio disponible, suscribirse a un fondo con validaciones de negocio, cancelar participaciones activas y revisar el historial de transacciones con actualización reactiva del saldo.

## Descripción

La solución está construida como una SPA con Angular standalone. El estado del dominio se centraliza en una capa de servicio y la simulación de acceso a datos se resuelve mediante un repositorio mock asíncrono para representar un flujo más cercano a una API real. La interfaz prioriza claridad, consistencia visual y separación entre presentación, estado y reglas de negocio.

## Stack tecnológico

- Angular 20 con standalone components
- TypeScript en modo estricto
- RxJS con `BehaviorSubject`, `Observable` y operadores reactivos
- Reactive Forms para el flujo de suscripción
- SCSS para estilos modulares y responsive
- Jasmine y Karma para pruebas unitarias
- Angular CLI para ejecución, testing y build

## Funcionalidades principales

- Visualización de fondos disponibles con estado `Disponible` o `Suscrito`
- Consulta del saldo actual y del número de movimientos registrados
- Suscripción a fondos desde un modal standalone
- Validación de monto mínimo, saldo suficiente y método de notificación
- Cancelación de participación con confirmación desde la UI
- Actualización inmediata de saldo, historial y estado del fondo
- Historial responsive con tabla en desktop y tarjetas en mobile
- Feedback visual para operaciones exitosas o fallidas
- Loading states para carga inicial del catálogo y del historial

## Decisiones técnicas

- `FundsRepository` abstrae la simulación de acceso a datos y agrega latencia controlada para representar un comportamiento asíncrono.
- `FundsService` concentra la lógica de negocio, mantiene el estado reactivo y expone view models semánticos para las pantallas principales.
- Los componentes de UI se limitan a orquestar interacciones, mostrar datos y manejar estados de presentación.
- El flujo de suscripción utiliza formularios reactivos con validaciones explícitas y tipado fuerte.
- Los resultados de acciones críticas se normalizan con un tipo de retorno consistente para éxito y error.
- El proyecto se entrega como SPA browser-only. Se descartó SSR para evitar complejidad innecesaria y la fricción de prerender en una prueba cuyo alcance es frontend.

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

## Pruebas y verificación

Verificación de TypeScript:

```bash
npx tsc -p tsconfig.app.json --noEmit
```

Ejecución de pruebas unitarias:

```bash
npm test -- --watch=false --browsers=ChromeHeadless
```

Comando de validación rápida del repositorio:

```powershell
./scripts/verify.ps1
```

## Demo en video

Video corto de funcionamiento:

- https://youtu.be/UWF93AqRKuU

## Supuestos del negocio

- El saldo inicial del usuario es `500000`.
- Un fondo solo puede tener una participación activa a la vez.
- La suscripción debe cumplir el monto mínimo definido por cada fondo.
- La suscripción no puede superar el saldo disponible.
- La cancelación devuelve el monto efectivamente suscrito, no solo el monto mínimo del fondo.
- El método de notificación seleccionado en la suscripción se conserva para registrar la cancelación en el historial.
- No existe persistencia externa ni integración con backend. El estado vive en memoria durante la sesión.

## Notas técnicas relevantes

- La navegación principal se resuelve con rutas standalone para `/funds` y `/transactions`.
- El historial registra operaciones `SUBSCRIBE` y `CANCEL` con monto, fondo, fecha y método de notificación.
- La UI refleja en tiempo real el saldo, el estado de cada fondo y el historial a partir del estado centralizado en el servicio.
- Los nombres de fondos se formatean en la capa de presentación para mejorar legibilidad sin alterar el dato original.
- El repositorio mock asíncrono introduce tiempos de carga controlados para reflejar mejor un escenario de integración frontend.
- El proyecto está preparado para revisión local sin configuración adicional distinta a `npm install`.

## Uso de inteligencia artificial y control del desarrollo

El desarrollo se realizó desde Visual Studio Code con apoyo de herramientas de inteligencia artificial utilizadas de forma complementaria. Se emplearon ChatGPT, Codex, GitHub Copilot y Gemini como soporte durante distintas etapas del trabajo, cada una con un rol específico dentro de un flujo controlado.

- ChatGPT: apoyo en arquitectura, análisis de alternativas, diseño de soluciones y evaluación de decisiones técnicas.
- Codex: ejecución de tareas estructuradas, aplicación de cambios concretos y generación de código bajo instrucciones explícitas y controladas.
- GitHub Copilot: asistencia de autocompletado y apoyo en fragmentos repetitivos de implementación.
- Gemini: contraste de soluciones y validación complementaria de criterios técnicos.

La IA fue utilizada como herramienta de apoyo, no como fuente de verdad. Todas las decisiones fueron revisadas manualmente y el control final del código recayó en el desarrollador. La IA no conoce el contexto completo del negocio, por lo que cada resultado fue evaluado y ajustado antes de ser incorporado al proyecto.

## Orquestación del desarrollo

El desarrollo se ejecutó bajo un flujo estructurado de análisis del requerimiento, diseño de la solución, implementación guiada y verificación con ajustes posteriores.

Se evitó incorporar código generado sin contexto suficiente o sin validación explícita. Cada propuesta se evaluó antes de integrarse al repositorio, priorizando claridad, mantenibilidad y control sobre automatización.

## Revisión cruzada del código

El código generado o sugerido durante el desarrollo fue contrastado mediante múltiples herramientas de IA. En la práctica, una herramienta podía proponer una implementación inicial mientras otra se utilizaba para revisar posibles mejoras, detectar inconsistencias, señalar riesgos o cuestionar decisiones técnicas.

Este enfoque de revisión cruzada ayudó a validar decisiones de diseño, detectar errores potenciales y elevar la calidad general del código antes de su incorporación. La validación final de cada cambio siempre fue manual.

## Enfoque de seguridad y calidad

El proyecto sigue prácticas básicas de seguridad frontend alineadas con criterios comunes de OWASP. No se utiliza `innerHTML` ni mecanismos de render inseguro, la entrada del usuario se valida en formularios reactivos, no existen secretos expuestos en frontend y la lógica sensible se centraliza en servicios.

El uso de tipado fuerte reduce errores accidentales y ayuda a mantener coherencia entre dominio, estado y presentación. Además, el código fue revisado para evitar duplicación innecesaria, malas prácticas comunes y cualquier exposición accidental de datos sensibles.

## Scripts de verificación y revisión

La carpeta `scripts/` reúne utilidades de apoyo para revisar el estado del proyecto antes de entregar cambios. Su objetivo es reforzar control operativo y facilitar una validación mínima repetible.

- `verify.ps1`: ejecuta validaciones de compilación y build.
- `review-security.ps1`: guía una revisión manual breve mediante un checklist de seguridad.
- `review-frontend.ps1`: guía una revisión manual de consistencia visual, responsive y estados de la interfaz.

Estos scripts funcionan como una capa ligera de verificación previa a entrega y ayudan a mantener control sobre compilación, calidad visible y revisión básica del código.

## Despliegue y acceso

El proyecto fue publicado en GitHub como repositorio público para permitir revisión completa del código fuente, estructura y decisiones de implementación.

La aplicación puede ejecutarse localmente sin configuración adicional distinta a la instalación de dependencias. Esta decisión busca facilitar la revisión técnica del evaluador y reducir fricción durante la puesta en marcha del proyecto.

## Posibles mejoras futuras

- Incorporar pruebas unitarias adicionales sobre componentes de presentación y formularios.
- Agregar filtros y ordenamiento al historial de transacciones.
- Extraer tokens visuales compartidos para consolidar colores, sombras y espaciados.
- Persistir el estado en backend o almacenamiento local.
- Añadir autenticación y gestión de perfiles si el alcance del producto creciera.
