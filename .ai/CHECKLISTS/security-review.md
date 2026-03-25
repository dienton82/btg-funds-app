# Security Review Checklist

- [ ] No hay secrets, tokens ni credenciales expuestas.
- [ ] No se usa `innerHTML`, `bypassSecurityTrust...` ni patrones similares sin justificacion.
- [ ] Los formularios validan campos requeridos y reglas de negocio visibles.
- [ ] La logica sensible no esta duplicada entre componentes y servicios.
- [ ] No hay `any` innecesarios ni tipado debil evitable.
- [ ] Los estados de error y exito son claros y no filtran detalles tecnicos.
- [ ] `TypeScript` compila limpio con `npx tsc -p tsconfig.app.json --noEmit`.
- [ ] El build funciona con `npm run build`.
