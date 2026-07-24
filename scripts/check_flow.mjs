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

    // Query tflw_flows to find id_doc and status of flow
    const query = `
      SELECT id_flow, id_survey, id_doc, estado 
      FROM sch_leansurvey_qa.tflw_flows 
      WHERE id_survey = 4124;
    `;
    const r = await ssh.execCommand(`export PGPASSWORD='pass_qa_123' && psql -h localhost -U usr_qa -d postgres -t -A -F ',' -c "${query}"`);
    console.log('Flow details:');
    console.log(r.stdout || r.stderr || 'No results');

  } catch (err) {
    console.error('Error:', err);
  } finally {
    ssh.dispose();
  }
}

run();
