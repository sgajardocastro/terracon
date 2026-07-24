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

    // 1. Search for '/api/observaciones' or '/observaciones' or 'observaciones' in all backend projects (avoid node_modules, sql, logs)
    const findCmd = 'find /home/nodeadmin/proyectos -type f -not -path "*/node_modules/*" -not -path "*.sql*" -not -path "*.git*" -exec grep -rn -i "/observaciones" {} + 2>/dev/null';
    console.log(`Running: ${findCmd}`);
    const res = await ssh.execCommand(findCmd);
    console.log('Grep Results for "/observaciones":');
    console.log(res.stdout || 'None');

    // 2. Search for observations or obs JSON files in the entire server (excluding /proc, /sys)
    console.log('\n--- Searching for excel_observations or observaciones JSON files globally ---');
    const findFiles = await ssh.execCommand('find / -name "*excel_observations*.json" -o -name "*observaciones*.json" 2>/dev/null | grep -v "/proc/" | grep -v "/sys/"');
    console.log(findFiles.stdout || 'None');

  } catch (err) {
    console.error('Error:', err);
  } finally {
    ssh.dispose();
  }
}

run();
