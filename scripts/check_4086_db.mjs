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

    const checkScript = `
const { Pool } = require('pg');
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
    console.log('1. Checking tsrv_survey:');
    const srv = await pool.query('SELECT * FROM sch_leansurvey_qa.tsrv_survey WHERE id_survey = 4086');
    console.log(JSON.stringify(srv.rows, null, 2));

    console.log('2. Checking tflw_flows:');
    const flw = await pool.query('SELECT * FROM sch_leansurvey_qa.tflw_flows WHERE id_survey = 4086');
    console.log(JSON.stringify(flw.rows, null, 2));

    if (flw.rows.length > 0) {
      const idFlow = flw.rows[0].id_flow;
      console.log('3. Checking tflw_flow_steps for id_flow = ' + idFlow);
      const steps = await pool.query('SELECT * FROM sch_leansurvey_qa.tflw_flow_steps WHERE id_flow = $1', [idFlow]);
      console.log(JSON.stringify(steps.rows, null, 2));

      // Check files associated with the step documents
      const docIds = steps.rows.map(x => x.id_doc).filter(Boolean);
      if (docIds.length > 0) {
        console.log('4. Checking tfmg_file for id_docs:', docIds);
        const files = await pool.query('SELECT * FROM sch_leansurvey_qa.tfmg_file WHERE id_doc = ANY($1)', [docIds]);
        console.log(JSON.stringify(files.rows, null, 2));
      }
    }

  } catch (err) {
    console.error('Error:', err);
  } finally {
    await pool.end();
  }
}

main();
`;

    // Upload script
    const remotePath = '/home/nodeadmin/proyectos/lean-services-qa/scripts/scratch_check_4086.js';
    await ssh.execCommand(`cat << 'EOF' > ${remotePath}\n${checkScript}\nEOF`);
    await ssh.execCommand(`chown nodeadmin:nodeadmin ${remotePath}`);

    // Run script as nodeadmin
    const execRes = await ssh.execCommand(`sudo -u nodeadmin node ${remotePath}`);
    console.log('Execution Output:');
    console.log(execRes.stdout || execRes.stderr);

  } catch (err) {
    console.error('Error:', err);
  } finally {
    ssh.dispose();
  }
}

run();
