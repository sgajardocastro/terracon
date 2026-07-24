import fs from 'fs';
import path from 'path';

const roots = [
  'D:\\SGajardo\\Google Drive\\Antigravity\\terracon-pwa'
];

function searchFiles(dir) {
  if (!fs.existsSync(dir)) return;
  let items;
  try {
    items = fs.readdirSync(dir);
  } catch (e) {
    return;
  }
  
  for (const item of items) {
    if (item === 'node_modules' || item === 'dist' || item === '.git' || item === '.antigravity' || item === '.gemini') continue;
    const fullPath = path.join(dir, item);
    let stat;
    try {
      stat = fs.statSync(fullPath);
    } catch (e) {
      continue;
    }
    
    if (stat.isDirectory()) {
      searchFiles(fullPath);
    } else if (item.endsWith('.js') || item.endsWith('.mjs') || item.endsWith('.json') || item.endsWith('.vue') || item.endsWith('.md')) {
      try {
        const content = fs.readFileSync(fullPath, 'utf-8');
        if (content.includes('4094') || content.includes('4100')) {
          console.log(`Encontrado en: ${fullPath}`);
          const lines = content.split('\n');
          lines.forEach((line, idx) => {
            if (line.includes('4094') || line.includes('4100')) {
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

roots.forEach(root => {
  console.log(`Buscando "4094" o "4100" en ${root}...`);
  searchFiles(root);
});
