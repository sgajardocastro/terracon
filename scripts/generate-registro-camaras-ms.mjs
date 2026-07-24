import fs from 'node:fs'
import path from 'node:path'
import XLSX from 'xlsx'

const rootDir = process.cwd()
const sourceFile = path.join(rootDir, 'Registro de Cámaras -MS (1).xlsx')
const outputFile = path.join(rootDir, 'src', 'data', 'registroCamarasMs.json')

const normalizeText = (value) =>
  String(value ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()

const normalizeKey = (value) => normalizeText(value).toUpperCase()

const parsePk = (value) => {
  const text = String(value ?? '').trim()
  const match = text.match(/^(\d+)\s*\+\s*(\d+)$/)
  if (!match) return null
  const km = Number(match[1])
  const metersText = match[2].padEnd(3, '0').slice(0, 3)
  const meters = Number(metersText)
  if (!Number.isFinite(km) || !Number.isFinite(meters)) return null
  return km + meters / 1000
}

const addIndex = (target, key, id) => {
  const safeKey = key || '__VACIO__'
  if (!target[safeKey]) target[safeKey] = []
  target[safeKey].push(id)
}

const workbook = XLSX.readFile(sourceFile, { cellDates: true })
const sheetName = workbook.SheetNames[0]
const rows = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], {
  header: 1,
  defval: '',
  blankrows: false,
  raw: false,
})

const dataRows = rows.slice(2).filter((row) => row.some((cell) => String(cell ?? '').trim()))

const records = dataRows.map((row, index) => {
  const item = Number(String(row[0] ?? '').trim()) || index + 1
  const oleoducto = String(row[1] ?? '').trim()
  const nombreCamara = String(row[2] ?? '').trim()
  const linea = String(row[3] ?? '').trim()
  const pk = String(row[4] ?? '').trim()
  const pkKm = parsePk(pk)
  const id = `cam-${String(item).padStart(3, '0')}`

  return {
    id,
    item,
    oleoducto,
    linea,
    pk,
    pkKm,
    nombreCamara,
    keys: {
      oleoducto: normalizeKey(oleoducto),
      linea: normalizeKey(linea),
      pk: normalizeKey(pk),
      nombreCamara: normalizeKey(nombreCamara),
      search: normalizeKey([oleoducto, linea, pk, nombreCamara].filter(Boolean).join(' ')),
    },
  }
})

const indexes = {
  byOleoducto: {},
  byLinea: {},
  byPk: {},
  byOleoductoLinea: {},
}

for (const record of records) {
  addIndex(indexes.byOleoducto, record.keys.oleoducto, record.id)
  addIndex(indexes.byLinea, record.keys.linea, record.id)
  addIndex(indexes.byPk, record.keys.pk, record.id)
  addIndex(indexes.byOleoductoLinea, `${record.keys.oleoducto}::${record.keys.linea}`, record.id)
}

const uniqueSorted = (values) =>
  Array.from(new Set(values.filter(Boolean))).sort((a, b) =>
    String(a).localeCompare(String(b), 'es', { numeric: true })
  )

const payload = {
  meta: {
    source: path.basename(sourceFile),
    sheet: sheetName,
    total: records.length,
    columns: {
      item: 'Item',
      oleoducto: 'Oleoducto',
      nombreCamara: 'Nombre Cámara',
      linea: 'Línea',
      pk: 'PK',
      pkKm: 'PK en kilometros decimales',
    },
  },
  options: {
    oleoductos: uniqueSorted(records.map((record) => record.oleoducto)),
    lineas: uniqueSorted(records.map((record) => record.linea)),
    pk: uniqueSorted(records.map((record) => record.pk)),
  },
  records,
  indexes,
}

fs.writeFileSync(outputFile, `${JSON.stringify(payload, null, 2)}\n`, 'utf8')
console.log(`OK ${records.length} camaras -> ${path.relative(rootDir, outputFile)}`)
