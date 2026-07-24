const { Client } = require('pg');
const client = new Client({ user: 'postgres', host: 'localhost', database: 'postgres', password: 'password', port: 5432 });
client.connect();
client.query(`
  SELECT s.id_survey, s.estado_srv, f.id_flow, fs.id_flow_stp, fs.id_user, fs.flow_tmpl_step_orden 
  FROM sch_leansurvey_qa.tflw_survey s 
  JOIN sch_leansurvey_qa.tflw_flows f ON s.id_survey = f.id_survey 
  JOIN sch_leansurvey_qa.tflw_flow_steps fs ON f.id_flow = fs.id_flow 
  WHERE s.id_template = 153 
  ORDER BY s.id_survey DESC LIMIT 20;
`)
.then(res => { 
  console.table(res.rows); 
  client.end(); 
})
.catch(console.error);
