import fs from 'fs';
import path from 'path';
import JSZip from 'jszip';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const file_path = path.resolve(__dirname, '../Rev. Lean Global 20260623.xlsx');

async function main() {
  try {
    const data = fs.readFileSync(file_path);
    const zip = await JSZip.loadAsync(data);
    const stylesXml = await zip.file('xl/styles.xml').async('string');
    
    // Find fills tag
    const fillsBlock = stylesXml.match(/<fills count="(\d+)">([\s\S]+?)<\/fills>/);
    if (fillsBlock) {
      console.log(`Count of fills: ${fillsBlock[1]}`);
      const fillMatches = [...fillsBlock[2].matchAll(/<fill>([\s\S]+?)<\/fill>/g)];
      fillMatches.forEach((f, idx) => {
        console.log(`Fill ${idx}:`, f[1]);
      });
    } else {
      console.log('No fills block found');
    }
  } catch (err) {
    console.error('Error:', err.message);
  }
}

main();
