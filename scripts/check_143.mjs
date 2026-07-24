import fs from 'fs';

const raw = fs.readFileSync('src/assets/database_templates.json', 'utf8');
const data = JSON.parse(raw);

console.log('Total items in database_templates.json:', data.length);

const found143 = data.filter(t => t.template_id === 143 || String(t.template_id).includes('143'));
console.log('Matches for 143:', JSON.stringify(found143, null, 2));

const foundBrecha = data.filter(t => 
  (t.template_nombre && t.template_nombre.toLowerCase().includes('brecha')) || 
  (t.template_codigo && t.template_codigo.toLowerCase().includes('brecha'))
);
console.log('Matches for brecha:', JSON.stringify(foundBrecha, null, 2));
