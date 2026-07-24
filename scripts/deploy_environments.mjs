import { NodeSSH } from 'node-ssh';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { execSync } from 'child_process';
import readline from 'readline';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Roots
const webRoot = path.dirname(__dirname); // lg-terracon-main
const pwaRoot = path.dirname(webRoot); // terracon-pwa

const env = process.argv[2];
if (!['dev', 'qa'].includes(env)) {
  console.error('Uso: node deploy_environments.mjs [dev|qa]');
  process.exit(1);
}

const config = {
  dev: {
    webRemote: '/var/www/html/lg-terracon-dev',
    pwaRemote: '/var/www/html/pwa-terracon-dev'
  },
  qa: {
    webRemote: '/var/www/html/lg-terracon-qa',
    pwaRemote: '/var/www/html/pwa-terracon-qa'
  }
};

const ssh = new NodeSSH();

function bumpVersion(pkgPath) {
  if (!fs.existsSync(pkgPath)) {
    console.warn(`⚠️ No se encontró package.json en: ${pkgPath}`);
    return null;
  }
  const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
  const oldVer = pkg.version || '1.0.0';
  const parts = oldVer.split('.');
  if (parts.length === 3) {
    parts[2] = String(Number(parts[2]) + 1);
  } else {
    parts.push('1');
  }
  const newVer = parts.join('.');
  pkg.version = newVer;
  fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n', 'utf8');
  console.log(`📈 Versión actualizada en ${path.basename(pkgPath)}: ${oldVer} -> ${newVer}`);
  return newVer;
}

