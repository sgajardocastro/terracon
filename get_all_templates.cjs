const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'database_templates.json');
if (!fs.existsSync(filePath)) {
  console.error('File not found:', filePath);
  process.exit(1);
}

const templates = JSON.parse(fs.readFileSync(filePath, 'utf8'));

const areas = {};
templates.forEach(t => {
  const area = t.area_nombre || 'Sin Area';
  if (!areas[area]) {
    areas[area] = {};
  }
  const fam = `${t.familia_id} - ${t.familia_nombre} (${t.familia_codigo})`;
  if (!areas[area][fam]) {
    areas[area][fam] = [];
  }
  areas[area][fam].push({
    id: t.template_id,
    nombre: t.template_nombre,
    codigo: t.template_codigo
  });
});

for (const [area, fams] of Object.entries(areas)) {
  console.log(`\n================ AREA: ${area} ================`);
  for (const [fam, temps] of Object.entries(fams)) {
    console.log(`  📁 Familia: ${fam} (${temps.length} templates)`);
    temps.forEach(t => {
      console.log(`    - ID [${t.id}] | ${t.nombre} | Code: ${t.codigo}`);
    });
  }
}
