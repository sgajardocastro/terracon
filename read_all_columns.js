import XLSX from 'xlsx';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const file_path = path.resolve(__dirname, '../Rev. Lean Global 20260623.xlsx');

try {
  const workbook = XLSX.readFile(file_path);
  const targetSheetName = workbook.SheetNames.find(name => name.trim() === 'Rev. 5 Junio 2026');
  const sheet = workbook.Sheets[targetSheetName];
  
  // Convert sheet to raw array of arrays to see ALL cells in their exact positions
  const matrix = XLSX.utils.sheet_to_json(sheet, { header: 1 });
  
  // Let's print rows 1 to 15, showing the raw cells
  console.log('=== PRIMERAS FILAS DE LA MATRIZ DE EXCEL ===');
  matrix.slice(0, 15).forEach((row, idx) => {
    console.log(`Fila ${idx + 1}:`, row);
  });

} catch (err) {
  console.error('Error:', err.message);
}
