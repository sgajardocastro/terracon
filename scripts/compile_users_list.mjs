import { NodeSSH } from 'node-ssh';
import fs from 'fs';
import path from 'path';

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
    
    console.log('👤 Consultando todos los usuarios...');
    const users = await runQuery(`
      SELECT 
          u.id_user, 
          COALESCE(u.name_frst, 'S/N'), 
          u.email, 
          COALESCE(u.id_empresa::text, 'NULL'),
          COALESCE((SELECT name_empresa FROM sch_leansurvey_qa.tpar_empresas e WHERE e.id_empresa = u.id_empresa), 'Sin Empresa'),
          (SELECT COUNT(*) FROM sch_leansurvey_qa.tsrv_survey s WHERE s.id_user_creacion = u.id_user)
      FROM sch_leansurvey_qa.tsec_users u
      ORDER BY u.email;
    `);
    
    ssh.dispose();

    let md = "# Nómina Completa de Usuarios en QA\n\n";
    md += "Listado de todos los usuarios registrados en el esquema `sch_leansurvey_qa`, ordenados por email para facilitar la auditoría.\n\n";
    md += "| ID | Nombre Usuario | Email | ID Empresa | Nombre Empresa | Surveys Creados | Acción Propuesta |\n";
    md += "| :---: | :--- | :--- | :---: | :--- | :---: | :--- |\n";
    
    users.forEach(row => {
      const id = row[0];
      const name = row[1];
      const email = row[2];
      const empId = row[3];
      const empName = row[4];
      const surveys = row[5];
      let action = "**CONSERVAR**";
      
      const lowerEmail = email.toLowerCase();
      const blacklist = ['sup1@terracon.cl', 'jtrr2@terracon.cl', 'adco2@terracon.cl', 'ito2@terracon.cl', 'user.1@terracon.cl', 'jtrr1@terracon.cl', 'adco1@terracon.cl', 'luis.iturra@gmail.com'];
      
      if (blacklist.includes(lowerEmail) || lowerEmail.includes('user.1') || lowerEmail.includes('test')) {
        action = "**ELIMINAR** (Filtro Directo / Test)";
      } else if (empName.toLowerCase().includes('leanglobal')) {
        action = "**ELIMINAR** (Empresa LeanGlobal a borrar)";
      } else if (Number(surveys) === 0 && !lowerEmail.includes('@terracon.cl') && !lowerEmail.includes('sup2')) {
        action = "**ELIMINAR** (Sin actividad y fuera de Terracon)";
      }
      
      md += "| " + id + " | " + name + " | " + email + " | " + empId + " | " + empName + " | " + surveys + " | " + action + " |\n";
    });
    
    const outputDir = 'C:\\Users\\sgaja\\.gemini\\antigravity-ide\\brain\\3f1b237c-a5d6-4522-bb12-d3cab3cad5cf';
    fs.writeFileSync(path.join(outputDir, 'users_list.md'), md, 'utf8');
    console.log('✅ Nómina completa generada en users_list.md');
  } catch (err) {
    console.error(err);
    ssh.dispose();
  }
}
main();
