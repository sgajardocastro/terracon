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

    // 1. Check what is listening on port 3001
    console.log('\n--- Checking port 3001 listener ---');
    const portRes = await ssh.execCommand('netstat -tlpn | grep 3001 || ss -tlpn | grep 3001');
    console.log(portRes.stdout || portRes.stderr || 'No process found on 3001 via netstat/ss');

    // 2. If netstat/ss didn't show it (due to docker or permissions), find files named *observaciones* in backend projects
    console.log('\n--- Locating "observaciones" backend files ---');
    const findFiles = await ssh.execCommand('find /home/nodeadmin/proyectos -name "*observaciones*"');
    console.log(findFiles.stdout || findFiles.stderr || 'No files found');

    // 3. Let's search for "/api/observaciones" inside backend files
    console.log('\n--- Searching for "/api/observaciones" in backend routes ---');
    const grepRoutes = await ssh.execCommand('grep -rn "/api/observaciones" /home/nodeadmin/proyectos/');
    console.log(grepRoutes.stdout || grepRoutes.stderr || 'Not found');

  } catch (err) {
    console.error('Error:', err);
  } finally {
    ssh.dispose();
  }
}

run();
