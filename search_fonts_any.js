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
    
    // Find all <font>...</font> elements
    const matches = [...stylesXml.matchAll(/<font>([\s\S]+?)<\/font>/g)];
    console.log(`Total fonts found: ${matches.length}`);
    matches.forEach((m, idx) => {
      console.log(`Font ${idx}: ${m[0]}`);
    });
  } catch (err) {
    console.error('Error:', err.message);
  }
}

main();
