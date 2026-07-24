import axios from 'axios';

async function run() {
  try {
    const url = 'https://servidor.leanglobal.cl/lean-services-qa/api/observaciones';
    console.log(`Sending GET request to: ${url}`);
    
    const res = await axios.get(url);
    console.log('Response Status:', res.status);
    console.log('Is Array:', Array.isArray(res.data));
    console.log('Response Items Count:', res.data.length);
    
    const item74 = res.data.find(x => String(x.template_id) === '74');
    console.log('Template 74 details inside database payload:');
    console.log(JSON.stringify(item74, null, 2));

  } catch (err) {
    console.error('Error fetching deployed endpoint:', err.message || err);
  }
}

run();
