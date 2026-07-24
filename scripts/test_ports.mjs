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

    // 1. Curl http://localhost:3001/api/observaciones
    console.log('\n--- Curling port 3001 ---');
    const res1 = await ssh.execCommand('curl -i http://localhost:3001/api/observaciones');
    console.log(res1.stdout || res1.stderr);

    // 2. Curl http://localhost:3003/api/observaciones (QA backend)
    console.log('\n--- Curling port 3003 (QA) ---');
    const res2 = await ssh.execCommand('curl -i http://localhost:3003/api/observaciones');
    console.log(res2.stdout || res2.stderr);

    // 3. Curl http://localhost:3004/api/observaciones (Dev backend)
    console.log('\n--- Curling port 3004 (Dev) ---');
    const res3 = await ssh.execCommand('curl -i http://localhost:3004/api/observaciones');
    console.log(res3.stdout || res3.stderr);

  } catch (err) {
    console.error('Error:', err);
  } finally {
    ssh.dispose();
  }
}

run();
