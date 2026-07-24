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

    // 1. Search for routes defined in lean-services src directory
    console.log('\n--- Searching for router declarations ---');
    const res1 = await ssh.execCommand('grep -rn "api/observaciones" /home/nodeadmin/proyectos/lean-services/ || grep -rn "observaciones" /home/nodeadmin/proyectos/lean-services/src/routes/');
    console.log(res1.stdout || 'None found in src/routes');

    // 2. Let's find any files containing "observaciones" in any other projects (e.g. transmac or leanrm-backend)
    console.log('\n--- Searching globally for route "observaciones" ---');
    const res2 = await ssh.execCommand('grep -rn "observaciones" /home/nodeadmin/proyectos/ 2>/dev/null | grep -E "app\\.|router\\."');
    console.log(res2.stdout || 'None found in any other project');

    // 3. Let's look at the index.js and package.json of lean-services to see how routes are loaded
    console.log('\n--- Listing files in src/routes ---');
    const res3 = await ssh.execCommand('ls -la /home/nodeadmin/proyectos/lean-services/src/routes/ || ls -la /home/nodeadmin/proyectos/lean-services/src/api/');
    console.log(res3.stdout || 'None');

  } catch (err) {
    console.error('Error:', err);
  } finally {
    ssh.dispose();
  }
}

run();
