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

    console.log('\n--- Nginx Conf files list ---');
    const res1 = await ssh.execCommand('ls -la /etc/nginx/conf.d/ || ls -la /etc/nginx/sites-enabled/');
    console.log(res1.stdout || 'None');

    console.log('\n--- Searching Nginx for "observaciones" ---');
    const res2 = await ssh.execCommand('grep -rn "observaciones" /etc/nginx/');
    console.log(res2.stdout || 'Not found in Nginx configs');

    console.log('\n--- Searching Nginx for "/api/" proxies ---');
    const res3 = await ssh.execCommand('grep -rn "proxy_pass" /etc/nginx/ 2>/dev/null | grep -E "3001|3002|3003|3004|3005" || grep -rn "proxy_pass" /etc/nginx/');
    console.log(res3.stdout || 'None');

  } catch (err) {
    console.error('Error:', err);
  } finally {
    ssh.dispose();
  }
}

run();
