import XLSX from 'xlsx';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const file_path = path.resolve(__dirname, '../Rev. Lean Global 20260623.xlsx');

try {
  // Read workbook with cell styles enabled
  const workbook = XLSX.readFile(file_path, { cellStyles: true, cellFormulas: true });
  const targetSheetName = workbook.SheetNames.find(name => name.trim() === 'Rev. 5 Junio 2026');
  
  if (!targetSheetName) {
    console.error('❌ Hoja no encontrada');
  } else {
    const sheet = workbook.Sheets[targetSheetName];
    
    // Let's inspect some cells in the sheet.
    // The columns are A (N°), B (Tipo), C (Comentarios).
    // Let's loop through rows and look at cell style info (sheet['A1'], sheet['A2'], etc.)
    console.log('=== INSPECCIONANDO ESTILOS DE CELDA ===');
    
    const range = XLSX.utils.decode_range(sheet['!ref']);
    for (let r = range.s.r; r <= range.e.r; r++) {
      const cellRef = XLSX.utils.encode_cell({ r: r, c: 0 }); // Column A (N°)
      const cell = sheet[cellRef];
      if (cell && cell.v !== undefined) {
        console.log(`Fila ${r + 1} (N°: ${cell.v}):`, cell.s ? JSON.stringify(cell.s) : 'sin estilo en cell.s');
      }
    }
  }
} catch (err) {
  console.error('❌ Error:', err.message);
}
