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
    
    // 1. Read workbook.xml to map sheet names to sheet IDs
    const workbookXml = await zip.file('xl/workbook.xml').async('string');
    // Regex to find sheet name and its sheetId / relationship id
    const sheetMatches = [...workbookXml.matchAll(/<sheet name="([^"]+)" sheetId="([^"]+)"[^>]*r:id="([^"]+)"/g)];
    
    console.log('--- MAPA DE HOJAS ---');
    sheetMatches.forEach(m => {
      console.log(`Sheet Name: "${m[1]}", ID: ${m[2]}, Rel ID: ${m[3]}`);
    });

    const targetSheet = sheetMatches.find(m => m[1].trim() === 'Rev. 5 Junio 2026');
    if (!targetSheet) {
      console.error('❌ Hoja no encontrada');
      return;
    }

    // Map Rel ID to sheet file name in xl/_rels/workbook.xml.rels
    const relsXml = await zip.file('xl/_rels/workbook.xml.rels').async('string');
    const relMatch = relsXml.match(new RegExp(`Id="${targetSheet[3]}"[^>]*Target="([^"]+)"`));
    if (!relMatch) {
      console.error('❌ Relación no encontrada');
      return;
    }
    const sheetFile = 'xl/' + relMatch[1];
    console.log(`✅ Hoja mapeada al archivo: "${sheetFile}"`);

    // 2. Read sheet XML
    const sheetXml = await zip.file(sheetFile).async('string');

    // 3. Read styles.xml to inspect fills
    const stylesXml = await zip.file('xl/styles.xml').async('string');
    
    // We want to find fills. Fills are listed in <fills> tag.
    const fillsMatch = stylesXml.match(/<fills count="(\d+)">([\s\S]+?)<\/fills>/);
    const fills = [];
    if (fillsMatch) {
      const fillMatches = [...fillsMatch[2].matchAll(/<fill>([\s\S]+?)<\/fill>/g)];
      fillMatches.forEach((f, idx) => {
        // Look for rgb color or theme color
        const rgbMatch = f[1].match(/<fgColor rgb="([^"]+)"/);
        fills.push({
          index: idx,
          rgb: rgbMatch ? rgbMatch[1] : null,
          xml: f[1]
        });
      });
    }

    // We also want to find cellXfs (style formats) that map to these fills
    const cellXfsMatch = stylesXml.match(/<cellXfs count="(\d+)">([\s\S]+?)<\/cellXfs>/);
    const styleFmtToFill = [];
    if (cellXfsMatch) {
      const xfMatches = [...cellXfsMatch[2].matchAll(/<xf[^>]*fillId="(\d+)"[^>]*>/g)];
      xfMatches.forEach((x, idx) => {
        styleFmtToFill.push({
          styleIndex: idx,
          fillId: parseInt(x[1], 10)
        });
      });
    }

    // 4. Find cells in Column A or B or C with fill styles
    // In sheet XML, cells are represented by <c r="A3" s="4"> ... </c>
    const cellMatches = [...sheetXml.matchAll(/<c r="([A-Z]+)(\d+)"[^>]*s="(\d+)"/g)];
    const greenRows = new Set();
    const cellColors = {};

    cellMatches.forEach(c => {
      const col = c[1];
      const row = parseInt(c[2], 10);
      const styleIdx = parseInt(c[3], 10);

      const mapping = styleFmtToFill.find(s => s.styleIndex === styleIdx);
      if (mapping) {
        const fill = fills[mapping.fillId];
        if (fill && fill.rgb) {
          // Normal Excel green is: C6EFCE (light green fill) or similar
          // Let's print any colored cells
          const colorHex = fill.rgb;
          cellColors[row] = colorHex;
          
          // Let's check if it matches a green hex. 
          // Standard Excel light green hex: "FFC6EFCE" or "C6EFCE" (fill) and font color "FF006100"
          // Let's list any color that has green characteristics:
          // e.g. "C6EFCE", "E2EFDA", "C6EFCE" (default success fill)
          if (colorHex.includes('C6EFCE') || colorHex.includes('E2EFDA') || colorHex.includes('A9D08E')) {
            greenRows.add(row);
          }
        }
      }
    });

    console.log('\n--- DETECTADAS CELDAS CON COLOR ---');
    console.log(cellColors);

    console.log('\n--- FILAS CON FONDO VERDE DETECTADAS (EXCEL ROW NUMBERS) ---');
    console.log(Array.from(greenRows).sort((a, b) => a - b));

  } catch (err) {
    console.error('❌ Error:', err.message);
  }
}

main();
