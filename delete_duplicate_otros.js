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

    const query = `
      DELETE FROM sch_leansurvey_dev.tpry_gantt_tarea_v3 
      WHERE id_tarea BETWEEN 220 AND 228;
    `;

    console.log('--- DELETING DUPLICATES ---');
    const res = await ssh.execCommand(`PGPASSWORD=pass_dev_123 psql -h localhost -U usr_dev -d postgres -c "${query}"`);
    console.log('Stdout:', res.stdout);
    console.log('Stderr:', res.stderr);
    console.log('Exit code:', res.code);
  } catch (err) {
    console.error(err);
  } finally {
    ssh.dispose();
  }
}

run();
