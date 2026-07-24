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

    // Query tflw_flow_steps for survey 4124 to get id_doc
    const query = `
      SELECT id_flow_stp, id_flow, id_user, id_doc, estado 
      FROM sch_leansurvey_qa.tflw_flow_steps 
      WHERE id_flow = (SELECT id_flow FROM sch_leansurvey_qa.tflw_flows WHERE id_survey = 4124);
    `;
    const r = await ssh.execCommand(`export PGPASSWORD='pass_qa_123' && psql -h localhost -U usr_qa -d postgres -t -A -F ',' -c "${query}"`);
    console.log('Flow steps details:');
    console.log(r.stdout || r.stderr || 'No results');

  } catch (err) {
    console.error('Error:', err);
  } finally {
    ssh.dispose();
  }
}

run();
