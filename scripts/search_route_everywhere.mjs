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

    const findCmd = 'find /home/nodeadmin/proyectos -type f -not -path "*/node_modules/*" -not -path "*.sql*" -not -path "*.git*" -exec grep -rn "observaciones" {} + 2>/dev/null | head -n 80';
    console.log(`Running: ${findCmd}`);
    const res = await ssh.execCommand(findCmd);
    console.log('Results:');
    console.log(res.stdout || res.stderr || 'No matches');

  } catch (err) {
    console.error('Error:', err);
  } finally {
    ssh.dispose();
  }
}

run();
