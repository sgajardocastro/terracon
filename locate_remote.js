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

    console.log('--- SEARCHING FOR surveyModel.js ON REMOTE SERVER ---');
    const res = await ssh.execCommand('find /home -name "surveyModel.js"');
    console.log('Stdout:', res.stdout);
    console.log('Stderr:', res.stderr);

    console.log('--- PM2 PROCESS LIST ---');
    const pm2Res = await ssh.execCommand('sudo -u nodeadmin pm2 status');
    console.log(pm2Res.stdout);
  } catch (err) {
    console.error(err);
  } finally {
    ssh.dispose();
  }
}

run();
