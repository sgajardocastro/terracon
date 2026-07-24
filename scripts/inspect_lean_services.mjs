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

    // 1. Show PM2 process 3 details
    console.log('\n--- PM2 Show 3 ---');
    const pm2Show = await ssh.execCommand('sudo -u nodeadmin pm2 show 3');
    console.log(pm2Show.stdout || pm2Show.stderr);

    // 2. Search for "observaciones" route or query in the backend code
    console.log('\n--- Searching backend code for "observaciones" ---');
    const grepRes = await ssh.execCommand('grep -rn "observaciones" /home/nodeadmin/proyectos/lean-services/src/ /home/nodeadmin/proyectos/lean-services/app.js /home/nodeadmin/proyectos/lean-services/server.js 2>/dev/null || grep -rn "observaciones" /home/nodeadmin/proyectos/lean-services/ 2>/dev/null | head -n 30');
    console.log(grepRes.stdout || grepRes.stderr || 'Not found');

  } catch (err) {
    console.error('Error:', err);
  } finally {
    ssh.dispose();
  }
}

run();
