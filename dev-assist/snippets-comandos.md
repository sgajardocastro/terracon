# Snippets y comandos utiles

Comandos pensados para este repo en PowerShell.

## Arranque y verificaciones basicas

```powershell
npm run dev
npm run build
npm run lint
npm run test:reclamo-smoke
```

## Cambio de ambiente

```powershell
npm run env:dev
npm run env:qa
npm run env:prod
```

Notas:

- `env:*` usa `../scripts/switch-env.mjs`.
- Revisa el `.env` despues de cambiar ambiente si el flujo depende de base URL.

## Buscar rapido en el repo

```powershell
rg -n "window.print|jsPDF|generate-pdf-html|upload-pdf|pdf" src
rg -n "TODO|FIXME|eslint-disable" src
rg -n "api\\.post|api\\.get|fetch\\(" src
rg -n "useApi|store|pinia" src
```

## Rutas utiles para print / PDF

```powershell
Get-ChildItem src\pages,src\components -Recurse -Filter *.vue | Select-Object FullName
Get-ChildItem src\services -Recurse -File
Get-ChildItem scripts -Recurse -File
```

## Inspeccion rapida de package.json

```powershell
Get-Content package.json
```

## Casos tipicos

### Bugfix

```powershell
rg -n "nombre_del_error_o_campo" src
```

### Feature

```powershell
rg -n "nombre_de_pagina_o_componente" src\pages src\components
```

### Print / PDF

```powershell
rg -n "@media print|window.print|jsPDF|html2canvas" src
```

### Validacion de ambiente

```powershell
Get-Content .env
```

## Flujo corto recomendado

```powershell
npm run lint
npm run build
```

Si el cambio toca reclamos:

```powershell
npm run test:reclamo-smoke
```
