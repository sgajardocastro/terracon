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
    await ssh.connect({
      host: 'servidor.leanglobal.cl',
      port: 1295,
      username: 'root',
      password: 'lgbl2025.'
    });

    console.log('--- METROGAS USERS ANALYSIS (PROJECT ID 3) ---');
    
    // 1. Members of teams
    const teamMembers = await runQuery(`
      SELECT DISTINCT m.id_user
      FROM sch_leansurvey_qa.tpry_equipo_miembro m 
      JOIN sch_leansurvey_qa.tpry_equipo_proyecto e ON m.id_equipo_proyecto = e.id_equipo_proyecto 
      WHERE e.id_proyecto = 3
    `);
    
    // 2. Leaders of teams
    const teamLeaders = await runQuery(`
      SELECT DISTINCT id_usuario_lider 
      FROM sch_leansurvey_qa.tpry_equipo_proyecto 
      WHERE id_proyecto = 3 AND id_usuario_lider IS NOT NULL
    `);

    // 3. Survey creators in Metrogas (Project 3)
    const surveyCreators = await runQuery(`
      SELECT DISTINCT id_user_creacion 
      FROM sch_leansurvey_qa.tsrv_survey 
      WHERE id_proyecto = 3 AND id_user_creacion IS NOT NULL
    `);

    // 4. Subcontractor users (Empresas 10-16)
    const subContractorUsers = await runQuery(`
      SELECT DISTINCT id_user 
      FROM sch_leansurvey_qa.tsec_users 
      WHERE id_empresa BETWEEN 10 AND 16
    `);

    // Combined unique IDs list
    const allIds = new Set([
      ...teamMembers.map(r => r[0]),
      ...teamLeaders.map(r => r[0]),
      ...surveyCreators.map(r => r[0]),
      ...subContractorUsers.map(r => r[0])
    ]);

    console.log(`Team Members count: ${teamMembers.length}`);
    console.log(`Team Leaders count: ${teamLeaders.length}`);
    console.log(`Survey Creators count: ${surveyCreators.length}`);
    console.log(`Subcontractors count: ${subContractorUsers.length}`);
    console.log(`Total Unique Metrogas project users: ${allIds.size}`);

    // Details of these users
    if (allIds.size > 0) {
      const idsStr = Array.from(allIds).join(',');
      const usersDetails = await runQuery(`
        SELECT u.id_user, u.email, COALESCE((SELECT name_empresa FROM sch_leansurvey_qa.tpar_empresas e WHERE e.id_empresa = u.id_empresa), 'Sin Empresa')
        FROM sch_leansurvey_qa.tsec_users u
        WHERE u.id_user IN (${idsStr})
        ORDER BY u.email;
      `);
      console.log('\n--- DETALLES ---');
      usersDetails.forEach(u => {
        console.log(`ID: ${u[0]} | Email: ${u[1]} | Empresa: ${u[2]}`);
      });
    }

    ssh.dispose();
  } catch (err) {
    console.error(err);
    ssh.dispose();
  }
}
main();
