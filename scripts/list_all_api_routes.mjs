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

    // Find all router registrations in lean-services-qa
    console.log('\n--- Router registrations in lean-services-qa ---');
    const cmd1 = 'find /home/nodeadmin/proyectos/lean-services-qa -name "*.js" -not -path "*/node_modules/*" -exec grep -rn -E "router\\.(get|post|put|delete|use)\\(|app\\.(get|post|put|delete|use)\\(" {} +';
    const res1 = await ssh.execCommand(cmd1);
    console.log(res1.stdout || res1.stderr || 'None');

    // Also search lean-services (port 3001) just in case
    console.log('\n--- Router registrations in lean-services ---');
    const cmd2 = 'find /home/nodeadmin/proyectos/lean-services -name "*.js" -not -path "*/node_modules/*" -exec grep -rn -E "router\\.(get|post|put|delete|use)\\(|app\\.(get|post|put|delete|use)\\(" {} +';
    const res2 = await ssh.execCommand(cmd2);
    console.log(res2.stdout || res2.stderr || 'None');

  } catch (err) {
    console.error('Error:', err);
  } finally {
    ssh.dispose();
  }
}

run();
