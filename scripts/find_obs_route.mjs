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

    // Search for any route matching 'observaciones' in js files under proyectos, excluding node_modules
    const cmd = `grep -rn --exclude-dir=node_modules "observaciones" /home/nodeadmin/proyectos/**/*.js /home/nodeadmin/proyectos/*.js 2>/dev/null | grep -E "router|app\\.|get\\(|post\\(" | head -n 30`;
    console.log(`Running: ${cmd}`);
    const res = await ssh.execCommand(cmd);
    console.log('Grep Results:');
    console.log(res.stdout || res.stderr || 'Not found');

  } catch (err) {
    console.error('Error:', err);
  } finally {
    ssh.dispose();
  }
}

run();
