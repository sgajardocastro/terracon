import fs from 'fs';

const raw = fs.readFileSync('public/excel_observations.json', 'utf8');
const data = JSON.parse(raw);

const pending = data.filter(item => {
  // If it doesn't have an evidenceId, or it's not marked isGreen, or pdfOk is not true
  const hasComentarios = item.comentarios && item.comentarios.trim() !== '' && !item.comentarios.toLowerCase().includes('sin observaciones');
  const isResolved = item.isGreen && item.pdfOk && item.evidenceId;
  return hasComentarios && !isResolved;
});

console.log(`Found ${pending.length} pending observations with comments:`);
pending.forEach(p => {
  console.log(`\nRow Num: ${p.num} - Type: ${p.tipo}`);
  console.log(`Comments: ${p.comentarios}`);
  console.log(`Current evidenceId: ${p.evidenceId || 'None'}`);
});
