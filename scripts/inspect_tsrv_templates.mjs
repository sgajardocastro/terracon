import { NodeSSH } from 'node-ssh';

const ssh = new NodeSSH();

async function main() {
  try {
    await ssh.connect({
      host: 'servidor.leanglobal.cl',
      port: 1295,
      username: 'root',
      password: 'lgbl2025.'
    });

    console.log('🔍 Obteniendo plantillas IRL existentes en sch_leansurvey_qa.tsrv_templates...');
    const resSample = await ssh.execCommand(`export PGPASSWORD='pass_qa_123' && psql -h localhost -U usr_qa -d postgres -c "SELECT id_template, name_template_srv, codi_template_srv FROM sch_leansurvey_qa.tsrv_templates WHERE name_template_srv ILIKE '%IRL%' OR name_template_srv ILIKE '%Inducc%' OR codi_template_srv ILIKE '%IRL%' ORDER BY id_template ASC;"`);
    console.log(resSample.stdout);

    ssh.dispose();
  } catch (err) {
    console.error(err);
    ssh.dispose();
  }
}

main();
