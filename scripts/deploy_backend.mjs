import { NodeSSH } from 'node-ssh';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const webRoot = path.dirname(__dirname); // lg-terracon-main

const ssh = new NodeSSH();

async function run() {
  try {
    console.log('🔌 Conectando a servidor.leanglobal.cl:1295...');
    await ssh.connect({
      host: 'servidor.leanglobal.cl',
      port: 1295,
      username: 'root',
      password: 'lgbl2025.'
    });
    console.log('✅ Conexión SSH establecida.');

    // Subir los 3 archivos modificados
    const filesToUpload = [
      {
        local: path.join(webRoot, 'surveyModel.js'),
        remote: '/home/nodeadmin/proyectos/lean-services-dev/src/models/surveyModel.js'
      },
      {
        local: path.join(webRoot, 'surveyController.js'),
        remote: '/home/nodeadmin/proyectos/lean-services-dev/src/controllers/surveyController.js'
      },
      {
        local: path.join(webRoot, 'surveyRoutes.js'),
        remote: '/home/nodeadmin/proyectos/lean-services-dev/src/routes/surveyRoutes.js'
      }
    ];

    for (const f of filesToUpload) {
      console.log(`⬆️ Subiendo: ${path.basename(f.local)} -> ${f.remote}`);
      await ssh.putFile(f.local, f.remote);
    }
    console.log('✅ Archivos subidos con éxito.');

    // Ver procesos activos en PM2 del usuario nodeadmin
    console.log('📋 Estado de PM2 para nodeadmin:');
    const statusResult = await ssh.execCommand('sudo -u nodeadmin pm2 status');
    console.log(statusResult.stdout);

    // Intentar reiniciar usando el ID 1 o el nombre de proceso
    console.log('🔄 Reiniciando proceso PM2 del backend de desarrollo...');
    const restartResult = await ssh.execCommand('sudo -u nodeadmin pm2 restart 1');
    console.log(restartResult.stdout || restartResult.stderr);

    console.log('🎉 Despliegue de Backend finalizado con éxito!');
  } catch (err) {
    console.error('❌ Error durante el despliegue:', err);
  } finally {
    ssh.dispose();
  }
}

run();
