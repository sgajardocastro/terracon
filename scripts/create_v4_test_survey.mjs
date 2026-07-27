import { NodeSSH } from 'node-ssh';

const ssh = new NodeSSH();

async function main() {
  try {
    console.log('🔗 Conectando a servidor via SSH...');
    await ssh.connect({
      host: 'servidor.leanglobal.cl',
      port: 1295,
      username: 'root',
      password: 'lgbl2025.'
    });

    // Crear un survey de prueba para Template 140 (Supervisor Terreno V4)
    const targetTemplateId = 140;
    
    console.log(`🚀 Creando nuevo survey de prueba para Template V4 ID ${targetTemplateId} (Supervisor Terreno)...`);

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
    const resTmpl = await client.query('SELECT id_template, id_flow_tmpl, body_seed, header_seed, approval_seed, id_tipo_srv FROM sch_leansurvey_qa.tsrv_templates WHERE id_template = ${targetTemplateId}');
    if (resTmpl.rows.length === 0) {
      throw new Error('Template ${targetTemplateId} not found');
    }
    const tmpl = resTmpl.rows[0];

    const payload = {
      id_tipo_srv: tmpl.id_tipo_srv,
      id_template: ${targetTemplateId},
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
      fecha_plan_ini: "2026-07-24",
      fecha_plan_fin: "2026-07-25",
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

    await ssh.execCommand(`cat << 'EOF' > /home/nodeadmin/proyectos/lean-services-qa/create_v4_survey.js\n${remoteApiScript}\nEOF`);
    
    const runRes = await ssh.execCommand('node /home/nodeadmin/proyectos/lean-services-qa/create_v4_survey.js');
    console.log('Ejecución del creador API:', runRes.stdout.trim());

    const matches = runRes.stdout.match(/SUCCESS_ID:(\d+)/);
    if (!matches) {
      throw new Error('No se pudo obtener el ID del nuevo survey creado por API: ' + runRes.stderr);
    }
    const newSurveyId = matches[1];

    // Asignar el usuario 327 (Sergio)
    console.log(`👤 Asignando Sergio (327) al flujo del nuevo Survey ID ${newSurveyId}...`);
    await ssh.execCommand(`export PGPASSWORD='pass_qa_123' && psql -h localhost -U usr_qa -d postgres -c "UPDATE sch_leansurvey_qa.tflw_flow_steps SET id_user = 327 WHERE id_flow = (SELECT id_flow FROM sch_leansurvey_qa.tflw_flows WHERE id_survey = ${newSurveyId});"`);

    console.log(`\n🎉 ¡Survey V4 Creado y Asignado con Éxito!`);
    console.log(`- ID de Survey: ${newSurveyId}`);
    console.log(`- Template: V4 - IRL-Supervisor Terreno (ID 140)`);
    console.log(`- Usuario asignado: Sergio (ID 327)`);

    await ssh.execCommand('rm -f /home/nodeadmin/proyectos/lean-services-qa/create_v4_survey.js');
    ssh.dispose();
  } catch (err) {
    console.error('❌ Error creando survey V4:', err);
    ssh.dispose();
  }
}

main();
