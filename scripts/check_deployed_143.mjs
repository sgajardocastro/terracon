import axios from 'axios';

async function run() {
  try {
    const url = 'https://servidor.leanglobal.cl/lean-services-qa/api/observaciones';
    console.log(`GET ${url}`);
    const res = await axios.get(url);
    const item143 = res.data.find(x => String(x.template_id) === '143');
    console.log('Template 143 details in database:');
    console.log(JSON.stringify(item143, null, 2));
  } catch (err) {
    console.error('Error:', err.message || err);
  }
}

run();
