import XLSX from 'xlsx';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const file_path = path.resolve(__dirname, '../Rev. Lean Global 20260623.xlsx');
console.log('Leyendo archivo:', file_path);

try {
  const workbook = XLSX.readFile(file_path);
  console.log('Hojas en el libro:', workbook.SheetNames);
  
  // Find a sheet that contains "5 Junio" or matches exactly
  const targetSheetName = workbook.SheetNames.find(name => name.trim() === 'Rev. 5 Junio 2026');
  
  if (!targetSheetName) {
    console.error('❌ No se encontró la hoja con el nombre aproximado a "Rev. 5 Junio 2026"');
  } else {
    console.log(`✅ Leyendo hoja: "${targetSheetName}"`);
    const sheet = workbook.Sheets[targetSheetName];
    const rows = XLSX.utils.sheet_to_json(sheet, { defval: '' });
    console.log(`Número total de filas: ${rows.length}`);
    console.log(JSON.stringify(rows, null, 2));
  }
} catch (err) {
  console.error('❌ Error leyendo Excel:', err.message);
}
