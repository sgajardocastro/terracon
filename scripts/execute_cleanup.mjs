import { NodeSSH } from 'node-ssh';

const ssh = new NodeSSH();

async function runCommand(cmd) {
  console.log(`Running: ${cmd}`);
  const res = await ssh.execCommand(cmd);
  if (res.stderr && !res.stdout) {
    console.error(`Error: ${res.stderr}`);
  }
  return res.stdout || '';
}

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

    // 1. Crear directorio de backups en CentOS
    console.log('\n📂 [1/5] Creando directorio de backups...');
    await runCommand('mkdir -p /home/nodeadmin/backups');

    // 2. Ejecutar pg_dump físico
    console.log('\n📦 [2/5] Ejecutando pg_dump de sch_leansurvey_qa...');
    const dumpCmd = "export PGPASSWORD='pass_qa_123' && pg_dump -h localhost -U usr_qa -d postgres -n sch_leansurvey_qa -F c -b -v -f /home/nodeadmin/backups/sch_leansurvey_qa_PRE_CLEANUP_20260701.dump";
    await runCommand(dumpCmd);

    // 3. Crear tablas espejo de respaldo locales (Snapshots en Postgres)
    console.log('\n📸 [3/5] Creando tablas espejo de respaldo...');
    await runQuery(`
      CREATE TABLE sch_leansurvey_qa.tsec_users_BKP_20260701 AS SELECT * FROM sch_leansurvey_qa.tsec_users;
      CREATE TABLE sch_leansurvey_qa.tpar_empresas_BKP_20260701 AS SELECT * FROM sch_leansurvey_qa.tpar_empresas;
      CREATE TABLE sch_leansurvey_qa.tpry_proyecto_BKP_20260701 AS SELECT * FROM sch_leansurvey_qa.tpry_proyecto;
      CREATE TABLE sch_leansurvey_qa.tsrv_survey_BKP_20260701 AS SELECT * FROM sch_leansurvey_qa.tsrv_survey;
      CREATE TABLE sch_leansurvey_qa.tpry_equipo_proyecto_BKP_20260701 AS SELECT * FROM sch_leansurvey_qa.tpry_equipo_proyecto;
      CREATE TABLE sch_leansurvey_qa.tpry_equipo_miembro_BKP_20260701 AS SELECT * FROM sch_leansurvey_qa.tpry_equipo_miembro;
    `);

    // 4. Ejecutar script SQL de limpieza transaccional
    console.log('\n🧹 [4/5] Ejecutando script SQL de limpieza transaccional...');
    const cleanupSql = `
      BEGIN;

      -- A. Reasignación de Actividad del Usuario JTRR1 (ID 34) a SUP2 (ID 58)
      UPDATE sch_leansurvey_qa.tsrv_survey 
      SET id_user_creacion = 58 
      WHERE id_user_creacion = 34;

      -- B. Eliminación en Cascada de Proyectos Obsoletos (2, 4, 5, 7)
      DELETE FROM sch_leansurvey_qa.tsrv_survey 
      WHERE id_proyecto IN (2, 4, 5, 7);

      DELETE FROM sch_leansurvey_qa.tpry_equipo_miembro 
      WHERE id_equipo_proyecto IN (
          SELECT id_equipo_proyecto 
          FROM sch_leansurvey_qa.tpry_equipo_proyecto 
          WHERE id_proyecto IN (2, 4, 5, 7)
      );

      DELETE FROM sch_leansurvey_qa.tpry_equipo_proyecto 
      WHERE id_proyecto IN (2, 4, 5, 7);

      DELETE FROM sch_leansurvey_qa.tpry_gantt_tarea_v3 WHERE id_proyecto IN (2, 4, 5, 7);
      DELETE FROM sch_leansurvey_qa.tpry_gantt_tarea_v2 WHERE id_proyecto IN (2, 4, 5, 7);
      DELETE FROM sch_leansurvey_qa.tpry_gantt_tarea_v2_bak WHERE id_proyecto IN (2, 4, 5, 7);
      DELETE FROM sch_leansurvey_qa.tpry_gantt WHERE id_proyecto IN (2, 4, 5, 7);

      DELETE FROM sch_leansurvey_qa.tpry_proyecto 
      WHERE id_proyecto IN (2, 4, 5, 7);

      -- C. Depuración de Usuarios Obsoletos
      DELETE FROM sch_leansurvey_qa.tsec_user_roles 
      WHERE id_user IN (
          SELECT id_user FROM sch_leansurvey_qa.tsec_users 
          WHERE email IN (
              'sup1@terracon.cl', 'jtrr2@terracon.cl', 'adco2@terracon.cl', 
              'ito2@terracon.cl', 'user.1@terracon.cl', 'jtrr1@terracon.cl', 
              'adco1@terracon.cl', 'luis.iturra@gmail.com'
          ) 
          OR id_empresa = 1
      );

      DELETE FROM sch_leansurvey_qa.tsec_users 
      WHERE email IN (
          'sup1@terracon.cl', 'jtrr2@terracon.cl', 'adco2@terracon.cl', 
          'ito2@terracon.cl', 'user.1@terracon.cl', 'jtrr1@terracon.cl', 
          'adco1@terracon.cl', 'luis.iturra@gmail.com'
      ) 
      OR id_empresa = 1;

      -- D. Depuración de Empresas
      DELETE FROM sch_leansurvey_qa.tpar_empresas 
      WHERE id_empresa IN (1, 5, 8);

      COMMIT;
    `;
    await runQuery(cleanupSql);

    // 5. Verificar Integridad
    console.log('\n📊 [5/5] Verificando integridad de los datos...');
    
    const projects = await runQuery("SELECT id_proyecto, nombre_proyecto FROM sch_leansurvey_qa.tpry_proyecto;");
    console.log('\nProyectos restantes en QA:');
    projects.forEach(p => console.log(`- ID: ${p[0]} | Nombre: ${p[1]}`));

    const companies = await runQuery("SELECT id_empresa, name_empresa FROM sch_leansurvey_qa.tpar_empresas;");
    console.log('\nEmpresas restantes en QA:');
    companies.forEach(c => console.log(`- ID: ${c[0]} | Nombre: ${c[1]}`));

    const metrogasSurveys = await runQuery("SELECT COUNT(*) FROM sch_leansurvey_qa.tsrv_survey WHERE id_proyecto = 3;");
    console.log(`\nSurveys totales para Metrogas (ID 3): \${metrogasSurveys[0][0]} (Deberían ser 1811)`);

    const deletedUserCheck = await runQuery(`
      SELECT COUNT(*) FROM sch_leansurvey_qa.tsec_users 
      WHERE email IN ('sup1@terracon.cl', 'jtrr2@terracon.cl', 'adco2@terracon.cl', 'ito2@terracon.cl', 'user.1@terracon.cl', 'jtrr1@terracon.cl', 'adco1@terracon.cl', 'luis.iturra@gmail.com')
    `);
    console.log(`Usuarios de la lista negra restantes: \${deletedUserCheck[0][0]} (Deberían ser 0)`);

    console.log('\n🎉 ¡Limpieza completada con éxito!');
    ssh.dispose();

  } catch (err) {
    console.error('❌ Error durante la limpieza:', err);
    ssh.dispose();
  }
}
main();
