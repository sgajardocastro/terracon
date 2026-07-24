const XLSX = require('xlsx');
const path = require('path');
const filePath = path.join(__dirname, '..', 'PKS Servidumbre y Camara.xlsx');

try {
  const workbook = XLSX.readFile(filePath);
  workbook.SheetNames.forEach(sheetName => {
    console.log(`\n================ SHEET: ${sheetName} ================`);
    const worksheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' });
    console.log(`Total rows: ${data.length}`);
    data.slice(0, 40).forEach((row, index) => {
      console.log(`Row ${index + 1}:`, row.join(' | '));
    });
  });
} catch (e) {
  console.error('Error:', e);
}
