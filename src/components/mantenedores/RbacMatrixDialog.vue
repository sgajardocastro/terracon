<template>
  <v-dialog
    :model-value="show"
    max-width="1100"
    scrollable
    @update:model-value="val => emit('update:show', val)"
  >
    <v-card rounded="lg">
      <!-- HEADER -->
      <v-toolbar
        density="comfortable"
        color="white"
        class="border-b"
      >
        <v-toolbar-title class="d-flex flex-column">
          <span class="text-h6 font-weight-bold">Configuración de Acceso</span>
          <span class="text-caption text-medium-emphasis">
            Editando permisos para
            <span class="text-primary font-weight-medium">{{ userLabel }}</span>
          </span>
        </v-toolbar-title>

        <v-spacer />

        <v-btn
          icon
          variant="text"
          aria-label="Cerrar"
          @click="cerrar"
        >
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-toolbar>

      <!-- BODY -->
      <v-card-text class="pt-4">
        <v-alert
          type="info"
          variant="tonal"
          density="compact"
          class="mb-4"
          icon="mdi-information-outline"
        >
          <span class="font-weight-bold">Sistema RBAC:</span>
          Seleccione la intersección entre Módulo y Función. Esto generará automáticamente el rol
          (ej. <code>QLTY_PROG</code>) en la base de datos.
        </v-alert>

        <!-- Matriz -->
        <v-card
          variant="outlined"
          class="bg-white"
        >
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
        </v-card>

        <v-card
          v-if="cnxModulesList.length && cnxFunctionsList.length"
          variant="outlined"
          class="bg-white mt-4"
        >
          <v-alert
            type="info"
            variant="tonal"
            density="compact"
            class="ma-3 mb-0"
            icon="mdi-connection"
          >
            <span class="font-weight-bold">Roles CNX:</span>
            seleccione la intersección para asignar/desasignar códigos
            <code>CNX*</code>.
          </v-alert>

          <div class="matrix-wrap mt-3">
            <table class="matrix-table">
              <thead>
                <tr>
                  <th class="sticky-col sticky-head col-mod">
                    MÓDULOS CNX (FILAS)
                  </th>

                  <th
                    v-for="fn in cnxFunctionsList"
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
                  v-for="mod in cnxModulesList"
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
                    v-for="fn in cnxFunctionsList"
                    :key="fn.code"
                    class="chk-cell col-fn"
                  >
                    <div class="chk-inner">
                      <v-checkbox-btn
                        v-if="isCnxAllowed(mod.code, fn.code)"
                        :model-value="hasCnxPermission(mod.code, fn.code)"
                        @update:model-value="toggleCnxPermission(mod.code, fn.code)"
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
        </v-card>
      </v-card-text>

      <v-divider />

      <!-- FOOTER -->
      <v-card-actions class="px-4 py-3">
        <div class="text-caption text-medium-emphasis">
          Roles seleccionados:
          <span class="text-primary font-weight-bold">{{ tempCount }}</span>
        </div>

        <v-spacer />

        <v-btn
          variant="outlined"
          @click="cerrar"
        >
          Cancelar
        </v-btn>

        <v-btn
          color="primary"
          variant="flat"
          @click="guardar"
        >
          <v-icon start>
            mdi-check
          </v-icon>
          Guardar Cambios
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { computed, ref, watch } from 'vue'

const props = defineProps({
  show: { type: Boolean, default: false },

  // usuario actual
  usuario: { type: Object, default: null },

  // roles actuales del usuario en CÓDIGO (ej: ["QLTY_PROG","GRAL_ADMIN"])
  // si tu padre tiene ids, conviértelos a codes antes de pasarlos
  rolesCodes: { type: Array, default: () => [] },

  // ✅ catálogo completo de roles desde /obtenerRoles
  // [{id_rol, name_rol, description}]
  rolesCatalog: { type: Array, default: () => [] },

  // catálogo de permisos dinámico desde /obtenerPermisos
  permissions: { type: Array, default: () => [] },
})

