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
    
    // Find fonts block
    const fontsBlock = stylesXml.match(/<fonts count="(\d+)">([\s\S]+?)<\/fonts>/);
    if (fontsBlock) {
      console.log(`Count of fonts: ${fontsBlock[1]}`);
      const fontMatches = [...fontsBlock[2].matchAll(/<font>([\s\S]+?)<\/font>/g)];
      fontMatches.forEach((f, idx) => {
        console.log(`Font ${idx}:`, f[1].trim().replace(/\s+/g, ' '));
      });
    }
  } catch (err) {
    console.error('Error:', err.message);
  }
}

main();
