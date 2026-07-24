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

    // 1. Get survey 4124 status
    console.log('\n--- Survey 4124 Info ---');
    const q1 = `SELECT id_survey, id_doc, estado_srv, fecha_modificacion FROM sch_leansurvey_qa.tsrv_survey WHERE id_survey = 4124`;
    const r1 = await ssh.execCommand(`export PGPASSWORD='pass_qa_123' && psql -h localhost -U usr_qa -d postgres -t -A -F ',' -c "${q1}"`);
    console.log(r1.stdout || r1.stderr || 'No results');

    // 2. Get latest 5 files from tfmg_file
    console.log('\n--- Latest 5 files in tfmg_file ---');
    const q2 = `SELECT id_doc, name_doc_interno, mimetype, fecha_creacion FROM sch_leansurvey_qa.tfmg_file ORDER BY id_doc DESC LIMIT 5`;
    const r2 = await ssh.execCommand(`export PGPASSWORD='pass_qa_123' && psql -h localhost -U usr_qa -d postgres -t -A -F ',' -c "${q2}"`);
    console.log(r2.stdout || r2.stderr || 'No results');

  } catch (err) {
    console.error('Error:', err);
  } finally {
    ssh.dispose();
  }
}

run();
