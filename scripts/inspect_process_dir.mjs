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

    // 1. Get process details using ps
    console.log('\n--- process details ---');
    const psRes = await ssh.execCommand('ps -f -p 17252 || ps aux | grep 17252');
    console.log(psRes.stdout || psRes.stderr);

    // 2. Get process working directory using pwdx
    console.log('\n--- working directory (pwdx) ---');
    const pwdxRes = await ssh.execCommand('pwdx 17252');
    console.log(pwdxRes.stdout || pwdxRes.stderr);

    // 3. Show PM2 process env using pm2 env
    console.log('\n--- PM2 env 3 ---');
    const pm2Env = await ssh.execCommand('sudo -u nodeadmin pm2 env 3');
    console.log(pm2Env.stdout || pm2Env.stderr);

  } catch (err) {
    console.error('Error:', err);
  } finally {
    ssh.dispose();
  }
}

run();
