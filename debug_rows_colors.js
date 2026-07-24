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
    
    const workbookXml = await zip.file('xl/workbook.xml').async('string');
    const sheetMatches = [...workbookXml.matchAll(/<sheet name="([^"]+)" sheetId="([^"]+)"[^>]*r:id="([^"]+)"/g)];
    const targetSheet = sheetMatches.find(m => m[1].trim() === 'Rev. 5 Junio 2026');
    
    const relsXml = await zip.file('xl/_rels/workbook.xml.rels').async('string');
    const relMatch = relsXml.match(new RegExp(`Id="${targetSheet[3]}"[^>]*Target="([^"]+)"`));
    const sheetFile = 'xl/' + relMatch[1];

    const sheetXml = await zip.file(sheetFile).async('string');
    const stylesXml = await zip.file('xl/styles.xml').async('string');
    
    // Find all cell formats (cellXfs) in styles.xml
    const xfsBlock = stylesXml.match(/<cellXfs count="(\d+)">([\s\S]+?)<\/cellXfs>/);
    const cellXfs = [];
    if (xfsBlock) {
      const xfMatches = [...xfsBlock[2].matchAll(/<xf([^>]+)>/g)];
      xfMatches.forEach((x, idx) => {
        const fillIdMatch = x[1].match(/fillId="(\d+)"/);
        const fillId = fillIdMatch ? parseInt(fillIdMatch[1], 10) : null;
        cellXfs.push({ styleIndex: idx, fillId, raw: x[1] });
      });
    }

    // Let's print rows 35 to 45 cell elements
    console.log('=== CELDAS EN FILAS 35 A 45 EN sheet3.xml ===');
    for (let r = 35; r <= 45; r++) {
      const rowRegex = new RegExp(`<row r="${r}"[^>]*>([\\s\\S]+?)<\\/row>`);
      const rowMatch = sheetXml.match(rowRegex);
      if (rowMatch) {
        console.log(`Fila ${r}:`, rowMatch[1].trim());
      }
    }

    // Let's also look at all fills again, perhaps there are more fills in styles.xml?
    const fillsBlock = stylesXml.match(/<fills count="(\d+)">([\s\S]+?)<\/fills>/);
    if (fillsBlock) {
      console.log(`\n=== FILLS IN STYLES.XML (Total: ${fillsBlock[1]}) ===`);
      const fillMatches = [...fillsBlock[2].matchAll(/<fill>([\s\S]+?)<\/fill>/g)];
      fillMatches.forEach((f, idx) => {
        console.log(`Fill ${idx}:`, f[1].trim());
      });
    }

  } catch (err) {
    console.error('Error:', err.message);
  }
}

main();
