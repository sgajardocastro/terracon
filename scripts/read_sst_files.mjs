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

    // 1. Search sstController.js content for observations
    console.log('\n--- Content of sstController.js ---');
    const sstController = await ssh.execCommand('cat /home/nodeadmin/proyectos/lean-services/src/controllers/sstController.js');
    console.log(sstController.stdout || sstController.stderr);

    // 2. Search for all router.get / router.post / app.get / app.post in all router files
    console.log('\n--- Searching routes in lean-services ---');
    const routesSearch = await ssh.execCommand('find /home/nodeadmin/proyectos/lean-services/src/routes -name "*.js" -exec grep -rn "observaciones" {} +');
    console.log(routesSearch.stdout || 'None found in routes');

  } catch (err) {
    console.error('Error:', err);
  } finally {
    ssh.dispose();
  }
}

run();
