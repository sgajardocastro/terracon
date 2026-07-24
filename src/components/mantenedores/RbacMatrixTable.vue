<template>
  <div class="matrix-container">
    <div class="matrix-wrap">
      <table class="matrix-table">
        <thead>
          <tr>
            <th class="sticky-col sticky-head col-mod">
              MÓDULOS (FILAS)
            </th>

            <th
              v-for="fn in functionsList"
              :key="fn.code"
              class="col-fn"
            >
              <div class="fn-title">
                {{ fn.name }}
              </div>
              <div class="fn-code">
                {{ fn.code }}
              </div>
            </th>
          </tr>
        </thead>

        <tbody>
          <tr
            v-for="mod in modulesList"
            :key="mod.code"
          >
            <td class="sticky-col col-mod">
              <div class="mod-cell">
                <div class="mod-icon" />
                <div>
                  <div class="font-weight-bold">
                    {{ mod.name }}
                  </div>
                  <div class="text-caption text-medium-emphasis">
                    {{ mod.code }}
                  </div>
                </div>
              </div>
            </td>

            <td
              v-for="fn in functionsList"
              :key="fn.code"
              class="chk-cell col-fn"
            >
              <div class="chk-inner">
                <v-checkbox-btn
                  v-if="isAllowed(mod.id_module, fn.code)"
                  :model-value="hasPermission(mod.code, fn.code)"
                  @update:model-value="togglePermission(mod.code, fn.code)"
                />
                <span
                  v-else
                  class="text-disabled"
                >-</span>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  // roles actuales del usuario en CÓDIGO (ej: ["QLTY_PROG","GRAL_ADMIN"])
  modelValue: { type: Array, default: () => [] },

  // catálogo completo de roles desde /obtenerRoles
  rolesCatalog: { type: Array, default: () => [] },

  // catálogo de permisos dinámico desde /obtenerPermisos
  permissions: { type: Array, default: () => [] },
})

const emit = defineEmits(['update:modelValue'])

const MODULE_NAME_BY_CODE = {
  QLTY: 'Calidad',
  MEAM: 'Medio Ambiente',
  SECU: 'Seguridad y Salud',
  AVAN: 'Avance de Obra',
  GRAL: 'General',
}

const FN_NAME_BY_CODE = {
  PROG: 'Programar',
  EJEC: 'Ejecutar',
  VERIF: 'Verificar',
  APRB: 'Aprobar',
  REV: 'Revisar',
  GCIA: 'Gerencia',
  ADMIN: 'Admin',
}

const FN_ORDER = ['PROG', 'EJEC', 'VERIF', 'APRB', 'REV', 'GCIA', 'ADMIN']

function inferModuleCodeFromText(text) {
  const s = String(text || '').toUpperCase()
  const m = s.match(/M[ÓO]DULO\s+([A-Z0-9_]+)/i)
  return m?.[1] ? String(m[1]).toUpperCase() : ''
}

const moduleCodeById = computed(() => {
  const map = new Map()
  for (const p of props.permissions || []) {
    const idModule = Number(p?.id_module)
    if (!Number.isFinite(idModule) || idModule <= 0 || map.has(idModule)) continue
    const code = inferModuleCodeFromText(p?.description)
    if (code) map.set(idModule, code)
  }
  return map
})

const allowedPairs = computed(() => {
  const set = new Set()
  for (const p of props.permissions || []) {
    const idModule = Number(p?.id_module)
    const modCode = moduleCodeById.value.get(idModule)
    const fnCode = String(p?.code_perm || '').trim().toUpperCase()
    if (!modCode || !fnCode) continue
    set.add(`${modCode}_${fnCode}`)
  }
  return set
})

const modulesList = computed(() => {
  const uniques = new Map()
  for (const p of props.permissions || []) {
    const idModule = Number(p?.id_module)
    const code = moduleCodeById.value.get(idModule)
    if (!Number.isFinite(idModule) || !code || uniques.has(idModule)) continue
    uniques.set(idModule, {
      id_module: idModule,
      code,
      name: MODULE_NAME_BY_CODE[code] || code,
    })
  }
  return [...uniques.values()].sort((a, b) => String(a.code).localeCompare(String(b.code), 'es', { sensitivity: 'base' }))
})

const functionsList = computed(() => {
  const set = new Set()
  for (const p of props.permissions || []) {
    const fnCode = String(p?.code_perm || '').trim().toUpperCase()
    if (fnCode) set.add(fnCode)
  }
  return [...set]
    .sort((a, b) => {
      const ia = FN_ORDER.indexOf(a)
      const ib = FN_ORDER.indexOf(b)
      if (ia === -1 && ib === -1) return a.localeCompare(b, 'es', { sensitivity: 'base' })
      if (ia === -1) return 1
      if (ib === -1) return -1
      return ia - ib
    })
    .map(code => ({ code, name: FN_NAME_BY_CODE[code] || code }))
})

function makeCode(modCode, fnCode) {
  return `${String(modCode).trim().toUpperCase()}_${String(fnCode).trim().toUpperCase()}`
}

function hasPermission(modCode, fnCode) {
  return props.modelValue.includes(makeCode(modCode, fnCode))
}

function isAllowed(idModule, fnCode) {
  const modCode = moduleCodeById.value.get(Number(idModule))
  if (!modCode) return false
  return allowedPairs.value.has(makeCode(modCode, fnCode))
}

function togglePermission(modCode, fnCode) {
  const code = makeCode(modCode, fnCode)
  if (!allowedPairs.value.has(code)) return
  
  const next = [...props.modelValue]
  const idx = next.indexOf(code)
  if (idx !== -1) next.splice(idx, 1)
  else next.push(code)
  
  emit('update:modelValue', next)
}
</script>

<style scoped>
.matrix-container {
  width: 100%;
}

.matrix-wrap {
  border: 1px solid rgba(0,0,0,.12);
  border-radius: 8px;
  overflow: auto;
  background: #fff;
}

.matrix-table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  table-layout: fixed;
}

.matrix-table thead th {
  background: #fafafa;
  position: sticky;
  top: 0;
  z-index: 3;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: .4px;
  color: rgba(0,0,0,.65);
}

.matrix-table th,
.matrix-table td {
  padding: 4px 10px;
  border-bottom: 1px solid rgba(0,0,0,.06);
  vertical-align: middle;
}

.sticky-col {
  position: sticky;
  left: 0;
  z-index: 4;
  background: #fff;
  border-right: 1px solid rgba(0,0,0,.08);
}

.sticky-head {
  z-index: 5;
  background: #fafafa;
}

.col-mod {
  width: 200px;
  min-width: 200px;
}

.col-fn {
  width: 90px;
  min-width: 90px;
  text-align: center;
}

.mod-cell {
  display: flex;
  align-items: center;
  gap: 8px;
}

.mod-icon {
  width: 24px;
  height: 20px;
  border-radius: 4px;
  background: rgba(25,118,210,.1);
}

.chk-inner {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 24px;
}

:deep(.v-selection-control) {
  display: flex;
  align-items: center;
  justify-content: center;
}

.fn-title {
  line-height: 1.1;
  font-size: 10px;
}

.fn-code {
  margin-top: 2px;
  display: inline-flex;
  padding: 1px 6px;
  border-radius: 4px;
  background: rgba(0,0,0,.06);
  font-size: 9px;
  font-weight: 700;
}

.matrix-table tbody tr:hover td {
  background: rgba(25,118,210,.02);
}
</style>
