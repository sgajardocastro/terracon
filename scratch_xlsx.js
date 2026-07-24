import XLSX from 'xlsx';

function main() {
  const workbook = XLSX.readFile('Rev. Lean Global 20260623.xlsx');
  
  workbook.SheetNames.forEach(sheetName => {
    const sheet = workbook.Sheets[sheetName];
    const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 });
    rows.forEach((row, rIdx) => {
      row.forEach((cell, cIdx) => {
        if (cell && typeof cell === 'string' && cell.includes('decide transitar')) {
          console.log(`Found "decide transitar" in "${sheetName}" at row ${rIdx}, col ${cIdx}: "${cell}"`);
          // Print surrounding rows
          console.log('--- Row:', row);
        }
      });
    });
  });
}
main();
