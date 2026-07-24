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

    // 1. Search for "observaciones" in all JS files in lean-services-qa (excluding node_modules)
    console.log('\n--- Searching for "observaciones" in lean-services-qa JS files ---');
    const res1 = await ssh.execCommand('find /home/nodeadmin/proyectos/lean-services-qa -name "*.js" -not -path "*/node_modules/*" -exec grep -rn "observaciones" {} +');
    console.log(res1.stdout || 'None found');

    // 2. Let's list files in routes of lean-services-qa
    console.log('\n--- Listing src/routes of lean-services-qa ---');
    const res2 = await ssh.execCommand('ls -la /home/nodeadmin/proyectos/lean-services-qa/src/routes/');
    console.log(res2.stdout || 'None');

    // 3. Search for the word "3001" or "3003" inside the lean-services-qa routes or app files to find where port is set
    console.log('\n--- .env of lean-services-qa ---');
    const res3 = await ssh.execCommand('cat /home/nodeadmin/proyectos/lean-services-qa/.env');
    console.log(res3.stdout || 'None');

  } catch (err) {
    console.error('Error:', err);
  } finally {
    ssh.dispose();
  }
}

run();