async function deploy() {
  const envConfig = config[env];
  const localWebDist = path.join(webRoot, 'dist');
  const localPwaDist = path.join(pwaRoot, 'dist');
  const webOnly = process.argv.includes('--web-only');
  const pwaOnly = process.argv.includes('--pwa-only');

  console.log(`🚀 Iniciando despliegue para ambiente: ${env.toUpperCase()} ${webOnly ? '(WEB ONLY)' : pwaOnly ? '(PWA ONLY)' : '(BOTH)'}`);

  let changelogMsg = process.argv[3];
  if (!changelogMsg) {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
    changelogMsg = await new Promise((resolve) => {
      rl.question('📝 Ingresa una descripción para el log de cambios (changelog): ', (answer) => {
        rl.close();
        resolve(answer.trim() || 'Despliegue sin descripción específica');
      });
    });
  }

  try {
    // 1) Incrementar versiones en package.json de Web y PWA
    console.log('\n🔄 Actualizando números de versión...');
    const webNewVer = bumpVersion(path.join(webRoot, 'package.json'));
    const pwaNewVer = bumpVersion(path.join(pwaRoot, 'package.json'));

    // Actualizar CHANGELOG.md
    if (webNewVer && pwaNewVer) {
      const changelogPath = path.join(pwaRoot, 'CHANGELOG.md');
      const dateStr = new Date().toISOString().split('T')[0];
      const changelogEntry = `\n## [${dateStr}] - PWA v${pwaNewVer} / Web v${webNewVer}\n- **Ambiente:** ${env.toUpperCase()}\n- **Cambios:** ${changelogMsg}\n`;
      
      if (fs.existsSync(changelogPath)) {
        const currentContent = fs.readFileSync(changelogPath, 'utf8');
        const insertIndex = currentContent.indexOf('---') + 3;
        if (insertIndex > 2) {
          const newContent = currentContent.slice(0, insertIndex) + '\n' + changelogEntry + currentContent.slice(insertIndex);
          fs.writeFileSync(changelogPath, newContent, 'utf8');
        } else {
          fs.appendFileSync(changelogPath, changelogEntry, 'utf8');
        }
      } else {
        fs.writeFileSync(changelogPath, `# Historial de Cambios (Changelog)\n---\n${changelogEntry}`, 'utf8');
      }
      console.log(`📝 Log de cambios actualizado en CHANGELOG.md`);
    }

    // 2) Alternar variables de entorno
    console.log(`\n⚙️ Seteando variables de entorno para ${env.toUpperCase()}...`);
    const switchScript = path.join(pwaRoot, 'scripts', 'switch-env.mjs');
    execSync(`node "${switchScript}" ${env}`, { stdio: 'inherit' });

    // 3) Compilar Web App (Vite)
    if (!pwaOnly) {
      console.log('\n🏗️ Compilando Web App (Vite)...');
      if (fs.existsSync(localWebDist)) {
        try {
          fs.rmSync(localWebDist, { recursive: true, force: true });
        } catch (err) {
          console.warn(`⚠️ Advertencia: No se pudo limpiar la carpeta dist de la Web App (${err.message}). Continuando...`);
        }
      }
      execSync('npm run build', { cwd: webRoot, stdio: 'inherit' });
    }

    // 4) Compilar PWA (Vue CLI)
    if (!webOnly) {
      console.log('\n🏗️ Compilando PWA (Vue CLI)...');
      try {
        execSync('npm run apk:prepare', { cwd: pwaRoot, stdio: 'inherit' });
      } catch (e) {
        console.warn('⚠️ Advertencia: No se pudo preparar el APK (puede que no exista app-release-signed.apk). Continuando...');
      }
      if (fs.existsSync(localPwaDist)) {
        try {
          fs.rmSync(localPwaDist, { recursive: true, force: true });
        } catch (err) {
          console.warn(`⚠️ Advertencia: No se pudo limpiar la carpeta dist de la PWA (${err.message}). Continuando...`);
        }
      }
      execSync('npm run build', { cwd: pwaRoot, stdio: 'inherit' });
    }

    // 5) Conectar SSH
    console.log('\n🔌 Conectando a servidor.leanglobal.cl:1295...');
    await ssh.connect({
      host: 'servidor.leanglobal.cl',
      port: 1295,
      username: 'root',
      password: 'lgbl2025.'
    });
    console.log('✅ Conexión SSH establecida.');

    // Realizar respaldos de seguridad antes de borrar si es el ambiente QA
    if (env === 'qa') {
      console.log('\n📦 Creando respaldos remotos en el servidor para QA...');
      
      if (!pwaOnly) {
        const checkWeb = await ssh.execCommand('ls -A /var/www/html/lg-terracon-qa');
        if (checkWeb.stdout.trim() !== '') {
          console.log('📦 Generando /var/www/html/lg-terracon-qa_BKP.tar.gz...');
          const resWeb = await ssh.execCommand('tar -czf /var/www/html/lg-terracon-qa_BKP.tar.gz -C /var/www/html/lg-terracon-qa .');
          if (resWeb.code === 0) {
            console.log('✅ Respaldo Web App QA creado con éxito.');
          } else {
            console.warn(`⚠️ Advertencia al respaldar Web App QA: ${resWeb.stderr}`);
          }
        } else {
          console.log('ℹ️ Directorio lg-terracon-qa vacío, se omite respaldo.');
        }
      }

      if (!webOnly) {
        const checkPwa = await ssh.execCommand('ls -A /var/www/html/pwa-terracon-qa');
        if (checkPwa.stdout.trim() !== '') {
          console.log('📦 Generando /var/www/html/pwa-terracon-qa_BKP.tar.gz...');
          const resPwa = await ssh.execCommand('tar -czf /var/www/html/pwa-terracon-qa_BKP.tar.gz -C /var/www/html/pwa-terracon-qa .');
          if (resPwa.code === 0) {
            console.log('✅ Respaldo PWA QA creado con éxito.');
          } else {
            console.warn(`⚠️ Advertencia al respaldar PWA QA: ${resPwa.stderr}`);
          }
        } else {
          console.log('ℹ️ Directorio pwa-terracon-qa vacío, se omite respaldo.');
        }
      }
    }

    // 2) Limpiar y subir Web App
    if (!pwaOnly) {
      console.log(`\n📦 Procesando Web App (Vite)...`);
      if (!fs.existsSync(localWebDist)) {
        throw new Error(`Directorio local de compilación Web no encontrado: ${localWebDist}. Corre npm run build en lg-terracon-main.`);
      }

      console.log(`🧹 Limpiando directorio remoto: ${envConfig.webRemote}...`);
      await ssh.execCommand(`rm -rf ${envConfig.webRemote}/*`);

      console.log(`⬆️  Subiendo Web App (${localWebDist} -> ${envConfig.webRemote})...`);
      await ssh.putDirectory(localWebDist, envConfig.webRemote, {
        recursive: true,
        concurrency: 15
      });
      console.log('✅ Web App desplegada correctamente.');
    }

    // 3) Limpiar y subir PWA
    if (!webOnly) {
      console.log(`\n📦 Procesando PWA (Vue CLI)...`);
      if (!fs.existsSync(localPwaDist)) {
        throw new Error(`Directorio local de compilación PWA no encontrado: ${localPwaDist}. Corre npm run build en terracon-pwa.`);
      }

      console.log(`🧹 Limpiando directorio remoto: ${envConfig.pwaRemote}...`);
      await ssh.execCommand(`rm -rf ${envConfig.pwaRemote}/*`);

      console.log(`⬆️  Subiendo PWA (${localPwaDist} -> ${envConfig.pwaRemote})...`);
      await ssh.putDirectory(localPwaDist, envConfig.pwaRemote, {
        recursive: true,
        concurrency: 15
      });
      console.log('✅ PWA desplegada correctamente.');
    }

    console.log(`\n🎉 Despliegue completado con éxito para ${env.toUpperCase()}!`);
  } catch (err) {
    console.error('\n❌ ERROR EN DESPLIEGUE:', err.message || err);
    process.exit(1);
  } finally {
    ssh.dispose();
  }
}

deploy();
