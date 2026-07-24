import fs from 'fs';
const content = fs.readFileSync('d:/SGajardo/Google Drive/Antigravity/terracon-pwa/src/views/Ppd2View.vue', 'utf-8');
const lines = content.split('\n');
const searchString = 'applyEntryToDraft';
lines.forEach((line, idx) => {
  if (line.includes(searchString)) {
    console.log(`${idx + 1}: ${line.trim()}`);
  }
});
