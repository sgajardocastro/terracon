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

    console.log('🔄 Renombrando equipos existentes en Metrogas (Proyecto ID 3)...');
    await runQuery(`
      UPDATE sch_leansurvey_qa.tpry_equipo_proyecto SET nombre_equipo = 'Equipo-DCSOLUTIONS' WHERE id_equipo_proyecto = 11;
      UPDATE sch_leansurvey_qa.tpry_equipo_proyecto SET nombre_equipo = 'Equipo-INPROAS' WHERE id_equipo_proyecto = 12;
      UPDATE sch_leansurvey_qa.tpry_equipo_proyecto SET nombre_equipo = 'Equipo-MACRI' WHERE id_equipo_proyecto = 13;
    `);

    const newTeams = [
      { name: 'Equipo-CEMACO', companyId: 11 },
      { name: 'Equipo-ACUÑA', companyId: 13 },
      { name: 'Equipo-MJ', companyId: 15 },
      { name: 'Equipo-CYPCON', companyId: 12 },
      { name: 'Equipo-Terracon', companyId: null } // Terracon is ID 2, but we assign manually
    ];

    console.log('🛠️ Creando equipos faltantes si no existen...');
    for (const team of newTeams) {
      const exists = await runQuery(`
        SELECT id_equipo_proyecto FROM sch_leansurvey_qa.tpry_equipo_proyecto 
        WHERE id_proyecto = 3 AND nombre_equipo = '${team.name}'
      `);
      
      let teamId;
      if (exists.length > 0) {
        teamId = exists[0][0];
        console.log(`- ${team.name} ya existe (ID: ${teamId})`);
      } else {
        const insertRes = await runQuery(`
          INSERT INTO sch_leansurvey_qa.tpry_equipo_proyecto (nombre_equipo, id_proyecto, estado_equipo)
          VALUES ('${team.name}', 3, true)
          RETURNING id_equipo_proyecto;
        `);
        teamId = insertRes[0][0];
        console.log(`- ${team.name} creado (ID: ${teamId})`);
      }
      team.id_equipo_proyecto = teamId;
    }

    console.log('👤 Enrolando miembros activos a sus respectivos equipos...');
    
    // Subcontratistas
    for (const team of newTeams) {
      if (team.companyId) {
        // Obtener todos los usuarios de esta subcontratista
        const users = await runQuery(`
          SELECT id_user FROM sch_leansurvey_qa.tsec_users 
          WHERE id_empresa = ${team.companyId}
        `);
        
        console.log(`Enrolando ${users.length} usuarios para ${team.name}...`);
        for (const userRow of users) {
          const userId = userRow[0];
          // Validar si ya está enrolado en este equipo
          const memberExists = await runQuery(`
            SELECT id_user FROM sch_leansurvey_qa.tpry_equipo_miembro 
            WHERE id_equipo_proyecto = ${team.id_equipo_proyecto} AND id_user = ${userId}
          `);
          
          if (memberExists.length === 0) {
            await runQuery(`
              INSERT INTO sch_leansurvey_qa.tpry_equipo_miembro (id_equipo_proyecto, id_user, activo)
              VALUES (${team.id_equipo_proyecto}, ${userId}, true)
            `);
          } else {
            await runQuery(`
              UPDATE sch_leansurvey_qa.tpry_equipo_miembro 
              SET activo = true 
              WHERE id_equipo_proyecto = ${team.id_equipo_proyecto} AND id_user = ${userId}
            `);
          }
        }
      }
    }

    // Enrolar usuarios Terracon involucrados
    const terraconTeam = newTeams.find(t => t.name === 'Equipo-Terracon');
    const terraconUsers = [
      58, // SUP2@terracon.cl
      49, // kcastillo@terracon.cl
      57, // ytenorio@terracon.cl
      277, // afierro@terracon.cl
      260, // fjara@terracon.cl
      275, // kflores@terracon.cl
      263  // mauricioocavieresr@gmail.com
    ];

    console.log(`Enrolando ${terraconUsers.length} usuarios Terracon involucrados a ${terraconTeam.name}...`);
    for (const userId of terraconUsers) {
      const memberExists = await runQuery(`
        SELECT id_user FROM sch_leansurvey_qa.tpry_equipo_miembro 
        WHERE id_equipo_proyecto = ${terraconTeam.id_equipo_proyecto} AND id_user = ${userId}
      `);
      
      if (memberExists.length === 0) {
        await runQuery(`
          INSERT INTO sch_leansurvey_qa.tpry_equipo_miembro (id_equipo_proyecto, id_user, activo)
          VALUES (${terraconTeam.id_equipo_proyecto}, ${userId}, true)
        `);
      } else {
        await runQuery(`
          UPDATE sch_leansurvey_qa.tpry_equipo_miembro 
          SET activo = true 
          WHERE id_equipo_proyecto = ${terraconTeam.id_equipo_proyecto} AND id_user = ${userId}
        `);
      }
    }

    console.log('\n🎉 ¡Estructura de equipos y membresías configurada correctamente!');
    ssh.dispose();

  } catch (err) {
    console.error('❌ Error durante la configuración:', err);
    ssh.dispose();
  }
}

main();
