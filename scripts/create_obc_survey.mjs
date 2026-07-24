import { NodeSSH } from 'node-ssh';

const ssh = new NodeSSH();

async function runQuery(query) {
  const formattedQuery = query.replace(/"/g, '\\"');
  const cmd = `export PGPASSWORD='pass_qa_123' && psql -h localhost -U usr_qa -d postgres -t -A -F ',' -c "${formattedQuery}"`;
  const res = await ssh.execCommand(cmd);
  if (res.stderr && !res.stdout) {
    throw new Error(res.stderr);
  }
  return res.stdout.trim().split('\n').filter(Boolean).map(line => line.split(','));
}

async function main() {
  try {
    console.log('🔗 Conectando a servidor via SSH...');
    await ssh.connect({
      host: 'servidor.leanglobal.cl',
      port: 1295,
      username: 'root',
      password: 'lgbl2025.'
    });

    console.log('👤 Asegurando enrolamiento de sgajardoc@gmail.com (ID 327) en el Equipo (ID 19)...');
    await runQuery(`
      INSERT INTO sch_leansurvey_qa.tpry_equipo_miembro (id_equipo_proyecto, id_user, activo)
      VALUES (19, 327, true)
      ON CONFLICT DO NOTHING;
    `);

    console.log('🚀 Creando nuevo survey para Template 74 (Observación de Conducta / MAESTROS) a través de la API Backend...');
    
    // Escribimos el script temporal en el servidor para ejecutar la petición local al puerto 3003
    const remoteApiScript = `
const axios = require('axios');
const { Client } = require('pg');

async function run() {
  const client = new Client({
    user: 'usr_qa',
    host: 'localhost',
    database: 'postgres',
    password: 'pass_qa_123',
    port: 5432,
  });

  try {
    await client.connect();
    const resTmpl = await client.query('SELECT id_template, id_flow_tmpl, body_seed, header_seed, approval_seed, id_tipo_srv FROM sch_leansurvey_qa.tsrv_templates WHERE id_template = 74');
    if (resTmpl.rows.length === 0) {
      throw new Error('Template 74 not found');
    }
    const tmpl = resTmpl.rows[0];

    const payload = {
      id_tipo_srv: tmpl.id_tipo_srv,
      id_template: 74,
      id_user: 327,
      id_user_creacion: 327,
      id_empresa_cliente: 3,
      estado_srv: "Creado",
      header_seed: tmpl.header_seed,
      body_seed: tmpl.body_seed,
      approval_seed: tmpl.approval_seed,
      header_exec: tmpl.header_seed,
      body_exec: tmpl.body_seed,
      approval_exec: tmpl.approval_seed,
      fecha_plan_ini: "2026-07-02",
      fecha_plan_fin: "2026-07-09",
      id_proyecto: 9,
      id_flow_tmpl: tmpl.id_flow_tmpl
    };
    
    const res = await axios.post('http://localhost:3003/api/survey', payload);
    console.log('SUCCESS_ID:' + res.data.idSurvey);
  } catch (err) {
    console.error('ERROR:' + err.message);
  } finally {
    await client.end();
  }
}
run();
    `;

    const remoteScriptPath = '/home/nodeadmin/proyectos/lean-services-qa/create_survey_obc.js';
    await ssh.execCommand(`cat << 'EOF' > ${remoteScriptPath}\n${remoteApiScript}\nEOF`);
    
    const runRes = await ssh.execCommand(`node ${remoteScriptPath}`);
    console.log('Ejecución del creador API:', runRes.stdout.trim());

    // Borramos el script temporal
    await ssh.execCommand(`rm -f ${remoteScriptPath}`);

    // Extraer el nuevo ID de Survey
    const matches = runRes.stdout.match(/SUCCESS_ID:(\d+)/);
    if (!matches) {
      throw new Error('No se pudo obtener el ID del nuevo survey creado por la API de QA.');
    }
    const newSurveyId = matches[1];

    // Asignar el usuario 327 (Sergio) a todos los pasos del flujo del nuevo survey
    console.log(`👤 Asignando usuario 327 al flujo del nuevo Survey ID ${newSurveyId}...`);
    await runQuery(`
      UPDATE sch_leansurvey_qa.tflw_flow_steps 
      SET id_user = 327 
      WHERE id_flow = (SELECT id_flow FROM sch_leansurvey_qa.tflw_flows WHERE id_survey = ${newSurveyId});
    `);

    console.log(`\n🎉 ¡Survey OBC creado exitosamente!`);
    console.log(`- ID de Survey: ${newSurveyId}`);
    console.log(`- Asignado a: sgajardoc@gmail.com (ID 327)`);
    console.log(`- Proyecto: Proyecto Verificación de Seguridad (ID 9)`);

    ssh.dispose();
  } catch (err) {
    console.error('❌ Error:', err);
    ssh.dispose();
  }
}

main();
