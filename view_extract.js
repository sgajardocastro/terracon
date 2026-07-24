import fs from 'fs';

const filePath = 'd:/SGajardo/Google Drive/Antigravity/terracon-pwa/src/views/Ppd2View.vue';
const content = fs.readFileSync(filePath, 'utf-8');
const lines = content.split('\n');

const searchTerms = ['extractTaskRowsFromSurvey', 'extractTaskKeysFromSurvey'];

searchTerms.forEach(term => {
  console.log(`\n=== SEARCHING FOR: ${term} ===`);
  let count = 0;
  lines.forEach((line, idx) => {
    if (line.toLowerCase().includes(term.toLowerCase())) {
      count++;
      console.log(`${idx + 1}: ${line.trim()}`);
    }
  });
});
