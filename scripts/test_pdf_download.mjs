import axios from 'axios';

async function run() {
  try {
    const url = 'https://servidor.leanglobal.cl/lean-services-qa/api/archivo/terracon/db759555-c79e-47f5-ac70-f4aadb7ffa7c.pdf';
    console.log(`GET ${url}`);
    const res = await axios.get(url, { responseType: 'arraybuffer' });
    console.log('Status:', res.status);
    console.log('Headers:', res.headers);
    console.log('File size:', res.data.byteLength);
  } catch (err) {
    console.error('Error downloading PDF:', err.message || err);
    if (err.response) {
      console.log('Response status:', err.response.status);
      console.log('Response data:', err.response.data?.toString());
    }
  }
}

run();
