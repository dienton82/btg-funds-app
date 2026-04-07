# BTG Funds App

## Descripción

Aplicación frontend desarrollada en Angular como prueba técnica para la gestión de fondos FPV y FIC. La solución permite consultar el portafolio disponible, realizar suscripciones, cancelar participaciones activas y revisar el historial de transacciones. El proyecto está enfocado en una arquitectura frontend clara, manejo de estado reactivo y una interfaz consistente con una línea visual dark premium.

## Demo

https://dienton82.github.io/btg-funds-app/

## Tecnologías

- Angular
- TypeScript
- SCSS
- RxJS
- Reactive Forms
- Jasmine
- Karma

## Funcionalidades

- Visualización de fondos disponibles.
- Suscripción a fondos con validación de monto mínimo y saldo disponible.
- Cancelación de participación con actualización inmediata del saldo.
- Visualización del historial de transacciones.
- Selección de método de notificación.
- Validaciones básicas de formulario y mensajes de error.

## Arquitectura y Enfoque

La aplicación está organizada por capas para mantener una separación clara de responsabilidades. Los componentes standalone manejan la presentación y la interacción con el usuario. La lógica de negocio y el estado reactivo se concentran en servicios. La simulación de acceso a datos se resuelve mediante una capa mock asíncrona para representar un flujo más cercano a una integración real. El proyecto prioriza claridad de código, mantenibilidad y una experiencia de usuario coherente.

## Diseño UI

La interfaz sigue una línea dark neumorphism con una estética sobria, moderna y consistente. El sistema visual incluye un estilo global de botones, superficies oscuras con profundidad suave, inputs personalizados y un selector custom para evitar estilos nativos del navegador. La intención es mantener una experiencia visual limpia, premium y adecuada para una demostración técnica.

## Mejoras Recientes

- Sistema unificado de botones con variantes globales.
- Eliminación de estilos nativos del navegador en controles principales.
- Selector custom con estilo dark y acento verde premium.
- Dropdown refinado con scroll interno y control de altura.
- Mayor consistencia visual entre modal, fondos, historial y navegación.

## Instalación

```bash
npm install
ng serve
```

## Build

```bash
ng build
```

## Autor

Yeison Álvarez
