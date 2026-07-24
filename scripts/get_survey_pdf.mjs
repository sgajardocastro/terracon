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

    const query = `
      SELECT f.name_doc_interno, f.id_doc, f.mimetype, f.path_doc 
      FROM sch_leansurvey_qa.tfmg_file f
      WHERE f.id_doc = (
        SELECT id_doc FROM sch_leansurvey_qa.tflw_flows WHERE id_survey = 4124
      );
    `;

    const formattedQuery = query.replace(/"/g, '\\"');
    const cmd = `export PGPASSWORD='pass_qa_123' && psql -h localhost -U usr_qa -d postgres -t -A -F ',' -c "${formattedQuery}"`;
    const res = await ssh.execCommand(cmd);

    console.log('PDF query results:');
    console.log(res.stdout || res.stderr || 'No results');

  } catch (err) {
    console.error('Error:', err);
  } finally {
    ssh.dispose();
  }
}

run();
