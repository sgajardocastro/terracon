import { NodeSSH } from 'node-ssh';

async function run() {
  const ssh = new NodeSSH();

  try {
    await ssh.connect({
      host: 'servidor.leanglobal.cl',
      port: 1295,
      username: 'root',
      password: 'lgbl2025.'
    });

    console.log('Fetching remote dev backend .env...');
    const envRes = await ssh.execCommand('cat /home/nodeadmin/proyectos/lean-services-dev/.env');
    console.log(envRes.stdout || envRes.stderr);

  } catch (err) {
    console.error('Error:', err.message || err);
  } finally {
    ssh.dispose();
  }
}

run();
