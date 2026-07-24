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

    // Search for "4100" in JSON files under /var/www/html/ and /home/nodeadmin/
    console.log('🔍 Searching for files containing "4100" in web/project paths...');
    const cmd = 'find /var/www/html /home/nodeadmin/proyectos -name "*.json" -exec grep -l "4100" {} + 2>/dev/null';
    const res = await ssh.execCommand(cmd);
    console.log('Files containing "4100":');
    console.log(res.stdout || 'None');

    // Also search for "4092" (which is another evidence ID in the observations list)
    console.log('\n🔍 Searching for files containing "4092"...');
    const cmd2 = 'find /var/www/html /home/nodeadmin/proyectos -name "*.json" -exec grep -l "4092" {} + 2>/dev/null';
    const res2 = await ssh.execCommand(cmd2);
    console.log('Files containing "4092":');
    console.log(res2.stdout || 'None');

  } catch (err) {
    console.error('Error:', err);
  } finally {
    ssh.dispose();
  }
}

run();
