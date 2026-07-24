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

    // Find all cell styles in styles.xml
    const stylesXml = await zip.file('xl/styles.xml').async('string');
    const cellXfs = [];
    const xfsBlock = stylesXml.match(/<cellXfs count="(\d+)">([\s\S]+?)<\/cellXfs>/);
    if (xfsBlock) {
      const xfMatches = [...xfsBlock[2].matchAll(/<xf([^>]+)>/g)];
      xfMatches.forEach((x, idx) => {
        const fontIdMatch = x[1].match(/fontId="(\d+)"/);
        const fillIdMatch = x[1].match(/fillId="(\d+)"/);
        cellXfs.push({
          styleIndex: idx,
          fontId: fontIdMatch ? parseInt(fontIdMatch[1], 10) : null,
          fillId: fillIdMatch ? parseInt(fillIdMatch[1], 10) : null
        });
      });
    }

    // Let's loop through rows and look at cell format of Column C
    const rowMatches = [...sheetXml.matchAll(/<row r="(\d+)"[^>]*>([\s\S]+?)<\/row>/g)];
    const results = [];

    rowMatches.forEach(rm => {
      const rowNum = parseInt(rm[1], 10);
      const rowXml = rm[2];

      // Find cell in column A (N°)
      const cellAMatch = rowXml.match(/<c r="A\d+"[^>]*s="(\d+)"[^>]*>([\s\S]+?)<\/c>/);
      const cellCMatch = rowXml.match(/<c r="C\d+"[^>]*s="(\d+)"[^>]*>([\s\S]+?)<\/c>/);

      if (cellAMatch && cellCMatch) {
        const nValueMatch = cellAMatch[2].match(/<v>(\d+)<\/v>/);
        const num = nValueMatch ? parseInt(nValueMatch[1], 10) : null;
        
        const cStyle = parseInt(cellCMatch[1], 10);
        const xf = cellXfs[cStyle] || {};

        results.push({
          excelRow: rowNum,
          num: num,
          cStyle: cStyle,
          fontId: xf.fontId,
          fillId: xf.fillId
        });
      }
    });

    console.log('=== ESTILOS DE COLUMNA C EN TODAS LAS FILAS ===');
    console.log(JSON.stringify(results, null, 2));

  } catch (err) {
    console.error('Error:', err.message);
  }
}

main();
