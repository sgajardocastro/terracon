import { NodeSSH } from 'node-ssh';

const ssh = new NodeSSH();

async function run() {
  try {
    await ssh.connect({
      host: 'servidor.leanglobal.cl',
      port: 1295,
      username: 'root',
      password: 'lgbl2025.'
    });

    const query = `
      SELECT id_tarea, id_tarea_padre, codigo_edt, nombre_tarea 
      FROM sch_leansurvey_dev.tpry_gantt_tarea_v3 
      WHERE id_proyecto = 1 AND (id_tarea_padre = 191 OR codigo_edt LIKE '1.4%')
      ORDER BY codigo_edt;
    `;

    const res = await ssh.execCommand(`PGPASSWORD=pass_dev_123 psql -h localhost -U usr_dev -d postgres -c "${query}"`);
    console.log(res.stdout);
  } catch (err) {
    console.error(err);
  } finally {
    ssh.dispose();
  }
}

run();
