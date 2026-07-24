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
    console.log('✅ SSH connected');

    const sql = `
      INSERT INTO sch_leansurvey_dev.tpry_gantt_tarea_v3 
      (id_gantt, id_proyecto, id_tarea_padre, codigo_edt, nombre_tarea, nivel, unidad, equipos_json, created_at)
      VALUES
      (15, 1, 177, '1.1.6', 'Otros', 3, '', '[]'::jsonb, now()),
      (15, 1, 183, '1.2.2', 'Otros', 3, '', '[]'::jsonb, now()),
      (15, 1, 185, '1.3.6', 'Otros', 3, '', '[]'::jsonb, now()),
      (15, 1, 191, '1.4.2', 'Otros', 3, '', '[]'::jsonb, now()),
      (15, 1, 193, '1.5.6', 'Otros', 3, '', '[]'::jsonb, now()),
      (15, 1, 199, '1.6.2', 'Otros', 3, '', '[]'::jsonb, now()),
      (15, 1, 201, '1.7.2', 'Otros', 3, '', '[]'::jsonb, now()),
      (15, 1, 203, '1.8.6', 'Otros', 3, '', '[]'::jsonb, now()),
      (15, 1, 209, '1.9.2', 'Otros', 3, '', '[]'::jsonb, now())
      ON CONFLICT DO NOTHING;
    `;

    console.log('--- EXECUTING INSERTS ---');
    await ssh.execCommand(`echo "${sql.replace(/"/g, '\\"')}" > /tmp/insert.sql`);
    const res = await ssh.execCommand("PGPASSWORD=pass_dev_123 psql -h localhost -U usr_dev -d postgres -f /tmp/insert.sql");
    console.log('Stdout:', res.stdout);
    console.log('Stderr:', res.stderr);
    console.log('Exit code:', res.code);
    await ssh.execCommand("rm -f /tmp/insert.sql");

  } catch (err) {
    console.error('❌ Error:', err);
  } finally {
    ssh.dispose();
  }
}

run();
