import axios from 'axios';

async function run() {
  try {
    const url = 'https://servidor.leanglobal.cl/lg-terracon-qa/excel_observations.json';
    console.log(`GET ${url}`);
    const res = await axios.get(url);
    const item49 = res.data.find(x => String(x.num) === '49');
    console.log('Item 49 in deployed excel_observations.json:');
    console.log(JSON.stringify(item49, null, 2));
  } catch (err) {
    console.error('Error fetching deployed json:', err.message || err);
  }
}

run();
