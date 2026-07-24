import fs from 'fs';

const content = fs.readFileSync('src/pages/verSurveyPrint.vue', 'utf8');
const lines = content.split('\n');

lines.forEach((line, idx) => {
  if (line.includes('id_survey') || line.includes('idSurvey')) {
    console.log(`Line ${idx + 1}: ${line.trim()}`);
  }
});
console.log('Search finished.');
