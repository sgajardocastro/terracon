import registroCamarasMs from '@/data/registroCamarasMs.json'

const EMPTY_IDS = []

export const normalizeCamaraFilterKey = (value) =>
  String(value ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toUpperCase()

const normalizePkText = (value) => normalizeCamaraFilterKey(value).replace(/\s+/g, '')

const getRecordByIdMap = () => {
  if (!getRecordByIdMap.cache) {
    getRecordByIdMap.cache = new Map(
      registroCamarasMs.records.map((record) => [record.id, record])
    )
  }
  return getRecordByIdMap.cache
}

const intersectIds = (left, right) => {
  if (!Array.isArray(left)) return right
  if (!Array.isArray(right)) return left
  const rightSet = new Set(right)
  return left.filter((id) => rightSet.has(id))
}

export const getRegistroCamarasMsOptions = () => registroCamarasMs.options

export const getRegistroCamarasMsRecords = () => registroCamarasMs.records

export const filterRegistroCamarasMs = ({
  oleoducto = '',
  linea = '',
  pk = '',
  search = '',
  pkStart = null,
  pkEnd = null,
} = {}) => {
  let ids = null
  const indexes = registroCamarasMs.indexes
  const oleoductoKey = normalizeCamaraFilterKey(oleoducto)
  const lineaKey = normalizeCamaraFilterKey(linea)
  const pkKey = normalizePkText(pk)

  if (oleoductoKey && lineaKey) {
    ids = intersectIds(ids, indexes.byOleoductoLinea[`${oleoductoKey}::${lineaKey}`] || EMPTY_IDS)
  } else if (oleoductoKey) {
    ids = intersectIds(ids, indexes.byOleoducto[oleoductoKey] || EMPTY_IDS)
  } else if (lineaKey) {
    ids = intersectIds(ids, indexes.byLinea[lineaKey] || EMPTY_IDS)
  }

  if (pkKey) {
    ids = intersectIds(ids, indexes.byPk[pkKey] || EMPTY_IDS)
  }

  const byId = getRecordByIdMap()
  let records = (ids || registroCamarasMs.records.map((record) => record.id))
    .map((id) => byId.get(id))
    .filter(Boolean)

  const start = Number(pkStart)
  const end = Number(pkEnd)
  if (Number.isFinite(start) || Number.isFinite(end)) {
    const min = Number.isFinite(start) ? start : -Infinity
    const max = Number.isFinite(end) ? end : Infinity
    records = records.filter((record) =>
      Number.isFinite(record.pkKm) && record.pkKm >= min && record.pkKm <= max
    )
  }

  const searchKey = normalizeCamaraFilterKey(search)
  if (searchKey) {
    records = records.filter((record) => record.keys.search.includes(searchKey))
  }

  return records
}

export const formatCamaraMsOption = (record) => {
  if (!record) return ''
  const left = [record.pk, record.nombreCamara].filter(Boolean).join(' - ')
  const right = [record.oleoducto, record.linea].filter(Boolean).join(' / ')
  return right ? `${left} (${right})` : left
}
