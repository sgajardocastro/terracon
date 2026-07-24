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

    // 1. List directory
    const listRes = await ssh.execCommand('ls -R /home/nodeadmin/proyectos/lean-services');
    console.log('\n--- Directory Tree ---');
    console.log(listRes.stdout || listRes.stderr);

  } catch (err) {
    console.error('Error:', err);
  } finally {
    ssh.dispose();
  }
}

run();
