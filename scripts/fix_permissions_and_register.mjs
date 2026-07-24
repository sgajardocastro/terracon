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

    // 1. Chown lean-services files to nodeadmin
    console.log('Changing ownership of lean-services to nodeadmin...');
    await ssh.execCommand('chown -R nodeadmin:nodeadmin /home/nodeadmin/proyectos/lean-services');

    // 2. Re-run route registration as nodeadmin
    console.log('Running route registration script again...');
    const res = await ssh.execCommand('sudo -u nodeadmin node /home/nodeadmin/proyectos/lean-services-qa/scripts/register_routes.js');
    console.log(res.stdout || res.stderr);

  } catch (err) {
    console.error('Error:', err);
  } finally {
    ssh.dispose();
  }
}

run();
