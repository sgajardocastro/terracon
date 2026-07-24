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

    const q = `
      SELECT f.name_doc_interno, f.mimetype, f.path_doc 
      FROM sch_leansurvey_qa.tfmg_file f
      WHERE f.id_doc = (
        SELECT id_doc 
        FROM sch_leansurvey_qa.tflw_flow_steps 
        WHERE id_flow = (
          SELECT id_flow FROM sch_leansurvey_qa.tflw_flows WHERE id_survey = 4086
        ) LIMIT 1
      );
    `;
    const r = await ssh.execCommand(`export PGPASSWORD='pass_qa_123' && psql -h localhost -U usr_qa -d postgres -t -A -F ',' -c "${q}"`);
    console.log('PDF details:');
    console.log(r.stdout || r.stderr || 'No results');

  } catch (err) {
    console.error('Error:', err);
  } finally {
    ssh.dispose();
  }
}

run();
