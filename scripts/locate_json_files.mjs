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

    console.log('\n--- JSON Files under lean-services ---');
    const res1 = await ssh.execCommand('find /home/nodeadmin/proyectos/lean-services -name "*.json" -not -path "*/node_modules/*"');
    console.log(res1.stdout || 'None');

    console.log('\n--- JSON Files under /var/www/html/lg-terracon-qa ---');
    const res2 = await ssh.execCommand('find /var/www/html/lg-terracon-qa -name "*.json"');
    console.log(res2.stdout || 'None');

    // Also check pm2 process env/details
    console.log('\n--- PM2 Process 3 Working Dir & Script ---');
    const res3 = await ssh.execCommand('sudo -u nodeadmin pm2 env 3 | grep -E "PWD|cwd|script" || sudo -u nodeadmin pm2 show 3 | grep -E "cwd|script"');
    console.log(res3.stdout || 'None');

  } catch (err) {
    console.error('Error:', err);
  } finally {
    ssh.dispose();
  }
}

run();
