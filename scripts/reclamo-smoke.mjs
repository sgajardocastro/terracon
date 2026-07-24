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
    const val = trimmed.slice(idx + 1).trim();
    out[key] = val;
  }
  return out;
}

function normalizeLabel(v) {
  return String(v || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9]+/g, ' ')
    .trim()
    .toLowerCase();
}

function upsertAttr(segmentos, labels, value) {
  if (!Array.isArray(segmentos) || value === undefined || value === null || value === '') return;
  const targets = (labels || []).map(normalizeLabel).filter(Boolean);

  for (const seg of segmentos) {
    if (!Array.isArray(seg?.attributes)) continue;
    for (const attr of seg.attributes) {
      if (targets.includes(normalizeLabel(attr?.label))) {
        attr.value = value;
        attr.answer = value;
        attr.default = value;
        return;
      }
    }
  }

  if (!segmentos.length) segmentos.push({ attributes: [] });
  if (!Array.isArray(segmentos[0].attributes)) segmentos[0].attributes = [];
  segmentos[0].attributes.push({
    label: labels[0],
    value,
    answer: value,
    default: value
  });
}

function asNum(v) {
  const n = Number(v);
  return Number.isFinite(n) && n > 0 ? n : null;
}

async function main() {
  const cwd = process.cwd();
  const envFromFile = readDotEnv(path.join(cwd, '.env'));
  const baseURL =
    process.env.API_BASE_URL ||
    process.env.VITE_API_BASE_URL ||
    envFromFile.VITE_API_BASE_URL;

  if (!baseURL) {
    throw new Error('No se pudo resolver API base URL. Define API_BASE_URL o VITE_API_BASE_URL.');
  }

  const api = axios.create({
    baseURL,
    timeout: 60000
  });

  const [tplResp, userResp, histResp, empResp] = await Promise.all([
    api.get('/servicio/leanglobal/obtenerTemplates?id_tipo_srv=36'),
    api.get('/servicio/leanglobal/obtenerUsuarios'),
    api.get('/servicio/leanglobal/obtenerHistoricoConexion'),
    api.get('/servicio/leanglobal/obtenerEmpresas')
  ]);

  const templates = Array.isArray(tplResp.data) ? tplResp.data : [];
  const tpl = templates.find((t) => Number(t.id_template) === 153);
  if (!tpl) throw new Error('No se encontró template 153 (Reclamo).');

  const users = Array.isArray(userResp.data) ? userResp.data : [];
  const userFromEnv = asNum(process.env.SMOKE_USER_ID);
  const idUser = userFromEnv || asNum(users[0]?.id_user);
  if (!idUser) throw new Error('No se pudo resolver id_user para la prueba.');

  const empresas = Array.isArray(empResp.data) ? empResp.data : [];
  const empresaFromEnv = asNum(process.env.SMOKE_EMPRESA_ID);
  const idEmpresa = empresaFromEnv || asNum(empresas[0]?.id_empresa);
  if (!idEmpresa) throw new Error('No se pudo resolver id_empresa_cliente para la prueba.');

  let idProyecto = asNum(process.env.SMOKE_PROYECTO_ID);
  if (!idProyecto) {
    try {
      const { data } = await api.get(`/servicio/leanglobal/obtenerProyectos?id_empresa_cliente=${idEmpresa}`);
      if (Array.isArray(data) && data[0]?.id_proyecto) idProyecto = asNum(data[0].id_proyecto);
    } catch {
      idProyecto = null;
    }
  }

  const historicoRows = Array.isArray(histResp.data)
    ? histResp.data
    : Array.isArray(histResp.data?.rows)
      ? histResp.data.rows
      : Array.isArray(histResp.data?.data)
        ? histResp.data.data
        : [];

  const icFilter = String(process.env.SMOKE_IC || '').trim();
  let picked = null;
  if (icFilter) {
    picked = historicoRows.find((r) => String(r?.ic_sap || r?.IC_SAP_MG || r?.['IC SAP MG'] || '').trim() === icFilter) || null;
  }
  if (!picked) {
    picked = historicoRows.find((r) =>
      (r?.ic_sap || r?.IC_SAP_MG || r?.['IC SAP MG']) &&
      (r?.direccion || r?.DIRECCION || r?.['DIRECCIÓN'])
    ) || historicoRows[0] || {};
  }

  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const dd = String(now.getDate()).padStart(2, '0');
  const hh = String(now.getHours()).padStart(2, '0');
  const mi = String(now.getMinutes()).padStart(2, '0');
  const fechaPlan = `${yyyy}-${mm}-${dd}`;
  const fechaRecepcion = `${yyyy}-${mm}-${dd}T${hh}:${mi}`;
  const meses = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  const ic = String(
    picked?.ic_sap ||
    picked?.IC_SAP_MG ||
    picked?.['IC SAP MG'] ||
    `IC-TEST-${Date.now()}`
  ).trim();
  const direccion = String(
    picked?.direccion ||
    picked?.DIRECCION ||
    picked?.['DIRECCIÓN'] ||
    'DIRECCION TEST'
  ).trim();
  const comuna = String(picked?.comuna || picked?.COMUNA || 'Santiago').trim();

  const bodySeed = typeof tpl.body_seed === 'string' ? JSON.parse(tpl.body_seed || '{"segmentos":[]}') : (tpl.body_seed || { segmentos: [] });
  const headerSeed = typeof tpl.header_seed === 'string' ? JSON.parse(tpl.header_seed || '{}') : (tpl.header_seed || {});
  const approvalSeed = typeof tpl.approval_seed === 'string' ? JSON.parse(tpl.approval_seed || '{}') : (tpl.approval_seed || {});
  const bodyExec = JSON.parse(JSON.stringify(bodySeed));
  const segmentos = bodyExec.segmentos || [];

  upsertAttr(segmentos, ['IC'], ic);
  upsertAttr(segmentos, ['Direccion', 'Dirección'], direccion);
  upsertAttr(segmentos, ['Comuna'], comuna);
  upsertAttr(segmentos, ['Fecha Recepción Reclamo', 'Fecha de recepción del reclamo'], fechaRecepcion);
  upsertAttr(segmentos, ['Año', 'Ano'], String(yyyy));
  upsertAttr(segmentos, ['Mes Recepción Reclamo'], meses[now.getMonth()]);
  upsertAttr(segmentos, ['Estado'], 'Pendiente');
  upsertAttr(segmentos, ['Reclamo Pendiente por'], 'Metrogas');
  upsertAttr(segmentos, ['Aplica / No Aplica', 'Aplica/ No Aplica'], 'Aplica');
  upsertAttr(segmentos, ['Tipo Reclamo'], 'Otros');
  upsertAttr(segmentos, ['Observación Terracon', 'Observacion Terracon'], `SMOKE TEST ${new Date().toISOString()}`);

  const payload = {
    id_tipo_srv: 36,
    id_template: 153,
    id_user: idUser,
    id_user_creacion: idUser,
    id_empresa_cliente: idEmpresa,
    estado_srv: 'Pre Creado',
    header_seed: JSON.stringify(headerSeed),
    body_seed: JSON.stringify(bodySeed),
    approval_seed: JSON.stringify(approvalSeed),
    header_exec: JSON.stringify(headerSeed),
    body_exec: JSON.stringify(bodyExec),
    approval_exec: JSON.stringify(approvalSeed),
    fecha_plan_ini: fechaPlan,
    fecha_plan_fin: fechaPlan,
    fecha_real_ini: null,
    fecha_real_fin: null,
    fecha_upload: null,
    latitud: null,
    longitud: null,
    id_proyecto: idProyecto,
    id_flow_tmpl: tpl.id_flow_tmpl || null
  };

  const { data } = await api.post('/survey/', payload);

  console.log(
    JSON.stringify(
      {
        ok: true,
        baseURL,
        idSurvey: data?.idSurvey || data?.id_survey || null,
        idEmpresa,
        idProyecto,
        idUser,
        ic,
        direccion,
        comuna
      },
      null,
      2
    )
  );
}

main().catch((err) => {
  console.error(
    JSON.stringify(
      {
        ok: false,
        message: err?.response?.data?.message || err?.response?.data?.error || err.message,
        status: err?.response?.status || null,
        data: err?.response?.data || null
      },
      null,
      2
    )
  );
  process.exit(1);
});
