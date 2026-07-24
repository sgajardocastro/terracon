import { NodeSSH } from 'node-ssh';

const ssh = new NodeSSH();

async function run() {
  try {
    await ssh.connect({
      host: 'servidor.leanglobal.cl',
      port: 1295,
      username: 'root',
      password: 'lgbl2025.'
    });
    console.log('✅ SSH Connected.');

    // 1. We will write a Node script to run on the server under nodeadmin
    // This script will:
    // a) Query the database to get Template 77 data_seed details
    // b) POST to http://localhost:3003/api/survey
    // c) Print the new id_survey
    // d) Run the flow steps update SQL query

    const serverScript = `
const { Pool } = require('pg');
const axios = require('axios');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT || 5432,
});

async function main() {
  try {
    console.log('Fetching Template 77 details...');
    const dbRes = await pool.query(
      'SELECT id_template, header_seed, body_seed, approval_seed, id_flow_tmpl, id_tipo_srv FROM sch_leansurvey_qa.tsrv_templates WHERE id_template = 77'
    );
    if (dbRes.rows.length === 0) {
      throw new Error('Template 77 not found in DB.');
    }
    const tmpl = dbRes.rows[0];
    console.log('Template 77 loaded.');

    const dateStr = new Date().toISOString().split('T')[0];

    const payload = {
      id_tipo_srv: tmpl.id_tipo_srv || 36,
      id_template: 77,
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
      fecha_plan_ini: dateStr,
      fecha_plan_fin: dateStr,
      id_proyecto: 9,
      id_flow_tmpl: tmpl.id_flow_tmpl
    };

    console.log('Calling POST http://localhost:3003/api/survey...');
    const apiRes = await axios.post('http://localhost:3003/api/survey', payload);
    console.log('API Response:', JSON.stringify(apiRes.data));

    const idSurvey = apiRes.data.id_survey;
    if (!idSurvey) {
      throw new Error('No id_survey returned in API response.');
    }

    console.log('Assigning user 327 (Sergio) to all flow steps of survey: ' + idSurvey);
    const updateRes = await pool.query(
      \`UPDATE sch_leansurvey_qa.tflw_flow_steps 
       SET id_user = 327 
       WHERE id_flow = (SELECT id_flow FROM sch_leansurvey_qa.tflw_flows WHERE id_survey = $1)\`,
      [idSurvey]
    );
    console.log('Update query finished. Rows affected: ' + updateRes.rowCount);

    console.log('--- SURVEY CREATION SUCCESSFUL ---');
    console.log('id_survey: ' + idSurvey);

  } catch(err) {
    console.error('Error during execution:', err.message || err);
  } finally {
    await pool.end();
  }
}

main();
`;

    // Upload script
    console.log('Uploading survey creation script...');
    const remotePath = '/home/nodeadmin/proyectos/lean-services-qa/scripts/scratch_survey_77.js';
    await ssh.execCommand(`cat << 'EOF' > ${remotePath}\n${serverScript}\nEOF`);
    await ssh.execCommand(`chown nodeadmin:nodeadmin ${remotePath}`);

    // Run script as nodeadmin
    console.log('Running script as nodeadmin...');
    const execRes = await ssh.execCommand(`sudo -u nodeadmin node ${remotePath}`);
    console.log(execRes.stdout || execRes.stderr);

  } catch (err) {
    console.error('Error:', err);
  } finally {
    ssh.dispose();
  }
}

run();
