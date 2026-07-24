import fs from 'node:fs';
import path from 'node:path';
import axios from 'axios';

function readDotEnv(filePath) {
  const out = {};
  if (!fs.existsSync(filePath)) return out;
  const raw = fs.readFileSync(filePath, 'utf8');
  for (const line of raw.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const idx = trimmed.indexOf('=');
    if (idx === -1) continue;
    const key = trimmed.slice(0, idx).trim();
    const val = trimmed.slice(idx + 1).trim().replace(/^['"]|['"]$/g, '');
    out[key] = val;
  }
  return out;
}

const results = [];
function ok(step, details = {}) {
  results.push({ step, ok: true, ...details });
}
function fail(step, err, details = {}) {
  const msg = err?.response?.data?.error || err?.response?.data?.message || err?.message || String(err);
  results.push({ step, ok: false, error: msg, ...details });
}

async function main() {
  const cwd = process.cwd();
  const env = readDotEnv(path.join(cwd, '.env'));
  const baseURL = process.env.API_BASE_URL || process.env.VITE_API_BASE_URL || env.VITE_API_BASE_URL;

  if (!baseURL) {
    console.error('No se encontró la URL base de la API.');
    process.exit(1);
  }

  console.log(`Ejecutando SPEC-DRIVEN smoke test contra API: ${baseURL}\n`);
  const api = axios.create({ baseURL, timeout: 30000 });

  let testProjectId = null;

  try {
    // ----------------------------------------------------
    // 1. Obtener proyectos y verificar filtrado de Sonacol
    // ----------------------------------------------------
    try {
      const { data } = await api.get('/servicio/leanglobal/obtenerProyectos');
      const sonacolProjects = data.filter(p => Number(p.id_empresa_cliente) === 1);
      ok('Matriz: Obtener proyectos de Sonacol', { total: data.length, sonacolCount: sonacolProjects.length });
    } catch (err) {
      fail('Matriz: Obtener proyectos de Sonacol', err);
    }

    // ----------------------------------------------------
    // 2. Crear proyecto en estado borrador / stage
    // ----------------------------------------------------
    const tempCode = `TEST-SPEC-${Math.floor(Math.random() * 10000)}`;
    const newProjectPayload = {
      nombre_proyecto: `Proyecto Test Spec-Driven`,
      codi_proyecto: tempCode,
      centro_costo: 'CC-TEST',
      id_empresa_cliente: 1, // Sonacol
      id_proyecto_tipo: 1,
      id_proyecto_estado: 2, // Planificación
      json_field: {
        setup_status: 'in_progress',
        stage_ok: {
          general: false,
          roster: false,
          teams: false,
          gantt: false,
          calidad: false,
          medioAmbiente: false,
          seguridad: false
        },
        stage_drafts: {
          general: { nombre_proyecto: 'Proyecto Test Spec-Driven', codi_proyecto: tempCode },
          roster: [
            { rut: '99.999.999-9', nombre: 'Juan Perez Spec', correo: 'juan.perez.spec@example.com', rolesIds: [14] }
          ]
        }
      }
    };

    try {
      const { data } = await api.post('/proyectos', newProjectPayload);
      testProjectId = data?.proyecto?.id_proyecto || data?.proyecto?.id;
      if (!testProjectId) throw new Error('No se recibió el ID del proyecto creado.');
      ok('Wizard: Crear proyecto en borrador', { id_proyecto: testProjectId });
    } catch (err) {
      fail('Wizard: Crear proyecto en borrador', err);
    }

    // ----------------------------------------------------
    // 3. Modificar datos de Staging en json_field
    // ----------------------------------------------------
    if (testProjectId) {
      try {
        const updatePayload = {
          ...newProjectPayload,
          json_field: {
            setup_status: 'in_progress',
            stage_ok: {
              general: true, // Datos generales marcados como OK
              roster: false,
              teams: false,
              gantt: false,
              calidad: false,
              medioAmbiente: false,
              seguridad: false
            },
            stage_drafts: {
              general: { nombre_proyecto: 'Proyecto Test Spec-Driven Modificado', codi_proyecto: tempCode },
              roster: [
                { rut: '99.999.999-9', nombre: 'Juan Perez Spec', correo: 'juan.perez.spec@example.com', rolesIds: [14] }
              ],
              gantt: {
                tasks: [
                  { edt: '1', nombre: 'Tarea Test', unidad: 'm3', cantidad: 10, recurso: 'Cuadrilla Test' }
                ],
                templates: [87]
              }
            }
          }
        };

        const { data } = await api.put(`/proyectos/${testProjectId}`, updatePayload);
        
        // Validar que el json_field se guardó con la estructura correcta
        const getProj = await api.get('/servicio/leanglobal/obtenerProyectos');
        const updatedProj = getProj.data.find(p => Number(p.id_proyecto) === Number(testProjectId));
        
        // Dependiendo de cómo devuelva la BD, el json_field puede venir parseado o string
        let jsonField = updatedProj?.json_field;
        if (typeof jsonField === 'string') jsonField = JSON.parse(jsonField);

        if (jsonField?.stage_ok?.general === true && jsonField?.stage_drafts?.gantt?.templates?.includes(87)) {
          ok('Staging: Guardar borrador y estado de etapas en json_field (con plantillas de avance)', { jsonField });
        } else {
          throw new Error('La estructura de json_field no tiene la forma o datos esperados.');
        }
      } catch (err) {
        fail('Staging: Guardar borrador y estado de etapas en json_field (con plantillas de avance)', err);
      }
    }

  } catch (err) {
    console.error('Error general del runner:', err);
  } finally {
    // Imprimir resumen en formato tabla
    console.log('\n======================================');
    console.log('RESUMEN DE PRUEBAS SPEC-DRIVEN');
    console.log('======================================');
    let hasFailed = false;
    results.forEach(r => {
      const mark = r.ok ? '✅ PASS' : '❌ FAIL';
      if (!r.ok) hasFailed = true;
      console.log(`[${mark}] ${r.step}`);
      if (r.error) console.log(`   └─ Error: ${r.error}`);
      if (r.warning) console.log(`   └─ Advertencia: ${r.warning}`);
    });
    console.log('======================================\n');
    process.exit(hasFailed ? 1 : 0);
  }
}

main();
