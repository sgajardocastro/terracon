import fs from 'fs';
import path from 'path';

const srcDir = 'D:\\SGajardo\\Google Drive\\Antigravity\\terracon-pwa\\lg-terracon-main\\src';

function searchFiles(dir) {
  if (!fs.existsSync(dir)) return;
  const items = fs.readdirSync(dir);
  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      searchFiles(fullPath);
    } else if (item.endsWith('.js') || item.endsWith('.vue') || item.endsWith('.mjs')) {
      try {
        const content = fs.readFileSync(fullPath, 'utf-8');
        if (content.includes('/survey') || content.includes('crearSurvey') || content.includes('UpdSurveyEstado')) {
          console.log(`Encontrado en: ${fullPath}`);
          const lines = content.split('\n');
          lines.forEach((line, idx) => {
            if (line.includes('/survey') || line.includes('crearSurvey') || line.includes('UpdSurveyEstado') || line.includes('axios')) {
              console.log(`  Línea ${idx + 1}: ${line.trim().slice(0, 150)}`);
            }
          });
        }
      } catch (e) {
        // Ignorar
      }
    }
  }
}

console.log('Buscando llamadas a API /survey en frontend...');
searchFiles(srcDir);
