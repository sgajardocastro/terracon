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

    console.log('Restarting lean-services-qa (PM2 ID 2)...');
    const res1 = await ssh.execCommand('sudo -u nodeadmin pm2 restart 2');
    console.log(res1.stdout || res1.stderr);

    console.log('Restarting lean-services (PM2 ID 3)...');
    const res2 = await ssh.execCommand('sudo -u nodeadmin pm2 restart 3');
    console.log(res2.stdout || res2.stderr);

    // List PM2 status to confirm both are online
    const listRes = await ssh.execCommand('sudo -u nodeadmin pm2 list');
    console.log('\n--- PM2 List ---');
    console.log(listRes.stdout || listRes.stderr);

  } catch (err) {
    console.error('Error:', err);
  } finally {
    ssh.dispose();
  }
}

run();
