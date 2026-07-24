# LG - Pruebas funcionales end-to-end (QA)

Objetivo: validar los flujos de negocio mas importantes en LG web despues de cambios.

## Precondiciones

- Ambiente activo: QA (`npm run env:qa` si aplica).
- API accesible por `VITE_API_BASE_URL` en `.env`.
- Usuario de prueba con permisos para Conexión, Documentos, Encuestas y Mantenedores.
- Datos base disponibles (empresa, proyecto, template, usuarios).

## Ejecucion automatica (smoke API)

Comando:

```bash
npm run test:lg-functional-smoke
```

Este smoke prueba:

- Lectura de maestros (usuarios, empresas, proyectos, templates).
- Consulta de surveys (`procesosSurveyV3`).
- Crear survey.
- Asignar survey.
- Planificar survey.
- Crear registro de documento (`tfmg_archivo`).
- Registrar carga de planilla (`tfmg_cnx_load`).
- Cleanup de entidades creadas.

## Ejecucion manual en LG web (UI)

## 1) Login y carga inicial

- Ingresar a LG con usuario QA.
- Verificar que carga dashboard sin errores de consola.
- Confirmar que menu lateral muestra modulos esperados para el rol.

## 2) Conexión - Asignaciones

- Ir a `Conexión` > tab `Planificación Conexión`.
- Crear una asignación nueva con datos validos.
- Validar que aparece en la tabla.
- Editar estado o asignación y guardar.
- Validar persistencia al recargar pagina.

## 3) Conexión - Carga de planillas

- En `Conexión`, usar la accion de carga de planilla (si aplica por rol).
- Subir archivo valido.
- Verificar resultado de carga (cargados/rechazados).
- Repetir con archivo invalido y validar manejo de error.

## 4) Documentos

- Ir a `Documentos`.
- Crear documento con archivo adjunto y metadatos.
- Confirmar visualizacion en listado.
- Descargar/abrir el documento creado.
- Editar metadatos y validar cambios.

## 5) Flujo de survey

- Crear survey desde template.
- Completar campos minimos requeridos.
- Asignar usuario(s) y guardar.
- Cambiar estado (por ejemplo: Pre Creado -> Creado/En Proceso).
- Verificar en consulta/listado que el estado y asignaciones quedaron persistidos.

## 6) Exportaciones (si aplica)

- Ejecutar export en modulo Conexión (Excel).
- Confirmar que archivo se descarga.
- Revisar que columnas clave traen datos esperados.

## 7) Regresion visual rapida

- Revisar `Dashboard`, `Conexión`, `Documentos`, `Consulta` en desktop.
- Revisar mismas pantallas en ancho movil.
- Confirmar que no hay cortes de layout ni botones inutilizables.

## Criterio de aprobado

- Sin errores bloqueantes en consola/back.
- Flujos de crear/asignar/cargar/documentar funcionan end-to-end.
- Datos persisten despues de recargar.
- Casos invalidos muestran mensaje entendible sin romper la UI.

## Evidencia sugerida

- Capturas por cada flujo (antes/despues).
- Salida JSON del smoke (`test:lg-functional-smoke`).
- Lista de incidencias con modulo, paso y mensaje de error.
