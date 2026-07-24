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

    const res = await ssh.execCommand('find /home/nodeadmin/proyectos -name "excel_observations.json"');
    console.log('Found excel_observations.json files:');
    console.log(res.stdout || 'None');

  } catch (err) {
    console.error('Error:', err);
  } finally {
    ssh.dispose();
  }
}

run();
