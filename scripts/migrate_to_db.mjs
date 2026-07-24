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

    // Write the migration script to the remote server under lean-services-qa/scripts/
    const migrationScript = `
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT || 5432,
});

async function migrate() {
  try {
    // 1. Create table if not exists
    console.log('Creating table tsrv_trazabilidad...');
    await pool.query(\`
      CREATE TABLE IF NOT EXISTS tsrv_trazabilidad (
        key_name VARCHAR(100) PRIMARY KEY,
        data_json JSONB,
        updated_at TIMESTAMP DEFAULT NOW()
      );
    \`);
    console.log('Table tsrv_trazabilidad ready.');

    // 2. Read the current JSON observations file from lg-terracon-qa
    const jsonPath = '/var/www/html/lg-terracon-qa/excel_observations.json';
    if (!fs.existsSync(jsonPath)) {
      throw new Error('excel_observations.json not found at ' + jsonPath);
    }
    const rawData = fs.readFileSync(jsonPath, 'utf8');
    const parsedData = JSON.parse(rawData);

    // 3. Upsert the observations into the database table
    console.log('Migrating observations data into database...');
    await pool.query(
      \`
      INSERT INTO tsrv_trazabilidad (key_name, data_json, updated_at)
      VALUES ($1, $2, NOW())
      ON CONFLICT (key_name)
      DO UPDATE SET data_json = EXCLUDED.data_json, updated_at = NOW()
      \`,
      ['seguridad', JSON.stringify(parsedData)]
    );
    console.log('✅ Data migrated successfully to PostgreSQL.');

    // 4. Verify insertion
    const res = await pool.query('SELECT key_name, data_json->41 as item_42 FROM tsrv_trazabilidad WHERE key_name = $1', ['seguridad']);
    console.log('Verification query result:', JSON.stringify(res.rows[0], null, 2));

  } catch (err) {
    console.error('Migration error:', err);
  } finally {
    await pool.end();
  }
}

migrate();
`;

    // Upload script
    console.log('Uploading migration script...');
    await ssh.execCommand(`cat << 'EOF' > /home/nodeadmin/proyectos/lean-services-qa/scripts/create_db_table_and_migrate.js\n${migrationScript}\nEOF`);
    await ssh.execCommand('chown nodeadmin:nodeadmin /home/nodeadmin/proyectos/lean-services-qa/scripts/create_db_table_and_migrate.js');
    console.log('Script uploaded and permissions set.');

    // Execute script as nodeadmin
    console.log('Executing migration script as nodeadmin...');
    const execRes = await ssh.execCommand('sudo -u nodeadmin node /home/nodeadmin/proyectos/lean-services-qa/scripts/create_db_table_and_migrate.js');
    console.log('Execution Output:');
    console.log(execRes.stdout || execRes.stderr);

  } catch (err) {
    console.error('Error:', err);
  } finally {
    ssh.dispose();
  }
}

run();
