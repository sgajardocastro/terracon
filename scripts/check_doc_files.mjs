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
      SELECT id_doc, name_doc_interno, mimetype, path_doc 
      FROM sch_leansurvey_qa.tfmg_file 
      WHERE id_doc IN (18589, 18590);
    `;
    const r = await ssh.execCommand(`export PGPASSWORD='pass_qa_123' && psql -h localhost -U usr_qa -d postgres -t -A -F ',' -c "${query}"`);
    console.log('File details:');
    console.log(r.stdout || r.stderr || 'No results');

  } catch (err) {
    console.error('Error:', err);
  } finally {
    ssh.dispose();
  }
}

run();
