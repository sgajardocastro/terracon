import { NodeSSH } from 'node-ssh';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ssh = new NodeSSH();
const irlDir = 'D:\\SGajardo\\Google Drive\\Antigravity\\Gestión de Templates\\IRL';

async function main() {
  try {
    console.log('🔗 Conectando a servidor servidor.leanglobal.cl via SSH...');
    await ssh.connect({
      host: 'servidor.leanglobal.cl',
      port: 1295,
      username: 'root',
      password: 'lgbl2025.'
    });

    console.log('📁 Asegurando carpeta física en servidor: /u05/LeanDocs/terracon/irl');
    await ssh.execCommand('mkdir -p /u05/LeanDocs/terracon/irl && chmod -R 777 /u05/LeanDocs/terracon/irl');

    // 1. Ejecutar la actualización SQL de las plantillas en sch_leansurvey_dev
    console.log('\n💾 Ejecutando actualización SQL de templates V4 en sch_leansurvey_dev...');
    
    // Adapt standard V4 SQL to target sch_leansurvey_dev schema
    const sqlPath = path.join(irlDir, 'v4_update_all_irl.sql');
    const sqlContent = fs.readFileSync(sqlPath, 'utf-8').replace(/sch_leansurvey_qa/g, 'sch_leansurvey_dev');

    await ssh.execCommand(`cat << 'EOF' > /tmp/v4_update_irl_dev.sql\n${sqlContent}\nEOF`);
    const sqlRes = await ssh.execCommand(`export PGPASSWORD='pass_dev_123' && psql -h localhost -U usr_dev -d postgres -f /tmp/v4_update_irl_dev.sql`);
    
    console.log('--- Output PostgreSQL (DEV) ---');
    console.log(sqlRes.stdout || sqlRes.stderr);

    // 2. Crear un Survey de Prueba V4 en DEV (backend en puerto 3002)
    const targetTemplateId = 140; // Supervisor Terreno
    console.log(`\n🚀 Creando nuevo survey de prueba en DEV para Template V4 ID ${targetTemplateId} (Supervisor Terreno)...`);

    const remoteApiScript = `
const axios = require('axios');
const { Client } = require('pg');

async function run() {
  const client = new Client({
    user: 'usr_dev',
    host: 'localhost',
    database: 'postgres',
    password: 'pass_dev_123',
    port: 5432,
  });

  try {
    await client.connect();
    const resTmpl = await client.query('SELECT id_template, id_flow_tmpl, body_seed, header_seed, approval_seed, id_tipo_srv FROM sch_leansurvey_dev.tsrv_templates WHERE id_template = ${targetTemplateId}');
    if (resTmpl.rows.length === 0) {
      throw new Error('Template ${targetTemplateId} not found in DEV');
    }
    const tmpl = resTmpl.rows[0];

    // Check user 327 or fallback to user 14/any active user in DEV
    let userId = 327;
    const resUser = await client.query('SELECT id_user FROM sch_leansurvey_dev.tsrv_users WHERE id_user = 327');
    if (resUser.rows.length === 0) {
      const resAny = await client.query('SELECT id_user FROM sch_leansurvey_dev.tsrv_users LIMIT 1');
      if (resAny.rows.length > 0) userId = resAny.rows[0].id_user;
    }

    const payload = {
      id_tipo_srv: tmpl.id_tipo_srv,
      id_template: ${targetTemplateId},
      id_user: userId,
      id_user_creacion: userId,
      id_empresa_cliente: 3,
      estado_srv: "Creado",
      header_seed: tmpl.header_seed,
      body_seed: tmpl.body_seed,
      approval_seed: tmpl.approval_seed,
      header_exec: tmpl.header_seed,
      body_exec: tmpl.body_seed,
      approval_exec: tmpl.approval_seed,
      fecha_plan_ini: "2026-07-24",
      fecha_plan_fin: "2026-07-25",
      id_proyecto: 9,
      id_flow_tmpl: tmpl.id_flow_tmpl
    };
    
    const res = await axios.post('http://localhost:3002/api/survey', payload);
    console.log('SUCCESS_DEV_ID:' + res.data.idSurvey + '|USER:' + userId);
  } catch (err) {
    console.error('ERROR_DEV:' + err.message);
  } finally {
    await client.end();
  }
}
run();
    `;

    await ssh.execCommand(`cat << 'EOF' > /home/nodeadmin/proyectos/lean-services-dev/create_v4_survey_dev.js\n${remoteApiScript}\nEOF`);
    
    const runRes = await ssh.execCommand('node /home/nodeadmin/proyectos/lean-services-dev/create_v4_survey_dev.js');
    console.log('Ejecución del creador API (DEV):', runRes.stdout.trim());

    const matches = runRes.stdout.match(/SUCCESS_DEV_ID:(\d+)\|USER:(\d+)/);
    let devSurveyId = null;
    let devUserId = null;

    if (matches) {
      devSurveyId = matches[1];
      devUserId = matches[2];

      // Assign user to flow steps in DEV
      await ssh.execCommand(`export PGPASSWORD='pass_dev_123' && psql -h localhost -U usr_dev -d postgres -c "UPDATE sch_leansurvey_dev.tflw_flow_steps SET id_user = ${devUserId} WHERE id_flow = (SELECT id_flow FROM sch_leansurvey_dev.tflw_flows WHERE id_survey = ${devSurveyId});"`);
      console.log(`👤 Usuario ${devUserId} asignado al flujo del Survey DEV ID ${devSurveyId}`);
    }

    console.log(`\n🎉 ¡Despliegue V4 en DEV completado!`);
    if (devSurveyId) {
      console.log(`- Survey DEV Creado ID: ${devSurveyId}`);
      console.log(`- Usuario Asignado ID: ${devUserId}`);
    }

    await ssh.execCommand('rm -f /tmp/v4_update_irl_dev.sql /home/nodeadmin/proyectos/lean-services-dev/create_v4_survey_dev.js');
    ssh.dispose();
  } catch (err) {
    console.error('❌ Error durante el despliegue V4 en DEV:', err);
    ssh.dispose();
  }
}

main();
