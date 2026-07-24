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
    
    console.log('=== STYLES XML SNIPPET ===');
    console.log(stylesXml.substring(0, 1000));

    console.log('\n=== SHEET CONDITIONAL FORMATTING SEARCH ===');
    const condMatches = [...sheetXml.matchAll(/<conditionalFormatting[\s\S]+?<\/conditionalFormatting>/g)];
    console.log(`Encontradas ${condMatches.length} reglas de formato condicional.`);
    if (condMatches.length > 0) {
      console.log(condMatches[0][0]);
    }

    // Let's search for "fillId" in cells
    console.log('\n=== PRIMERAS CELDAS DEL XML ===');
    const cellSnippet = sheetXml.match(/<sheetData>([\s\S]+?)<\/sheetData>/);
    if (cellSnippet) {
      console.log(cellSnippet[1].substring(0, 1500));
    }

  } catch (err) {
    console.error('❌ Error:', err.message);
  }
}

main();
