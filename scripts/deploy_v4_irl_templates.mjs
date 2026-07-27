import { NodeSSH } from 'node-ssh';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ssh = new NodeSSH();

// Path to Gestió de Templates/IRL
const irlDir = 'D:\\SGajardo\\Google Drive\\Antigravity\\Gestión de Templates\\IRL';

async function main() {
  try {
    console.log('🔗 Conectando a servidor servidor.leanglobal.cl via SSH...');
    await ssh.connect({
      host: 'servidor.leanglobal.cl',
      port: 1295,
      username: 'root',
      password: 'lgbl2025.'
    });

    console.log('📁 Asegurando carpeta física en servidor: /u05/LeanDocs/terracon/irl');
    await ssh.execCommand('mkdir -p /u05/LeanDocs/terracon/irl && chmod -R 777 /u05/LeanDocs/terracon/irl');

    // 1. Subir todos los archivos HTML (13 Cargo + 31 Complementarios) a /u05/LeanDocs/terracon/irl
    const cargoHtmlDir = path.join(irlDir, 'IRL Tercera Iteración', 'IRL', 'IRL');
    const compHtmlDir = path.join(irlDir, 'IRL Tercera Iteración', 'Documentos Complementarios');

    console.log('📤 Subiendo HTMLs de Cargos a /u05/LeanDocs/terracon/irl ...');
    if (fs.existsSync(cargoHtmlDir)) {
      const cargoFiles = fs.readdirSync(cargoHtmlDir).filter(f => f.endsWith('.html'));
      for (const file of cargoFiles) {
        const localPath = path.join(cargoHtmlDir, file);
        const remotePath = `/u05/LeanDocs/terracon/irl/${file}`;
        await ssh.putFile(localPath, remotePath);
        console.log(`  -> Subido Cargo: ${file}`);
      }
    }

    console.log('📤 Subiendo HTMLs Complementarios a /u05/LeanDocs/terracon/irl ...');
    if (fs.existsSync(compHtmlDir)) {
      const compFiles = fs.readdirSync(compHtmlDir).filter(f => f.endsWith('.html'));
      for (const file of compFiles) {
        const localPath = path.join(compHtmlDir, file);
        const remotePath = `/u05/LeanDocs/terracon/irl/${file}`;
        await ssh.putFile(localPath, remotePath);
        console.log(`  -> Subido Complementario: ${file}`);
      }
    }

    await ssh.execCommand('chmod -R 777 /u05/LeanDocs/terracon/irl');

    // 2. Ejecutar la actualización SQL de las plantillas en sch_leansurvey_qa
    console.log('\n💾 Ejecutando actualización SQL de templates V4 en sch_leansurvey_qa...');
    const sqlPath = path.join(irlDir, 'v4_update_all_irl.sql');
    const sqlContent = fs.readFileSync(sqlPath, 'utf-8');

    await ssh.execCommand(`cat << 'EOF' > /tmp/v4_update_irl.sql\n${sqlContent}\nEOF`);
    const sqlRes = await ssh.execCommand(`export PGPASSWORD='pass_qa_123' && psql -h localhost -U usr_qa -d postgres -f /tmp/v4_update_irl.sql`);
    
    console.log('--- Output PostgreSQL ---');
    console.log(sqlRes.stdout || sqlRes.stderr);

    // 3. Consultar las plantillas V4 actualizadas
    const checkRes = await ssh.execCommand(`export PGPASSWORD='pass_qa_123' && psql -h localhost -U usr_qa -d postgres -t -c "SELECT id_template, name FROM sch_leansurvey_qa.tsrv_templates WHERE name LIKE 'V4%';"`);
    
    console.log('\n✅ Plantillas V4 encontradas en la Base de Datos de QA:');
    console.log(checkRes.stdout.trim());

    await ssh.execCommand('rm -f /tmp/v4_update_irl.sql');
    ssh.dispose();
    console.log('\n🎉 ¡Despliegue y actualización V4 completados con éxito en QA!');
  } catch (err) {
    console.error('❌ Error durante el despliegue V4:', err);
    ssh.dispose();
  }
}

main();
