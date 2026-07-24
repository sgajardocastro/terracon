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

    const res = await ssh.execCommand('sed -n \'70,110p\' /etc/nginx/sites-enabled/https_le.conf');
    console.log('Nginx site config lines 70-110:');
    console.log(res.stdout || res.stderr);

  } catch (err) {
    console.error('Error:', err);
  } finally {
    ssh.dispose();
  }
}

run();
