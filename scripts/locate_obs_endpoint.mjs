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

    // 1. Search for the word 'observaciones' in all javascript files under lean-services to find route definitions
    console.log('\n--- Searching for observations route in lean-services ---');
    const searchRes = await ssh.execCommand('grep -rn "observaciones" /home/nodeadmin/proyectos/lean-services/*.js /home/nodeadmin/proyectos/lean-services/src/routes/ 2>/dev/null');
    console.log(searchRes.stdout || searchRes.stderr || 'Not found in routes');

    // 2. Let's see what is inside the routes directory
    console.log('\n--- Listing src/routes/ ---');
    const routesList = await ssh.execCommand('ls -l /home/nodeadmin/proyectos/lean-services/src/routes/');
    console.log(routesList.stdout);

    // 3. Let's inspect app.js or server.js in lean-services
    console.log('\n--- Looking for port 3001 in config or app.js ---');
    const portRes = await ssh.execCommand('grep -rn "3001" /home/nodeadmin/proyectos/lean-services/');
    console.log(portRes.stdout);

  } catch (err) {
    console.error('Error:', err);
  } finally {
    ssh.dispose();
  }
}

run();
