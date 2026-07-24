import fs from 'fs';
import path from 'path';

const roots = [
  'd:/SGajardo/Google Drive/Antigravity/terracon-pwa/lg-terracon-main/src',
  'd:/SGajardo/Google Drive/Antigravity/terracon-pwa/src'
];

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    if (isDirectory) {
      walkDir(dirPath, callback);
    } else {
      callback(dirPath);
    }
  });
}

const matches = [];

roots.forEach(root => {
  if (!fs.existsSync(root)) return;
  walkDir(root, (filePath) => {
    if (!filePath.endsWith('.vue')) return;
    const content = fs.readFileSync(filePath, 'utf8');
    if (content.toLowerCase().includes('protocolos')) {
      // Buscar si tiene chevron o detalle
      const hasChevron = content.toLowerCase().includes('chevron') || content.toLowerCase().includes('expand');
      matches.push({
        file: filePath,
        hasChevron
      });
    }
  });
});

console.log('🔍 ARCHIVOS CON "protocolos" EN EL WORKSPACE:');
console.log(JSON.stringify(matches, null, 2));
