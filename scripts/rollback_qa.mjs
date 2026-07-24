import { NodeSSH } from 'node-ssh';

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

    console.log('\n⏪ Iniciando proceso de Vuelta Atrás (Rollback) para QA...');

    // 1. Restaurar Web App QA
    console.log('\n🧹 Limpiando directorio Web App QA...');
    await ssh.execCommand('rm -rf /var/www/html/lg-terracon-qa/*');

    console.log('📦 Restaurando Web App QA desde /var/www/html/lg-terracon-qa_BKP.tar.gz...');
    const resWeb = await ssh.execCommand('tar -xzf /var/www/html/lg-terracon-qa_BKP.tar.gz -C /var/www/html/lg-terracon-qa');
    if (resWeb.code === 0) {
      console.log('✅ Web App QA restaurada con éxito.');
    } else {
      throw new Error(`Error al restaurar Web App QA: ${resWeb.stderr}`);
    }

    // 2. Restaurar PWA QA
    console.log('\n🧹 Limpiando directorio PWA QA...');
    await ssh.execCommand('rm -rf /var/www/html/pwa-terracon-qa/*');

    console.log('📦 Restaurando PWA QA desde /var/www/html/pwa-terracon-qa_BKP.tar.gz...');
    const resPwa = await ssh.execCommand('tar -xzf /var/www/html/pwa-terracon-qa_BKP.tar.gz -C /var/www/html/pwa-terracon-qa');
    if (resPwa.code === 0) {
      console.log('✅ PWA QA restaurada con éxito.');
    } else {
      throw new Error(`Error al restaurar PWA QA: ${resPwa.stderr}`);
    }

    console.log('\n🎉 ¡Proceso de Rollback para QA completado exitosamente!');
  } catch (err) {
    console.error('\n❌ ERROR DURANTE EL ROLLBACK:', err.message || err);
  } finally {
    ssh.dispose();
  }
}

run();
