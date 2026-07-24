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

    const assignScript = `
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

async function runAssign() {
  try {
    const idSurvey = 4124;
    console.log('Assigning user 327 to flow steps for survey ' + idSurvey + '...');
    const updateRes = await pool.query(
      \`UPDATE sch_leansurvey_qa.tflw_flow_steps 
       SET id_user = 327 
       WHERE id_flow = (SELECT id_flow FROM sch_leansurvey_qa.tflw_flows WHERE id_survey = $1)\`,
      [idSurvey]
    );
    console.log('SQL finished. Rows affected: ' + updateRes.rowCount);
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await pool.end();
  }
}

runAssign();
`;

    const remotePath = '/home/nodeadmin/proyectos/lean-services-qa/scripts/scratch_assign_4124.js';
    await ssh.execCommand(`cat << 'EOF' > ${remotePath}\n${assignScript}\nEOF`);
    await ssh.execCommand(`chown nodeadmin:nodeadmin ${remotePath}`);

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
