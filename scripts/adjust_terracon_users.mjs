import { NodeSSH } from 'node-ssh';

const ssh = new NodeSSH();

async function runQuery(query) {
  const formattedQuery = query.replace(/"/g, '\\"');
  const cmd = `export PGPASSWORD='pass_qa_123' && psql -h localhost -U usr_qa -d postgres -t -A -F ',' -c "${formattedQuery}"`;
  const res = await ssh.execCommand(cmd);
  if (res.stderr && !res.stdout) {
    throw new Error(res.stderr);
  }
  return res.stdout.trim().split('\n').filter(Boolean).map(line => line.split(','));
}

async function main() {
  try {
    console.log('🔗 Conectando a servidor via SSH...');
    await ssh.connect({
      host: 'servidor.leanglobal.cl',
      port: 1295,
      username: 'root',
      password: 'lgbl2025.'
    });

    console.log('🔄 Ajustando miembros de Equipo-Terracon (ID 18)...');
    // Dejar activo = false en equipo 18 para todos excepto fjara (ID 260) y kflores (ID 275)
    await runQuery(`
      UPDATE sch_leansurvey_qa.tpry_equipo_miembro 
      SET activo = false 
      WHERE id_equipo_proyecto = 18 AND id_user NOT IN (260, 275);
    `);
    console.log('✅ Miembros de Equipo-Terracon ajustados.');

    console.log('❌ Eliminando cuentas de mauriciocavieres de la base de datos...');
    const emailsToDelete = [
      'mauriciocavieresr@gmail.com',
      'mauricioocavieresr@gmail.com'
    ];
    
    const emailsStr = emailsToDelete.map(e => `'${e}'`).join(',');
    
    // 1. Eliminar de tsec_user_roles
    await runQuery(`
      DELETE FROM sch_leansurvey_qa.tsec_user_roles 
      WHERE id_user IN (SELECT id_user FROM sch_leansurvey_qa.tsec_users WHERE LOWER(email) IN (${emailsStr}));
    `);
    
    // 2. Eliminar de tpry_equipo_miembro
    await runQuery(`
      DELETE FROM sch_leansurvey_qa.tpry_equipo_miembro 
      WHERE id_user IN (SELECT id_user FROM sch_leansurvey_qa.tsec_users WHERE LOWER(email) IN (${emailsStr}));
    `);
    
    // 3. Eliminar de tsec_users
    await runQuery(`
      DELETE FROM sch_leansurvey_qa.tsec_users 
      WHERE LOWER(email) IN (${emailsStr});
    `);
    console.log('✅ Cuentas de mauriciocavieres eliminadas.');

    // Verificación
    console.log('\n📊 Verificación de integrantes en Equipo-Terracon:');
    const members = await runQuery(`
      SELECT m.id_user, u.email, m.activo 
      FROM sch_leansurvey_qa.tpry_equipo_miembro m
      JOIN sch_leansurvey_qa.tsec_users u ON m.id_user = u.id_user
      WHERE m.id_equipo_proyecto = 18;
    `);
    members.forEach(m => console.log(`- User ID: ${m[0]} | Email: ${m[1]} | Activo: ${m[2]}`));

    console.log('\n📊 Total usuarios activos en Metrogas (Proyecto ID 3):');
    const totalMetrogas = await runQuery(`
      SELECT COUNT(DISTINCT id_user) FROM sch_leansurvey_qa.tpry_equipo_miembro m 
      JOIN sch_leansurvey_qa.tpry_equipo_proyecto ep ON m.id_equipo_proyecto = ep.id_equipo_proyecto 
      WHERE ep.id_proyecto = 3 AND m.activo = true;
    `);
    console.log(`- Total: ${totalMetrogas[0][0]}`);

    ssh.dispose();
  } catch (err) {
    console.error(err);
    ssh.dispose();
  }
}

main();
