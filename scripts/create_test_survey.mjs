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

    console.log('👤 Enrolando a sgajardoc@gmail.com (ID 327) en el Equipo-Pruebas-Seguridad (ID 19)...');
    await runQuery(`
      INSERT INTO sch_leansurvey_qa.tpry_equipo_miembro (id_equipo_proyecto, id_user, activo)
      VALUES (19, 327, true)
      ON CONFLICT DO NOTHING;
    `);

    console.log('📝 Creando survey borrador para Template 143 (Brecha de Control) bajo Proyecto 9...');
    const insertRes = await runQuery(`
      INSERT INTO sch_leansurvey_qa.tsrv_survey (
        id_template, id_proyecto, id_user_creacion, id_user, id_empresa_cliente, 
        estado_srv, body_seed, body_exec, header_seed, header_exec, approval_seed, approval_exec, id_flow_tmpl, id_tipo_srv
      )
      SELECT 
        id_template, 9, 327, 327, 3, 
        'Creado', body_seed, body_seed, header_seed, header_seed, approval_seed, approval_seed, id_flow_tmpl, id_tipo_srv
      FROM sch_leansurvey_qa.tsrv_templates
      WHERE id_template = 143
      RETURNING id_survey;
    `);

    const idSurvey = insertRes[0][0];
    console.log(`\n🎉 ¡Survey creado exitosamente!`);
    console.log(`- ID de Survey: ${idSurvey}`);
    console.log(`- Asignado a: sgajardoc@gmail.com (ID 327)`);
    console.log(`- Proyecto: Proyecto Verificación de Seguridad (ID 9)`);

    ssh.dispose();
  } catch (err) {
    console.error('❌ Error:', err);
    ssh.dispose();
  }
}

main();
