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
    
    // Parse fills
    const fillsBlock = stylesXml.match(/<fills count="(\d+)">([\s\S]+?)<\/fills>/);
    const fills = [];
    if (fillsBlock) {
      const fillMatches = [...fillsBlock[2].matchAll(/<fill>([\s\S]+?)<\/fill>/g)];
      fillMatches.forEach((f, idx) => {
        fills.push({ index: idx, content: f[1].trim() });
      });
    }

    // Parse cellXfs
    const xfsBlock = stylesXml.match(/<cellXfs count="(\d+)">([\s\S]+?)<\/cellXfs>/);
    const cellXfs = [];
    if (xfsBlock) {
      const xfMatches = [...xfsBlock[2].matchAll(/<xf([^>]+)>/g)];
      xfMatches.forEach((x, idx) => {
        const fillIdMatch = x[1].match(/fillId="(\d+)"/);
        const fillId = fillIdMatch ? parseInt(fillIdMatch[1], 10) : null;
        cellXfs.push({ styleIndex: idx, fillId, raw: x[1].trim() });
      });
    }

    console.log('=== FILLS ===');
    console.log(fills);

    console.log('\n=== CELL XFS ===');
    console.log(cellXfs);

  } catch (err) {
    console.error('Error:', err.message);
  }
}

main();
