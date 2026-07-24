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

    // 1. Get template ID and status of survey 4086
    console.log('\n--- Survey 4086 Info ---');
    const q1 = `SELECT id_survey, id_template, id_proyecto, estado_srv FROM sch_leansurvey_qa.tsrv_survey WHERE id_survey = 4086`;
    const r1 = await ssh.execCommand(`export PGPASSWORD='pass_qa_123' && psql -h localhost -U usr_qa -d postgres -t -A -F ',' -c "${q1}"`);
    console.log(r1.stdout || r1.stderr || 'No results');

    // 2. Query document link and internal file name
    console.log('\n--- PDF File for Survey 4086 ---');
    const q2 = `
      SELECT f.name_doc_interno, f.mimetype, f.path_doc 
      FROM sch_leansurvey_qa.tfmg_file f
      WHERE f.id_doc = (
        SELECT id_doc FROM sch_leansurvey_qa.tflw_flows WHERE id_survey = 4086
      );
    `;
    const r2 = await ssh.execCommand(`export PGPASSWORD='pass_qa_123' && psql -h localhost -U usr_qa -d postgres -t -A -F ',' -c "${q2}"`);
    console.log(r2.stdout || r2.stderr || 'No results');

  } catch (err) {
    console.error('Error:', err);
  } finally {
    ssh.dispose();
  }
}

run();
