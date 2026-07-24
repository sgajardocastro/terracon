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

    console.log('\n--- 1. COLUMNAS DE tpry_proyecto ---');
    const cols = await runQuery(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'tpry_proyecto'
      ORDER BY ordinal_position;
    `);
    cols.forEach(row => console.log(row.join(': ')));

    console.log('\n--- 2. REGISTROS DE tpry_proyecto ---');
    const proyectos = await runQuery(`
      SELECT * 
      FROM tpry_proyecto
      ORDER BY id_proyecto DESC;
    `);
    console.log('Proyectos:');
    proyectos.forEach(row => console.log(row.join(' | ')));

  } catch (err) {
    console.error('❌ Error:', err);
  } finally {
    ssh.dispose();
  }
}

main();
