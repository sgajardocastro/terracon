# Checklist de calidad antes de merge

Usa esta lista antes de pedir review o abrir merge.

## Funcionalidad

- [ ] El cambio cumple el objetivo original.
- [ ] No rompe el flujo principal.
- [ ] Los vacios y errores tienen manejo razonable.
- [ ] Los textos, labels y estados reflejan el comportamiento real.

## Codigo

- [ ] El cambio esta aislado al alcance necesario.
- [ ] No quedaron `console.log`, `debugger` o code paths muertos.
- [ ] No se introdujo duplicacion innecesaria.
- [ ] Los nombres de variables y funciones explican lo que hacen.
- [ ] No se agregaron `eslint-disable` nuevos sin justificacion.

## UI / UX

- [ ] La pantalla se ve bien en desktop y en el ancho mas chico relevante.
- [ ] Loading, empty state y error state estan considerados.
- [ ] Si hay modal, print o PDF, la experiencia sigue siendo legible.

## Datos / API

- [ ] Los contratos de entrada y salida fueron revisados.
- [ ] Los datos opcionales no rompen el render.
- [ ] Las URLs y variables de entorno usadas son correctas para el ambiente.

## Verificacion

- [ ] `npm run lint`
- [ ] `npm run build`
- [ ] `npm run test:reclamo-smoke` si el cambio toca ese flujo o dependencias cercanas.
- [ ] Se probo el camino feliz manualmente.
- [ ] Se probo al menos un caso borde.

## Merge hygiene

- [ ] El diff final solo incluye archivos esperados.
- [ ] No se toco `src/` fuera del alcance del cambio, salvo que fuera intencional.
- [ ] La descripcion del PR explica que cambia y como se verifica.

## Criterio rapido

Si dudas entre "suficiente" y "listo", revisa:

1. Reproducibilidad.
2. Riesgo de regresion.
3. Facilidad de rollback.
