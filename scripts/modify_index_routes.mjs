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

    const modifyScript = `
const fs = require('fs');
const path = require('path');

const files = [
  '/home/nodeadmin/proyectos/lean-services-qa/src/routes/index.js',
  '/home/nodeadmin/proyectos/lean-services/src/routes/index.js'
];

for (const file of files) {
  if (!fs.existsSync(file)) {
    console.warn('File not found:', file);
    continue;
  }
  let content = fs.readFileSync(file, 'utf8');

  // Check if observations is already registered
  if (content.includes('observacionesRoutes')) {
    console.log('Already registered in:', file);
    continue;
  }

  // Add import
  const importTarget = "const templateRouter = require('./templateRoutes.js');";
  const importReplacement = "const templateRouter = require('./templateRoutes.js');\\nconst observacionesRouter = require('./observacionesRoutes.js');";
  
  // Add app.use
  const routeTarget = "app.use('/api/templates', templateRouter);";
  const routeReplacement = "app.use('/api/templates', templateRouter);\\n    app.use('/api/observaciones', observacionesRouter);";

  content = content.replace(importTarget, importReplacement);
  content = content.replace(routeTarget, routeReplacement);

  fs.writeFileSync(file, content, 'utf8');
  console.log('Successfully updated:', file);
}
`;

    // Upload script
    console.log('Uploading route registration script...');
    await ssh.execCommand(`cat << 'EOF' > /home/nodeadmin/proyectos/lean-services-qa/scripts/register_routes.js\n${modifyScript}\nEOF`);
    await ssh.execCommand('chown nodeadmin:nodeadmin /home/nodeadmin/proyectos/lean-services-qa/scripts/register_routes.js');

    // Run script as nodeadmin
    console.log('Running route registration script...');
    const res = await ssh.execCommand('sudo -u nodeadmin node /home/nodeadmin/proyectos/lean-services-qa/scripts/register_routes.js');
    console.log(res.stdout || res.stderr);

  } catch (err) {
    console.error('Error:', err);
  } finally {
    ssh.dispose();
  }
}

run();
