# Seguridad basica del repositorio

## Reglas

- No exponer secrets, tokens, credenciales ni API keys en codigo, commits o ejemplos.
- No usar `innerHTML` ni APIs equivalentes sin sanitizacion fuerte y justificada.
- Validar formularios en UI y confirmar reglas criticas nuevamente en servicios.
- Evitar duplicar logica sensible en componentes; el service debe ser la fuente de verdad.
- Mantener tipado fuerte y evitar `any` innecesarios.
- No dejar `console.log`, trazas de debug o datos sensibles impresos en runtime final.
- No agregar dependencias nuevas si no aportan valor claro y bajo riesgo.
- Mostrar errores claros para el usuario sin exponer detalles tecnicos internos.
- Preferir templates declarativos y evitar patrones que faciliten XSS o manipulen HTML crudo.
- Revisar accesibilidad basica en formularios, botones, focus visible y mensajes.
