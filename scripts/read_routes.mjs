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

    // Case-insensitive grep for observations or obs inside lean-services-qa routes folder
    console.log('\n--- Searching for obs/observaciones in lean-services-qa routes ---');
    const cmd1 = 'grep -rn -i "observacion" /home/nodeadmin/proyectos/lean-services-qa/src/routes/';
    const res1 = await ssh.execCommand(cmd1);
    console.log(res1.stdout || 'None found');

    // Print all router definitions in all routes file to see all defined routes
    console.log('\n--- Listing all route paths in routes files ---');
    const cmd2 = 'grep -rn "router\\." /home/nodeadmin/proyectos/lean-services-qa/src/routes/ || grep -rn "app\\." /home/nodeadmin/proyectos/lean-services-qa/src/routes/';
    const res2 = await ssh.execCommand(cmd2);
    console.log(res2.stdout || 'None');

  } catch (err) {
    console.error('Error:', err);
  } finally {
    ssh.dispose();
  }
}

run();
