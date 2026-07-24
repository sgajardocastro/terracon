import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Roots
const webRoot = path.dirname(__dirname); // lg-terracon-main
const pwaRoot = path.dirname(webRoot); // terracon-pwa

const env = process.argv[2];
if (!['dev', 'qa', 'prod'].includes(env)) {
  console.error('Uso: node build_local.mjs [dev|qa|prod]');
  process.exit(1);
}

function build() {
  const localWebDist = path.join(webRoot, 'dist');
  const localPwaDist = path.join(pwaRoot, 'dist');

  console.log(`🚀 Iniciando compilación LOCAL para ambiente: ${env.toUpperCase()}`);

  try {
    // 1) Alternar variables de entorno
    console.log(`\n⚙️ Seteando variables de entorno para ${env.toUpperCase()}...`);
    const switchScript = path.join(pwaRoot, 'scripts', 'switch-env.mjs');
    execSync(`node "${switchScript}" ${env}`, { stdio: 'inherit' });

    // 2) Compilar Web App (Vite)
    console.log('\n🏗️ Compilando Web App (Vite)...');
    if (fs.existsSync(localWebDist)) {
      fs.rmSync(localWebDist, { recursive: true, force: true });
    }
    execSync('npm run build', { cwd: webRoot, stdio: 'inherit' });

    // 3) Compilar PWA (Vue CLI)
    console.log('\n🏗️ Compilando PWA (Vue CLI)...');
    try {
      execSync('npm run apk:prepare', { cwd: pwaRoot, stdio: 'inherit' });
    } catch (e) {
      console.warn('⚠️ Advertencia: No se pudo preparar el APK (puede que no exista app-release-signed.apk). Continuando...');
    }
    if (fs.existsSync(localPwaDist)) {
      fs.rmSync(localPwaDist, { recursive: true, force: true });
    }
    execSync('npm run build', { cwd: pwaRoot, stdio: 'inherit' });

    console.log(`\n🎉 Compilación local completada con éxito para ${env.toUpperCase()}!`);
  } catch (err) {
    console.error('\n❌ ERROR EN COMPILACIÓN:', err.message || err);
    process.exit(1);
  }
}

build();
