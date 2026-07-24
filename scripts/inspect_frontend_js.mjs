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

    // Search for URL or port patterns in the compiled VerificationTab file
    const searchCmd = 'grep -o -E "http://[^\\\"]+" /var/www/html/lg-terracon-qa/assets/VerificationTab-*.js || grep -o -E "api/[a-zA-Z_]+" /var/www/html/lg-terracon-qa/assets/VerificationTab-*.js | head -n 40';
    console.log(`Running: ${searchCmd}`);
    const res = await ssh.execCommand(searchCmd);
    console.log('Results:');
    console.log(res.stdout || res.stderr || 'No matches');

    // Also grep for "observaciones" case-insensitively in Nginx config or Nginx logs
    console.log('\n--- Searching for proxy configs or mappings in Nginx sites ---');
    const nginxRes = await ssh.execCommand('grep -rn "3001" /etc/nginx/ || grep -rn "3003" /etc/nginx/');
    console.log(nginxRes.stdout || 'None');

  } catch (err) {
    console.error('Error:', err);
  } finally {
    ssh.dispose();
  }
}

run();
