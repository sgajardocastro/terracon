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

    const res = await ssh.execCommand('netstat -tlpn | grep 3001 || ss -tlpn | grep 3001 || lsof -i :3001');
    console.log('Port 3001 Listener:');
    console.log(res.stdout || res.stderr || 'No listener found on port 3001');

    // Let's also check if there is an observaciones.json file in the projects directory or anywhere
    const findRes = await ssh.execCommand('find /home/nodeadmin/ -name "*observaciones*.json" -o -name "*trazabilidad*.json"');
    console.log('\nFound files on server:');
    console.log(findRes.stdout || findRes.stderr || 'None');

  } catch (err) {
    console.error('Error:', err);
  } finally {
    ssh.dispose();
  }
}

run();
