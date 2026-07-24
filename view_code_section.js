import fs from 'fs';

const filePath = 'd:/SGajardo/Google Drive/Antigravity/terracon-pwa/src/views/Ppd2View.vue';
const content = fs.readFileSync(filePath, 'utf-8');
const lines = content.split('\n');

const startLine = 2720;
const endLine = 2840;

for (let i = startLine - 1; i < endLine; i++) {
  console.log(`${i + 1}: ${lines[i]}`);
}
