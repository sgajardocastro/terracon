import fs from 'fs';

const filePath = 'd:/SGajardo/Google Drive/Antigravity/terracon-pwa/src/views/Ppd2View.vue';
const content = fs.readFileSync(filePath, 'utf-8');
const lines = content.split('\n');

console.log('=== LINES 2500 - 2550 ===');
for (let i = 2499; i < 2550; i++) {
  console.log(`${i + 1}: ${lines[i]}`);
}

console.log('\n=== LINES 4450 - 4480 ===');
for (let i = 4449; i < 4480; i++) {
  console.log(`${i + 1}: ${lines[i]}`);
}
