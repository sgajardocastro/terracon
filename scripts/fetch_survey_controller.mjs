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
    console.log('✅ SSH connected');

    const query = `
      SELECT header_exec, body_exec 
      FROM sch_leansurvey_dev.tsrv_survey 
      WHERE id_survey = 2590;
    `;

    const result = await ssh.execCommand(`PGPASSWORD='pass_dev_123' psql -h localhost -U usr_dev -d postgres -c "${query}"`);
    console.log('=== RUNTIME SURVEY DATA ===');
    console.log(result.stdout || result.stderr);

  } catch (err) {
    console.error('❌ Error:', err);
  } finally {
    ssh.dispose();
  }
}

run();
