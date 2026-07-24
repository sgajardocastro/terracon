const axios = require('axios');
const { Client } = require('pg');

async function run() {
  const client = new Client({
    user: 'usr_qa',
    host: 'localhost',
    database: 'postgres',
    password: 'pass_qa_123',
    port: 5432,
  });

  try {
    await client.connect();

    // 1. Delete survey 4099
    console.log('Deleting survey 4099...');
    await client.query('DELETE FROM sch_leansurvey_qa.tsrv_survey WHERE id_survey = 4099');
    console.log('Survey 4099 deleted.');

    // 2. Create a new survey for template 74
    console.log('Creating new survey for template 74...');
    const resTmpl = await client.query('SELECT id_template, id_flow_tmpl, body_seed, header_seed, approval_seed, id_tipo_srv FROM sch_leansurvey_qa.tsrv_templates WHERE id_template = 74');
    const tmpl = resTmpl.rows[0];

    const payload = {
      id_tipo_srv: tmpl.id_tipo_srv,
      id_template: 74,
      id_user: 327,
      id_user_creacion: 327,
      id_empresa_cliente: 3,
      estado_srv: "Creado",
      header_seed: tmpl.header_seed,
      body_seed: tmpl.body_seed,
      approval_seed: tmpl.approval_seed,
      header_exec: tmpl.header_seed,
      body_exec: tmpl.body_seed,
      approval_exec: tmpl.approval_seed,
      fecha_plan_ini: "2026-07-01",
      fecha_plan_fin: "2026-07-03",
      id_proyecto: 9,
      id_flow_tmpl: tmpl.id_flow_tmpl
    };

    const response = await axios.post('http://localhost:3003/api/survey', payload);
    const newSurveyId = response.data.idSurvey;
    console.log('SUCCESS_ID:' + newSurveyId);

    // 3. Assign user 327 to all flow steps for this flow
    const flowIdRes = await client.query('SELECT id_flow FROM sch_leansurvey_qa.tflw_flows WHERE id_survey = $1', [newSurveyId]);
    if (flowIdRes.rows.length > 0) {
      const flowId = flowIdRes.rows[0].id_flow;
      await client.query('UPDATE sch_leansurvey_qa.tflw_flow_steps SET id_user = 327 WHERE id_flow = $1', [flowId]);
      console.log('ASSIGNED_FLOW_STEPS_TO_327');
    }

  } catch (err) {
    console.error('ERROR:', err.message);
  } finally {
    await client.end();
  }
}
run();