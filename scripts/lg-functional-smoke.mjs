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

function asNum(v) {
  const n = Number(v);
  return Number.isFinite(n) && n > 0 ? n : null;
}

function toJson(v, fallback = {}) {
  if (v == null) return fallback;
  if (typeof v === 'object') return v;
  if (typeof v === 'string') {
    try { return JSON.parse(v); } catch { return fallback; }
  }
  return fallback;
}

function nowDateOnly() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function plusDays(isoDate, days) {
  const d = new Date(`${isoDate}T00:00:00`);
  d.setDate(d.getDate() + days);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

const results = [];
function ok(step, details = {}) {
  results.push({ step, ok: true, ...details });
}
function warn(step, err, details = {}) {
  const msg = err?.response?.data?.error || err?.response?.data?.message || err?.message || String(err);
  results.push({ step, ok: true, warning: msg, ...details });
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
    throw new Error('No se encontro API base URL. Define API_BASE_URL o VITE_API_BASE_URL.');
  }

  const api = axios.create({ baseURL, timeout: 60000 });

  let createdSurveyId = null;
  let createdArchivoId = null;
  let createdLoadId = null;

  try {
    try {
      const { data } = await api.get('/health/db');
      ok('health.db', { message: data?.message || 'OK' });
    } catch (err) {
      warn('health.db', err);
    }

    const fechaDesde = process.env.SMOKE_FECHA_DESDE || nowDateOnly();
    const fechaHasta = process.env.SMOKE_FECHA_HASTA || plusDays(fechaDesde, 7);

    let users = [];
    let empresas = [];
    let proyectos = [];
    let templates = [];
    let archivos = [];
    let surveyRows = [];

    try {
      const { data } = await api.get('/servicio/leanglobal/obtenerUsuarios');
      users = Array.isArray(data) ? data : [];
      if (!users.length) throw new Error('Sin usuarios');
      ok('maestros.usuarios', { count: users.length });
    } catch (err) {
      fail('maestros.usuarios', err);
    }

    try {
      const { data } = await api.get('/servicio/leanglobal/obtenerEmpresas');
      empresas = Array.isArray(data) ? data : [];
      if (!empresas.length) throw new Error('Sin empresas');
      ok('maestros.empresas', { count: empresas.length });
    } catch (err) {
      fail('maestros.empresas', err);
    }

    const idEmpresa = asNum(process.env.SMOKE_EMPRESA_ID) || asNum(empresas[0]?.id_empresa);

    try {
      const { data } = await api.get(`/servicio/leanglobal/obtenerProyectos?id_empresa_cliente=${idEmpresa || ''}`);
      proyectos = Array.isArray(data) ? data : [];

      if (!proyectos.length) {
        const fb = await api.get('/servicio/leanglobal/obtenerProyectos');
        proyectos = Array.isArray(fb.data) ? fb.data : [];
      }

      if (!proyectos.length) throw new Error('Sin proyectos (ni filtrado ni global)');
      ok('maestros.proyectos', { count: proyectos.length, idEmpresa });
    } catch (err) {
      fail('maestros.proyectos', err, { idEmpresa });
    }

    try {
      const { data } = await api.get('/servicio/leanglobal/obtenerTemplates?id_tipo_srv=36');
      templates = Array.isArray(data) ? data : [];
      if (!templates.length) throw new Error('Sin templates para id_tipo_srv=36');
      ok('maestros.templates', { count: templates.length });
    } catch (err) {
      fail('maestros.templates', err);
    }

    try {
      const { data } = await api.get('/servicio/leanglobal/archivos');
      archivos = Array.isArray(data) ? data : [];
      if (!archivos.length) throw new Error('Sin archivos tfmg_file para vincular');
      ok('maestros.archivos', { count: archivos.length });
    } catch (err) {
      warn('maestros.archivos', err);
      try {
        const { data } = await api.get('/tfmg-archivos');
        const fromTfmg = Array.isArray(data?.data) ? data.data : [];
        if (fromTfmg.length) {
          archivos = fromTfmg;
          ok('maestros.archivos.tfmgFallback', { count: fromTfmg.length });
        }
      } catch (err2) {
        warn('maestros.archivos.tfmgFallback', err2);
      }
    }

    try {
      const { data } = await api.get(`/servicio/leanglobal/procesosSurveyV3?fecha_desde=${fechaDesde}&fecha_hasta=${fechaHasta}`);
      surveyRows = Array.isArray(data?.datos) ? data.datos : [];
      ok('consulta.procesosSurveyV3', { count: surveyRows.length, fechaDesde, fechaHasta });
    } catch (err) {
      fail('consulta.procesosSurveyV3', err, { fechaDesde, fechaHasta });
    }

    const idUser = asNum(process.env.SMOKE_USER_ID) || asNum(users[0]?.id_user);
    const idProyecto = asNum(process.env.SMOKE_PROYECTO_ID) || asNum(proyectos[0]?.id_proyecto);
    const template = templates.find((t) => asNum(t?.id_template) === 153) || templates[0] || null;
    const idTemplate = asNum(template?.id_template);
    const idTipoSrv = asNum(template?.id_tipo_srv) || 36;

    if (!idUser || !idEmpresa || !idProyecto || !idTemplate) {
      throw new Error(`Contexto insuficiente para crear survey (idUser=${idUser}, idEmpresa=${idEmpresa}, idProyecto=${idProyecto}, idTemplate=${idTemplate})`);
    }

    const headerSeed = toJson(template?.header_seed, {});
    const bodySeed = toJson(template?.body_seed, { segmentos: [] });
    const approvalSeed = toJson(template?.approval_seed, {});

    const createPayload = {
      id_tipo_srv: idTipoSrv,
      id_template: idTemplate,
      id_user: idUser,
      id_user_creacion: idUser,
      id_empresa_cliente: idEmpresa,
      estado_srv: 'Pre Creado',
      header_seed: JSON.stringify(headerSeed),
      body_seed: JSON.stringify(bodySeed),
      approval_seed: JSON.stringify(approvalSeed),
      header_exec: JSON.stringify(headerSeed),
      body_exec: JSON.stringify(bodySeed),
      approval_exec: JSON.stringify(approvalSeed),
      fecha_plan_ini: fechaDesde,
      fecha_plan_fin: fechaHasta,
      id_proyecto: idProyecto,
      id_flow_tmpl: asNum(template?.id_flow_tmpl) || null,
    };

    try {
      const { data } = await api.post('/survey/', createPayload);
      createdSurveyId = asNum(data?.idSurvey || data?.id_survey);
      if (!createdSurveyId) throw new Error('No devolvio idSurvey');
      ok('survey.crear', { idSurvey: createdSurveyId });
    } catch (err) {
      fail('survey.crear', err);
    }

    if (createdSurveyId) {
      try {
        const payload = {
          id_survey: createdSurveyId,
          asignaciones: [{ tecnico_principal: idUser }]
        };
        await api.post('/survey/UpdSurveyAsignaciones', payload);
        ok('survey.asignar', { idSurvey: createdSurveyId, idUser });
      } catch (err) {
        fail('survey.asignar', err, { idSurvey: createdSurveyId });
      }

      try {
        await api.put(`/survey/UpdPlan/${createdSurveyId}`, {
          id_user: idUser,
          fecha_plan_ini: fechaDesde,
          fecha_plan_fin: fechaHasta,
        });
        ok('survey.planificar', { idSurvey: createdSurveyId, fechaDesde, fechaHasta });
      } catch (err) {
        fail('survey.planificar', err, { idSurvey: createdSurveyId });
      }
    }

    const idDoc =
      asNum(process.env.SMOKE_DOC_ID) ||
      asNum(archivos[0]?.id_doc) ||
      asNum(surveyRows.find((r) => asNum(r?.id_doc))?.id_doc);

    if (idDoc && idEmpresa && idProyecto && idUser) {
      try {
        const { data } = await api.post('/tfmg-archivos', {
          id_empresa: idEmpresa,
          id_empresa_cliente: idEmpresa,
          id_proyecto: idProyecto,
          tipo_documento: 'SMOKE_TEST',
          id_survey: createdSurveyId,
          id_doc: idDoc,
          observacion: `Smoke funcional ${new Date().toISOString()}`,
          version: '1.0',
          id_usuario_creacion: idUser,
          json_data: { smoke: true }
        });

        createdArchivoId = asNum(data?.data?.id_archivo);
        ok('documento.crearRegistro', { idArchivo: createdArchivoId, idDoc, idSurvey: createdSurveyId });
      } catch (err) {
        fail('documento.crearRegistro', err, { idDoc, idSurvey: createdSurveyId });
      }

      try {
        const { data } = await api.post('/archivo/cnxload', {
          id_doc: idDoc,
          id_user: idUser,
          fecha_proyectada_ejecucion: fechaDesde,
          cant_total_excel: 10,
          cant_cargados: 9,
          cant_rechazados: 1,
          flag_recarga: false,
          estado_carga: 'SMOKE_TEST',
          observaciones: 'Smoke funcional carga planilla',
        });

        createdLoadId = asNum(data?.load?.id_load);
        ok('planilla.registrarCarga', { idLoad: createdLoadId, idDoc, idUser });
      } catch (err) {
        fail('planilla.registrarCarga', err, { idDoc, idUser });
      }
    } else {
      fail('documento_y_planilla.precondiciones', new Error('No hay idDoc/idEmpresa/idProyecto/idUser para ejecutar pruebas de documento y planilla'));
    }

  } finally {
    if (createdSurveyId) {
      try {
        await api.post('/survey/DelSurvey', { id_survey: createdSurveyId });
        ok('cleanup.survey', { idSurvey: createdSurveyId });
      } catch (err) {
        fail('cleanup.survey', err, { idSurvey: createdSurveyId });
      }
    }

    if (createdArchivoId) {
      try {
        await api.delete(`/tfmg-archivos/${createdArchivoId}`);
        ok('cleanup.documento', { idArchivo: createdArchivoId });
      } catch (err) {
        fail('cleanup.documento', err, { idArchivo: createdArchivoId });
      }
    }
  }

  const passed = results.filter((r) => r.ok).length;
  const failed = results.filter((r) => !r.ok).length;

  console.log(JSON.stringify({
    ok: failed === 0,
    baseURL,
    summary: { total: results.length, passed, failed },
    results,
  }, null, 2));

  if (failed > 0) process.exit(1);
}

main().catch((err) => {
  console.error(JSON.stringify({ ok: false, fatal: err.message }, null, 2));
  process.exit(1);
});