const emit = defineEmits(['update:show', 'guardar'])

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
const CNX_FN_ORDER = ['SUP', 'PLAN', 'ENAR', 'TEC', 'TECNICO', 'REV', 'APRB', 'EJEC', 'PROG', 'GTE', 'ADMIN']

function getRoleCode(r) {
  const raw = r?.codi_rol ?? r?.codigo ?? r?.code ?? r?.name_rol ?? ''
  return String(raw).trim().toUpperCase()
}

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

function parseCnxRoleCode(code) {
  const raw = String(code || '').trim().toUpperCase()
  if (!raw.startsWith('CNX')) return null

  const normalized = raw.replace(/_/g, '-')
  const parts = normalized.split('-').filter(Boolean)
  if (!parts.length || parts[0] !== 'CNX') return null
  if (parts.length === 1) return { moduleCode: 'GENERAL', fnCode: 'BASE' }
  if (parts.length === 2) return { moduleCode: parts[1], fnCode: 'BASE' }

  return {
    moduleCode: parts.slice(1, -1).join('-'),
    fnCode: parts[parts.length - 1],
  }
}

const cnxRoleEntries = computed(() => {
  const rows = []
  for (const role of props.rolesCatalog || []) {
    const roleCode = getRoleCode(role)
    const parsed = parseCnxRoleCode(roleCode)
    if (!parsed) continue
    rows.push({
      roleCode,
      moduleCode: parsed.moduleCode,
      fnCode: parsed.fnCode,
    })
  }
  return rows
})

const cnxRoleCodesSet = computed(() => new Set(cnxRoleEntries.value.map(r => r.roleCode)))

const cnxFunctionsList = computed(() => {
  const set = new Set(cnxRoleEntries.value.map(r => r.fnCode))
  return [...set]
    .sort((a, b) => {
      const ia = CNX_FN_ORDER.indexOf(a)
      const ib = CNX_FN_ORDER.indexOf(b)
      if (ia === -1 && ib === -1) return a.localeCompare(b, 'es', { sensitivity: 'base' })
      if (ia === -1) return 1
      if (ib === -1) return -1
      return ia - ib
    })
    .map(code => ({ code, name: code }))
})

const cnxModulesList = computed(() => {
  const set = new Set(cnxRoleEntries.value.map(r => r.moduleCode))
  return [...set]
    .sort((a, b) => a.localeCompare(b, 'es', { sensitivity: 'base' }))
    .map(code => ({ code, name: code }))
})

function makeCnxPairKey(moduleCode, fnCode) {
  return `${String(moduleCode || '').trim().toUpperCase()}__${String(fnCode || '').trim().toUpperCase()}`
}

const cnxRoleCodeByPair = computed(() => {
  const map = new Map()
  for (const entry of cnxRoleEntries.value) {
    map.set(makeCnxPairKey(entry.moduleCode, entry.fnCode), entry.roleCode)
  }
  return map
})

/* ===== state ===== */
const tempRoles = ref(new Set())

watch(
  () => [props.show, props.rolesCodes, allowedPairs.value.size, cnxRoleCodesSet.value.size],
  () => {
    if (!props.show) return
    const base = Array.isArray(props.rolesCodes) ? props.rolesCodes : []
    tempRoles.value = new Set(
      base
        .map(x => String(x).trim().toUpperCase())
        .filter(code => allowedPairs.value.has(code) || cnxRoleCodesSet.value.has(code))
    )
  },
  { immediate: true }
)

/* ===== maps ===== */
const roleIdByCode = computed(() => {
  const map = new Map()
  for (const r of (props.rolesCatalog || [])) {
    const code = getRoleCode(r)
    const id = Number(r?.id_rol)
    if (code) map.set(code, id)
  }
  return map
})

const userLabel = computed(() => {
  const u = props.usuario || {}
  const full = [u.name_frst, u.name_sec, u.apellido_pat, u.apellido_mat].filter(Boolean).join(' ').trim()
  return u.nombre_user || full || u.email || (u.id_user != null ? `#${u.id_user}` : 'Usuario')
})

