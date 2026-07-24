# Flujos comunes

Guia rapida para trabajar en `lg-terracon` sin perder el hilo.

## 1. Bugfix

Objetivo: aislar el fallo, reproducirlo, corregirlo y dejar una prueba o verificacion clara.

Pasos sugeridos:

1. Reproduce el problema con datos reales o un caso minimo.
2. Ubica el punto de entrada con busqueda rapida:
   - `rg -n "texto_del_error|nombre_funcion|campo" src`
3. Identifica si el fallo esta en UI, composable, servicio o transformacion de datos.
4. Corrige con el menor cambio posible.
5. Valida el caso roto y un caso sano.
6. Documenta la causa raiz si era un patron repetible.

Señales de buena solucion:

- El bug deja de ocurrir sin romper rutas vecinas.
- El fix no agrega deuda innecesaria.
- Hay una forma reproducible de verificarlo.

## 2. Feature

Objetivo: sumar comportamiento nuevo sin mezclarlo con cambios de alcance ajeno.

Pasos sugeridos:

1. Ubica el componente/pagina correcta en `src/pages/` o `src/components/`.
2. Revisa como se conecta con datos, stores y servicios.
3. Define el cambio en tres capas:
   - UI
   - estado/datos
   - persistencia o API
4. Implementa el minimo flujo feliz primero.
5. Agrega manejo de vacios, error y carga.
6. Ejecuta lint y build antes de cerrar.

Consejo practico:

- Si la feature afecta varios lugares, escribe primero el contrato de datos que va a compartir el resto.

## 3. Print / PDF

Objetivo: tocar flujos de impresion y exportacion sin romper maquetacion ni rutas de descarga.

Archivos que suelen entrar en juego:

- `src/pages/verSurveyPrint.vue`
- `src/components/FormularioEstadisticaMensual.vue`
- `src/services/sstService.js`
- `src/pages/gestionDocumentos.vue`
- `src/components/VerDoc.vue`
- `src/components/GanttasticRuta.vue`
- `src/components/GanttasticRuta2.vue`

Checklist de trabajo:

1. Identifica si el PDF se arma con HTML, `window.print()` o `jsPDF`.
2. Revisa estilos `@media print` y clases solo de impresion.
3. Verifica nombres de archivo, URL final y descarga.
4. Comprueba salto de pagina, margenes, imagenes y fuentes.
5. Valida tanto vista pantalla como salida impresa.

Riesgos comunes:

- Cambios de CSS que solo se ven al imprimir.
- Contenido cortado por alto fijo o por `overflow`.
- URLs de PDF que cambian segun ambiente.

## 4. Validacion

Objetivo: asegurar que el cambio no se caiga con datos vacios, tipos raros o ambientes distintos.

Pasos sugeridos:

1. Valida entradas antes de usarlas.
2. Revisa `null`, `undefined`, string vacio y arrays vacios.
3. Confirma que la logica funcione con ambientes `dev`, `qa` y `prod` si usa URLs o variables.
4. Busca regresiones con el flujo principal y al menos un caso borde.
5. Si el cambio depende de API, prueba la forma real de respuesta del backend.

Mini patron:

- Si un dato puede venir incompleto, trata de normalizarlo en un solo helper y reutilizarlo.
