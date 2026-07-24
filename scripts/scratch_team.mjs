import axios from 'axios';

async function test() {
  try {
    const res = await axios.get('https://servidor.leanglobal.cl/lean-services-qa/api/servicio/leanglobal/obtenerEquiposProyectosMiembros?id_proyecto=481');
    console.log(JSON.stringify(res.data, null, 2));
  } catch (err) {
    console.error(err.message);
  }
}
test();
