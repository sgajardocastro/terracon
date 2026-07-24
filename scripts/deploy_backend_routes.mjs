import { NodeSSH } from 'node-ssh';

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

    const routeCode = `const express = require('express');
const router = express.Router();
const observacionesController = require('../controllers/observacionesController');

router.get('/', observacionesController.getObservaciones);
router.post('/', observacionesController.saveObservaciones);

module.exports = router;
`;

    const controllerCode = `const pool = require('../config/postgresPool');

const getObservaciones = async (req, res) => {
  try {
    console.log('GET /api/observaciones requested.');
    const result = await pool.query(
      "SELECT data_json FROM tsrv_trazabilidad WHERE key_name = 'seguridad'"
    );
    if (result.rows.length > 0) {
      return res.json(result.rows[0].data_json);
    }
    return res.json([]);
  } catch (err) {
    console.error('Error fetching observations:', err.message);
    res.status(500).json({ error: 'Failed to retrieve observations.' });
  }
};

const saveObservaciones = async (req, res) => {
  try {
    console.log('POST /api/observaciones requested.');
    const data = req.body;
    await pool.query(
      \`INSERT INTO tsrv_trazabilidad (key_name, data_json, updated_at)
       VALUES ('seguridad', $1, NOW())
       ON CONFLICT (key_name)
       DO UPDATE SET data_json = EXCLUDED.data_json, updated_at = NOW()\`,
      [JSON.stringify(data)]
    );
    res.json({ message: 'Saved successfully.' });
  } catch (err) {
    console.error('Error saving observations:', err.message);
    res.status(500).json({ error: 'Failed to save observations.' });
  }
};

module.exports = {
  getObservaciones,
  saveObservaciones
};
`;

    const projects = [
      '/home/nodeadmin/proyectos/lean-services-qa',
      '/home/nodeadmin/proyectos/lean-services'
    ];

    for (const project of projects) {
      console.log(`\nDeploying routes/controllers to: ${project}`);
      
      const routePath = `${project}/src/routes/observacionesRoutes.js`;
      const controllerPath = `${project}/src/controllers/observacionesController.js`;

      // Upload route file
      await ssh.execCommand(`cat << 'EOF' > ${routePath}\n${routeCode}\nEOF`);
      await ssh.execCommand(`chown nodeadmin:nodeadmin ${routePath}`);
      console.log(`Created route file: ${routePath}`);

      // Upload controller file
      await ssh.execCommand(`cat << 'EOF' > ${controllerPath}\n${controllerCode}\nEOF`);
      await ssh.execCommand(`chown nodeadmin:nodeadmin ${controllerPath}`);
      console.log(`Created controller file: ${controllerPath}`);
    }

    console.log('\n✅ All route and controller files deployed.');

  } catch (err) {
    console.error('Error:', err);
  } finally {
    ssh.dispose();
  }
}

run();
