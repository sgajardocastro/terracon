import axios from 'axios';

async function run() {
  try {
    const url = 'https://servidor.leanglobal.cl/lean-services-qa/api/servicio/leanglobal/procesosSurveyDetail?id_survey=4086';
    console.log(`GET ${url}`);
    const res = await axios.get(url);
    console.log('Status:', res.status);
    console.log('Data:', JSON.stringify(res.data, null, 2));
  } catch (err) {
    console.error('Error:', err.message || err);
  }
}

run();
