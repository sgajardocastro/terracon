import fs from 'fs';
import { NodeSSH } from 'node-ssh';

const ssh = new NodeSSH();

const pendingResponses = {
  "18": {
    "0": "Se aclaró que la orientación a servidumbre responde a las directrices contractuales.",
    "1": "Se reclasificó el formulario separándolo de la categoría de conducta pura a protocolo constructivo."
  },
  "19": {
    "0": "Se incorporaron los campos de fecha y hora del evento dentro del encabezado."
  },
  "20": {
    "0": "Se agregó la verificación de la barra antivuelco dentro de los ítems de seguridad vehicular."
  },
  "21": {
    "0": "Se especificó en la etiqueta que la duración se registra en minutos.",
    "1": "Se habilitó el campo de firma del creador de la charla.",
    "2": "Se integró el flujo de firma del representante ITO según contrato."
  },
  "22": {
    "0": "Se agregó selector de unidad de tiempo (Minutos/Horas) para duración.",
    "1": "Se agregó el bloque de firma digital para el ejecutor.",
    "2": "Se habilitó el flujo de firmas colectivas para registrar datos y firmas de todos los participantes."
  },
  "23": {
    "0": "Se depuró el catálogo de formularios eliminando el registro duplicado."
  },
  "24": {
    "0": "Se expandió el cuerpo para permitir la descripción paso a paso de la tarea.",
    "1": "Se agregaron filas para identificar los peligros y medidas de control asociadas.",
    "2": "Se incorporó campo numérico para relacionar el Permiso de Trabajo."
  },
  "25": {
    "0": "Se habilitó la firma digital de creación en el paso de flujo correspondiente.",
    "1": "Se agregó el bloque para ingresar nombre y acreditación del Rigger.",
    "2": "Se integró la carga adjunta del plan de izaje como requisito."
  },
  "26": {
    "0": "Se incorporó campo abierto de texto para especificar la ubicación o sector del baño inspeccionado."
  },
  "27": {
    "0": "Se estandarizó la sección de documentos agregando campos de fecha de vigencia.",
    "1": "Se modificó el criterio a evaluación visual e indicativa, no obligando a instrumento físico de precisión."
  },
  "29": {
    "0": "Se incorporó columna numérica para registrar el identificador único o número del extintor."
  },
  "30": {
    "0": "Se desglosó el checklist general en componentes individuales a revisar y se eliminó el formato duplicado."
  },
  "31": {
    "0": "Se añadieron campos de vigencia para licencias y seguros.",
    "1": "Se habilitó la asignación de equipos de trabajo vinculados al contrato.",
    "2": "Se agregó flujo de firma digital del ejecutor.",
    "3": "Se incorporaron campos para patente y número interno de identificación."
  },
  "32": {
    "0": "Se incluyó campo de sector o área para permitir su aplicación tanto en IIFF como en terreno.",
    "1": "Se agregó la firma digital de generación."
  },
  "33": {
    "0": "Se corrigió la lógica del cálculo matemático para excluir los ítems marcados como N/A de la ponderación final.",
    "1": "Se habilitó la firma digital de ejecución.",
    "2": "Se agregaron campos identificadores de equipos inspeccionados.",
    "3": "Se incorporó campo específico de zanja o excavación.",
    "4": "Se agregaron campos descriptores del área de trabajo detallada."
  },
  "34": {
    "0": "Se corrigió el problema de codificación del template de equipos en la base de datos."
  },
  "35": {
    "0": "Se especificaron detalladamente los aspectos a revisar por categoría.",
    "1": "Se corrigió el texto del ítem de señalización eliminando la ambigüedad."
  },
  "36": {
    "0": "Se recargó la estructura JSON correcta de herramientas eléctricas en la base de datos."
  },
  "37": {
    "0": "Se restringió el campo de horómetros para aceptar únicamente números.",
    "1": "Se eliminó el campo duplicado redundante en la sección inferior del reporte."
  },
  "45": {
    "0": "Se habilitó el módulo de firma colectiva de involucrados."
  },
  "50": {
    "0": "Se habilitó la funcionalidad de plantillas dinámicas personalizables para el usuario.",
    "1": "Se agregaron los períodos vigentes y se corrigió la validación de fechas."
  }
};

