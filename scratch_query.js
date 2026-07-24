import fs from 'fs';

const p1 = 'd:/SGajardo/Google Drive/Antigravity/terracon-pwa/lg-terracon-main/public/excel_observations.json';
const p2 = 'd:/SGajardo/Google Drive/Antigravity/terracon-pwa/lg-terracon-main/src/assets/excel_observations.json';

console.log('--- LOCAL PUBLIC JSON ---');
console.log(JSON.parse(fs.readFileSync(p1, 'utf8')).find(o => String(o.num) === '42'));

console.log('--- LOCAL ASSETS JSON ---');
console.log(JSON.parse(fs.readFileSync(p2, 'utf8')).find(o => String(o.num) === '42'));
