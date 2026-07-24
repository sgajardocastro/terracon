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

    const res = await ssh.execCommand('ls -lh /u05/LeanDocs/terracon/db759555-c79e-47f5-ac70-f4aadb7ffa7c.pdf');
    console.log('File check output:');
    console.log(res.stdout || res.stderr || 'No output');

  } catch (err) {
    console.error('Error:', err);
  } finally {
    ssh.dispose();
  }
}

run();