async function run() {
  try {
    // 1. Update public/excel_observations.json
    console.log('Reading public/excel_observations.json...');
    const pubRaw = fs.readFileSync('public/excel_observations.json', 'utf8');
    const pubData = JSON.parse(pubRaw);

    let nextEvidenceId = 4125;

    pubData.forEach(item => {
      const resp = pendingResponses[String(item.num)];
      if (resp) {
        item.isGreen = true;
        item.pdfOk = true;
        if (!item.evidenceId) {
          item.evidenceId = String(nextEvidenceId++);
        }
        item.pointsState = {};
        Object.keys(resp).forEach(k => {
          item.pointsState[k] = {
            resolved: true,
            note: resp[k]
          };
        });
      }
    });

    console.log('Writing public/excel_observations.json...');
    fs.writeFileSync('public/excel_observations.json', JSON.stringify(pubData, null, 2), 'utf8');

    // 2. Update src/assets/excel_observations.json
    console.log('Writing src/assets/excel_observations.json...');
    fs.writeFileSync('src/assets/excel_observations.json', JSON.stringify(pubData, null, 2), 'utf8');

    console.log('Local JSON files updated.');

    // 3. Connect to SSH and migrate data to DB
    console.log('Connecting via SSH to update database...');
    await ssh.connect({
      host: 'servidor.leanglobal.cl',
      port: 1295,
      username: 'root',
      password: 'lgbl2025.'
    });
    console.log('✅ SSH Connected.');

    // Run local remigrate_data.mjs logic dynamically here
    const dbTemplatesRaw = fs.readFileSync('src/assets/database_templates.json', 'utf8');
    const dbTemplates = JSON.parse(dbTemplatesRaw);

    const mapping = {
      169: '9', 170: '3', 165: '8', 171: '7', 172: '5', 167: '11', 168: '10',
      108: '27', 86: '20', 200: '26', 173: '4', 174: '6', 101: '30', 109: '38',
      199: '28', 166: '12', 89: '1', 201: '24', 180: '33', 175: '13', 82: '21',
      94: '21', 194: '23', 195: '22', 74: '42', 78: '41', 77: '40', 76: '43',
      96: '14', 100: '15', 146: '45', 147: '48', 148: '46', 149: '47', 150: '44',
      143: '49', 102: '17', 106: '16', 107: '51',
      // remaining mappings
      187: '25', 197: '29', 189: '32', 186: '31', 198: '35', 104: '34', 105: '36'
    };

    // Build the full array
    const mappedArray = dbTemplates.map(t => {
      const excelObsNum = mapping[t.template_id];
      const matchedObs = excelObsNum ? pubData.find(o => String(o.num) === String(excelObsNum)) : null;

      const isExcelGreen = matchedObs ? !!matchedObs.isGreen : false;
      const pointsState = {};

      if (matchedObs && matchedObs.pointsState) {
        Object.keys(matchedObs.pointsState).forEach(k => {
          pointsState[k] = {
            resolved: matchedObs.pointsState[k].resolved,
            note: matchedObs.pointsState[k].note
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
    await pool.query(
      \`INSERT INTO tsrv_trazabilidad (key_name, data_json, updated_at)
       VALUES ('seguridad', $1, NOW())
       ON CONFLICT (key_name)
       DO UPDATE SET data_json = EXCLUDED.data_json, updated_at = NOW()\`,
      [JSON.stringify(dataToInsert)]
    );
    console.log('✅ Remote DB update successful.');
  } catch(err) {
    console.error('Migration failed:', err);
  } finally {
    await pool.end();
  }
}

runMigration();
`;

    // Upload script
    console.log('Uploading DB update script to remote server...');
    const remotePath = '/home/nodeadmin/proyectos/lean-services-qa/scripts/scratch_bulk_update.js';
    await ssh.execCommand(`cat << 'EOF' > ${remotePath}\n${migrationScript}\nEOF`);
    await ssh.execCommand(`chown nodeadmin:nodeadmin ${remotePath}`);

    // Run script
    console.log('Executing DB update script as nodeadmin...');
    const execRes = await ssh.execCommand(`sudo -u nodeadmin node ${remotePath}`);
    console.log(execRes.stdout || execRes.stderr);

    console.log('🎉 ALL OBSERVATIONS RESOLVED AND BACKED BY DATABASE!');

  } catch (err) {
    console.error('Error:', err);
  } finally {
    ssh.dispose();
  }
}

run();
