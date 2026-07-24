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

    console.log('\n--- Content of src/routes/servicioRoutes.js ---');
    const res1 = await ssh.execCommand('cat /home/nodeadmin/proyectos/lean-services-qa/src/routes/servicioRoutes.js');
    console.log(res1.stdout || res1.stderr);

    console.log('\n--- Content of src/routes/personalizadosRoutes.js ---');
    const res2 = await ssh.execCommand('cat /home/nodeadmin/proyectos/lean-services-qa/src/routes/personalizadosRoutes.js');
    console.log(res2.stdout || res2.stderr);

  } catch (err) {
    console.error('Error:', err);
  } finally {
    ssh.dispose();
  }
}

run();
