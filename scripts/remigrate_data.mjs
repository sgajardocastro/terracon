import { NodeSSH } from 'node-ssh';
import fs from 'fs';
import path from 'path';

const ssh = new NodeSSH();

async function run() {
  try {
    await ssh.connect({
      host: 'servidor.leanglobal.cl',
      port: 1295,
      username: 'root',
      password: 'lgbl2025.'
    });
    console.log('✅ SSH Connected.');

    // 1. Read files locally
    const dbTemplatesRaw = fs.readFileSync('src/assets/database_templates.json', 'utf8');
    const dbTemplates = JSON.parse(dbTemplatesRaw);

    const excelObsRaw = fs.readFileSync('public/excel_observations.json', 'utf8');
    const excelObs = JSON.parse(excelObsRaw);

    const mapping = {
      169: '9', 170: '3', 165: '8', 171: '7', 172: '5', 167: '11', 168: '10',
      108: '27', 86: '20', 200: '26', 173: '4', 174: '6', 101: '30', 109: '38',
      199: '28', 166: '12', 89: '1', 201: '24', 180: '33', 175: '13', 82: '21',
      94: '21', 194: '23', 195: '22', 74: '42', 78: '41', 77: '40', 76: '43',
      96: '14', 100: '15', 146: '45', 147: '48', 148: '46', 149: '47', 150: '44',
      143: '49', 102: '17', 106: '16', 107: '51'
    };

    // 2. Perform mapping to reconstruct rawArray format
    const mappedArray = dbTemplates.map(t => {
      const excelObsNum = mapping[t.template_id];
      const matchedObs = excelObsNum ? excelObs.find(o => String(o.num) === String(excelObsNum)) : null;

      const isExcelGreen = matchedObs ? !!matchedObs.isGreen : false;
      const pointsState = {};

      if (matchedObs && matchedObs.comentarios) {
        // Simple lines parser matching parseCommentsIntoPoints
        const normalized = matchedObs.comentarios.replace(/\r\n/g, '\n');
        const rawLines = normalized.split(/\n/);
        const points = [];
        let currentPoint = '';

        for (const line of rawLines) {
          const trimmed = line.trim();
          if (!trimmed) continue;
          const isNewPoint = /^\d+\s*[\.\)]/.test(trimmed) || trimmed.startsWith('*');
          if (isNewPoint) {
            if (currentPoint) points.push(currentPoint);
            currentPoint = trimmed;
          } else {
            if (currentPoint) currentPoint += ' ' + trimmed;
            else currentPoint = trimmed;
          }
        }
        if (currentPoint) points.push(currentPoint);
        
        points.forEach((pt, pIdx) => {
          const storedPt = matchedObs.pointsState?.[pIdx] || {};
          pointsState[pIdx] = {
            resolved: storedPt.resolved !== undefined ? storedPt.resolved : isExcelGreen,
            note: storedPt.note || ''
          };
        });
      }

      return {
        template_id: t.template_id,
        template_nombre: t.template_nombre,
        template_codigo: t.template_codigo,
        familia_id: t.familia_id,
        familia_nombre: t.familia_nombre,
        evidenceId: matchedObs ? matchedObs.evidenceId || '' : '',
        pdfOk: matchedObs ? (matchedObs.pdfOk !== undefined ? matchedObs.pdfOk : isExcelGreen) : false,
        notes: matchedObs ? matchedObs.notes || '' : '',
        pointsState: pointsState
      };
    });

    console.log('Mapped template 74 item sample:', JSON.stringify(mappedArray.find(x => x.template_id === 74), null, 2));

    // 3. Write migration script to execute on remote server using remote dbConfig
    const migrationScript = `
const { Pool } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT || 5432,
});

const dataToInsert = ${JSON.stringify(mappedArray)};

async function runMigration() {
  try {
    console.log('Upserting mapped data into tsrv_trazabilidad...');
    await pool.query(
      \`INSERT INTO tsrv_trazabilidad (key_name, data_json, updated_at)
       VALUES ('seguridad', $1, NOW())
       ON CONFLICT (key_name)
       DO UPDATE SET data_json = EXCLUDED.data_json, updated_at = NOW()\`,
      [JSON.stringify(dataToInsert)]
    );
    console.log('✅ Re-migration successful.');
  } catch(err) {
    console.error('Migration execution failed:', err);
  } finally {
    await pool.end();
  }
}

runMigration();
`;

    // Upload script
    console.log('Uploading re-migration script...');
    await ssh.execCommand(`cat << 'EOF' > /home/nodeadmin/proyectos/lean-services-qa/scripts/remigrate.js\n${migrationScript}\nEOF`);
    await ssh.execCommand('chown nodeadmin:nodeadmin /home/nodeadmin/proyectos/lean-services-qa/scripts/remigrate.js');

    // Run script as nodeadmin
    console.log('Running re-migration script as nodeadmin...');
    const execRes = await ssh.execCommand('sudo -u nodeadmin node /home/nodeadmin/proyectos/lean-services-qa/scripts/remigrate.js');
    console.log('Execution Output:');
    console.log(execRes.stdout || execRes.stderr);

  } catch (err) {
    console.error('Error:', err);
  } finally {
    ssh.dispose();
  }
}

run();
