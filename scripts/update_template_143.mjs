import { NodeSSH } from 'node-ssh';
import axios from 'axios';

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

    // 1. Obtener el body_seed actual del template 143
    console.log('📥 Obteniendo body_seed del Template 143...');
    const selectRes = await runQuery(`
      SELECT body_seed FROM sch_leansurvey_qa.tsrv_templates WHERE id_template = 143;
    `);
    
    if (selectRes.length === 0) {
      throw new Error('No se encontró el template 143');
    }

    const currentBodySeed = JSON.parse(selectRes[0].join(','));

    // 2. Modificar el JSON para eliminar el campo de "Cargo Administrador obra:" en el segmento 6
    console.log('✏️ Modificando estructura JSON...');
    const segment6 = currentBodySeed.segmentos.find(s => s.label.includes('6. TOMA CONOCIMIENTO'));
    if (!segment6) {
      throw new Error('No se encontró el segmento 6 en el body_seed');
    }

    const initialLength = segment6.attributes.length;
    segment6.attributes = segment6.attributes.filter(attr => !attr.label || !attr.label.includes('Cargo Administrador obra'));
    
    if (segment6.attributes.length === initialLength) {
      console.warn('⚠️ Advertencia: No se encontró la pregunta "Cargo Administrador obra" en el segmento 6.');
    } else {
      console.log(`✅ Campo eliminado del segmento 6 (de ${initialLength} a ${segment6.attributes.length} campos).`);
    }

    // 3. Guardar el body_seed modificado en tsrv_templates
    const updatedJsonStr = JSON.stringify(currentBodySeed);
    console.log('💾 Actualizando body_seed en la base de datos de QA...');
    
    const updateSql = `
      UPDATE sch_leansurvey_qa.tsrv_templates 
      SET body_seed = '${updatedJsonStr.replace(/'/g, "''")}'
      WHERE id_template = 143;
    `;
    
    // Write query to a file on the server to prevent bash variable expansion issues with $ and {
    await ssh.execCommand(`cat << 'EOF' > /home/nodeadmin/proyectos/lean-services-qa/update_query.sql\n${updateSql}\nEOF`);
    const updateCmd = `export PGPASSWORD='pass_qa_123' && psql -h localhost -U usr_qa -d postgres -f /home/nodeadmin/proyectos/lean-services-qa/update_query.sql`;
    const updateRes = await ssh.execCommand(updateCmd);
    console.log(updateRes.stdout || updateRes.stderr);
    
    // Delete query file
    await ssh.execCommand('rm -f /home/nodeadmin/proyectos/lean-services-qa/update_query.sql');

    // 4. Limpiar encuestas de prueba previas (4083 y 4085)
    console.log('🧹 Limpiando surveys de prueba anteriores (4083, 4085)...');
    await runQuery(`
      DELETE FROM sch_leansurvey_qa.tflw_flow_steps WHERE id_flow IN (SELECT id_flow FROM sch_leansurvey_qa.tflw_flows WHERE id_survey IN (4083, 4085));
      DELETE FROM sch_leansurvey_qa.tflw_flows WHERE id_survey IN (4083, 4085);
      DELETE FROM sch_leansurvey_qa.tsrv_survey WHERE id_survey IN (4083, 4085);
    `);

    // 5. Crear la nueva encuesta de prueba a través del endpoint del Backend (para que genere su flujo e instanciación de forma correcta)
    console.log('🚀 Creando nuevo survey de prueba mediante la API del Backend...');
    
    // Escribimos un script temporal en el servidor para ejecutar la petición localmente al backend (puerto 3003)
    const remoteApiScript = `
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
    const resTmpl = await client.query('SELECT id_template, id_flow_tmpl, body_seed, header_seed, approval_seed, id_tipo_srv FROM sch_leansurvey_qa.tsrv_templates WHERE id_template = 143');
    if (resTmpl.rows.length === 0) {
      throw new Error('Template 143 not found');
    }
    const tmpl = resTmpl.rows[0];

    const payload = {
      id_tipo_srv: tmpl.id_tipo_srv,
      id_template: 143,
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
    
    const res = await axios.post('http://localhost:3003/api/survey', payload);
    console.log('SUCCESS_ID:' + res.data.idSurvey);
  } catch (err) {
    console.error('ERROR:' + err.message);
  } finally {
    await client.end();
  }
}
run();
    `;

    await ssh.execCommand(`cat << 'EOF' > /home/nodeadmin/proyectos/lean-services-qa/create_survey_api.js\n${remoteApiScript}\nEOF`);
    
    const runRes = await ssh.execCommand('node /home/nodeadmin/proyectos/lean-services-qa/create_survey_api.js');
    console.log('Ejecución del creador API:', runRes.stdout.trim());

    // Extraer el nuevo ID de Survey
    const matches = runRes.stdout.match(/SUCCESS_ID:(\d+)/);
    if (!matches) {
      throw new Error('No se pudo obtener el ID del nuevo survey creado por API.');
    }
    const newSurveyId = matches[1];

    // 6. Asignar el usuario 327 (Sergio) al paso del flujo del nuevo survey de forma inmediata
    console.log(`👤 Asignando usuario 327 al flujo del nuevo Survey ID ${newSurveyId}...`);
    await runQuery(`
      UPDATE sch_leansurvey_qa.tflw_flow_steps 
      SET id_user = 327 
      WHERE id_flow = (SELECT id_flow FROM sch_leansurvey_qa.tflw_flows WHERE id_survey = ${newSurveyId});
    `);

    console.log(`\n🎉 ¡Proceso finalizado con éxito!`);
    console.log(`- Nuevo ID de Survey: ${newSurveyId}`);
    console.log(`- Asignado a: sgajardoc@gmail.com (ID 327)`);
    console.log(`- Proyecto: Proyecto Verificación de Seguridad (ID 9)`);

    ssh.dispose();
  } catch (err) {
    console.error('❌ Error:', err);
    ssh.dispose();
  }
}

main();
