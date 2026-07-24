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

    const res = await ssh.execCommand('cat /var/www/html/lg-terracon-qa/excel_observations.json');
    if (res.code !== 0) {
      throw new Error(`Failed to read file: ${res.stderr}`);
    }

    const data = JSON.parse(res.stdout);
    const item = data.find(x => String(x.num) === '42');
    console.log('Remote Item 42 (Template 74) in excel_observations.json:');
    console.log(JSON.stringify(item, null, 2));

  } catch (err) {
    console.error('Error:', err.message || err);
  } finally {
    ssh.dispose();
  }
}

run();
