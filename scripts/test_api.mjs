import axios from 'axios';

async function test() {
  try {
    const res = await axios.get('https://servidor.leanglobal.cl/lean-services-qa/api/servicio/leanglobal/procesosSurveyDetail?id_survey=4476');
    console.log("RESPONSE:", JSON.stringify(res.data, null, 2));
  } catch (e) {
    console.error("ERROR:", e.message);
  }
}

test();
