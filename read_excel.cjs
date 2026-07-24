const XLSX = require('xlsx');
const path = require('path');

const filePath = path.join(__dirname, '..', 'PKS Servidumbre y Camara.xlsx');
console.log('Reading file:', filePath);

try {
  const workbook = XLSX.readFile(filePath);
  console.log('Sheet Names:', workbook.SheetNames);
  
  workbook.SheetNames.forEach(sheetName => {
    console.log(`\n--- Sheet: ${sheetName} ---`);
    const worksheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
    console.log(`Total rows: ${data.length}`);
    console.log('Headers:', data[0]);
    console.log('Sample rows (next 10):');
    data.slice(1, 11).forEach((row, index) => {
      console.log(`Row ${index + 1}:`, row);
    });
  });
} catch (e) {
  console.error('Error reading excel:', e);
}
