import fs from 'fs';

const content = fs.readFileSync('src/components/seguridad/VerificationTab.vue', 'utf8');
const lines = content.split('\n');

lines.forEach((line, idx) => {
  if (line.includes('href') || line.includes('target=') || line.includes('pdf') || line.includes('open-in-new')) {
    console.log(`Line ${idx + 1}: ${line.trim()}`);
  }
});
console.log('Search finished.');