const tempCount = computed(() => tempRoles.value.size)

/* ===== helpers ===== */
function makeCode(modCode, fnCode) {
  return `${String(modCode).trim().toUpperCase()}_${String(fnCode).trim().toUpperCase()}`
}

function hasPermission(modCode, fnCode) {
  return tempRoles.value.has(makeCode(modCode, fnCode))
}

function isAllowed(idModule, fnCode) {
  const modCode = moduleCodeById.value.get(Number(idModule))
  if (!modCode) return false
  return allowedPairs.value.has(makeCode(modCode, fnCode))
}

function togglePermission(modCode, fnCode) {
  const code = makeCode(modCode, fnCode)
  if (!allowedPairs.value.has(code)) return
  const next = new Set(tempRoles.value)
  if (next.has(code)) next.delete(code)
  else next.add(code)
  tempRoles.value = next
}

function getCnxRoleCode(moduleCode, fnCode) {
  return cnxRoleCodeByPair.value.get(makeCnxPairKey(moduleCode, fnCode)) || ''
}

function isCnxAllowed(moduleCode, fnCode) {
  return !!getCnxRoleCode(moduleCode, fnCode)
}

function hasCnxPermission(moduleCode, fnCode) {
  const code = getCnxRoleCode(moduleCode, fnCode)
  if (!code) return false
  return tempRoles.value.has(code)
}

function toggleCnxPermission(moduleCode, fnCode) {
  const code = getCnxRoleCode(moduleCode, fnCode)
  if (!code) return
  const next = new Set(tempRoles.value)
  if (next.has(code)) next.delete(code)
  else next.add(code)
  tempRoles.value = next
}

function cerrar() {
  emit('update:show', false)
}

function guardar() {
  const codes = Array.from(tempRoles.value).sort()

  // ✅ convertir codes -> ids usando name_rol del catálogo
  const roleIds = codes
    .map(c => roleIdByCode.value.get(String(c).toUpperCase()))
    .filter(v => Number.isFinite(v))
    .map(Number)

  emit('guardar', {
    id_user: props.usuario?.id_user,
    rolesCodes: codes,  // útil para UI/debug
    rolesIds: roleIds,  // 👈 esto es lo que necesita tsec_user_roles
  })

  cerrar()
}
</script>

<style scoped>
.matrix-wrap {
  border: 1px solid rgba(0,0,0,.12);
  border-radius: 10px;
  overflow: auto;
  background: #fff;
}

/* tabla */
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
  font-size: 12px;
  font-weight: 700;
  letter-spacing: .4px;
  color: rgba(0,0,0,.65);
}

.matrix-table th,
.matrix-table td {
  padding: 10px 12px;
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
  width: 260px;
  min-width: 260px;
}

.col-fn {
  width: 110px;
  min-width: 110px;
  text-align: center;
}

.mod-cell {
  display: flex;
  align-items: center;
  gap: 12px;
}

.mod-icon {
  width: 40px;
  height: 32px;
  border-radius: 8px;
  background: rgba(25,118,210,.12);
}

.chk-cell {
  padding: 8px 0;
}

.chk-inner {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 40px; /* 👈 más alto para centrar */
}

/* centra el checkbox real de vuetify (evita que se vaya arriba) */
:deep(.v-selection-control) {
  display: flex;
  align-items: center;
  justify-content: center;
}
:deep(.v-selection-control__wrapper) {
  align-items: center;
  justify-content: center;
}

.fn-title {
  line-height: 1.1;
}

.fn-code {
  margin-top: 6px;
  display: inline-flex;
  padding: 2px 8px;
  border-radius: 6px;
  background: rgba(0,0,0,.08);
  font-size: 11px;
  font-weight: 700;
  line-height: 1;
}

.matrix-table tbody tr:hover td {
  background: rgba(25,118,210,.03);
}
.matrix-table tbody tr:hover .sticky-col {
  background: rgba(25,118,210,.03);
}
</style>
