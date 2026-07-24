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
    console.log('🔗 Conectando a servidor.leanglobal.cl via SSH...');
    await ssh.connect({
      host: 'servidor.leanglobal.cl',
      port: 1295,
      username: 'root',
      password: 'lgbl2025.'
    });
    console.log('✅ Conexión establecida.');

    // 1. Obtener Tablas y Columnas
    console.log('📋 Consultando tablas y columnas...');
    const columnsRaw = await runQuery(`
      SELECT table_name, column_name, data_type 
      FROM information_schema.columns 
      WHERE table_schema = 'sch_leansurvey_qa' 
      ORDER BY table_name, ordinal_position;
    `);

    // 2. Obtener Relaciones FK
    console.log('🔗 Consultando relaciones de llaves foráneas...');
    const fkRaw = await runQuery(`
      SELECT
          tc.table_name AS source_table,
          kcu.column_name AS source_column,
          ccu.table_name AS target_table,
          ccu.column_name AS target_column
      FROM
          information_schema.table_constraints AS tc
          JOIN information_schema.key_column_usage AS kcu
            ON tc.constraint_name = kcu.constraint_name
            AND tc.table_schema = kcu.table_schema
          JOIN information_schema.constraint_column_usage AS ccu
            ON ccu.constraint_name = tc.constraint_name
            AND ccu.table_schema = ccu.table_schema
      WHERE tc.constraint_type = 'FOREIGN KEY' AND tc.table_schema = 'sch_leansurvey_qa';
    `);

    // 3. Obtener Proyectos con contadores
    console.log('📁 Consultando proyectos y actividad...');
    const projectsRaw = await runQuery(`
      SELECT 
          p.id_proyecto, 
          p.nombre_proyecto, 
          p.codi_proyecto, 
          COALESCE(p.id_empresa_cliente::text, 'NULL'),
          (SELECT COUNT(*) FROM sch_leansurvey_qa.tsrv_survey s WHERE s.id_proyecto = p.id_proyecto),
          (SELECT COUNT(*) FROM sch_leansurvey_qa.tpry_equipo_proyecto eq WHERE eq.id_proyecto = p.id_proyecto)
      FROM sch_leansurvey_qa.tpry_proyecto p
      ORDER BY p.id_proyecto;
    `);

    // 4. Obtener Empresas con contadores
    console.log('🏢 Consultando empresas...');
    const companiesRaw = await runQuery(`
      SELECT 
          e.id_empresa, 
          e.name_empresa, 
          COALESCE(e.rut_empresa, 'S/R'),
          (SELECT COUNT(*) FROM sch_leansurvey_qa.tsec_users u WHERE u.id_empresa = e.id_empresa)
      FROM sch_leansurvey_qa.tpar_empresas e
      ORDER BY e.id_empresa;
    `);

    // 5. Obtener Usuarios y Roles
    console.log('👤 Consultando usuarios y roles...');
    const usersRaw = await runQuery(`
      SELECT 
          u.id_user, 
          COALESCE(u.name_frst, 'S/N'), 
          u.email, 
          COALESCE(u.id_empresa::text, 'NULL'),
          (SELECT COUNT(*) FROM sch_leansurvey_qa.tsrv_survey s WHERE s.id_user_creacion = u.id_user)
      FROM sch_leansurvey_qa.tsec_users u
      ORDER BY u.id_user;
    `);

    // Cerrar SSH
    ssh.dispose();

    // Estructurar el reporte Markdown
    let md = "# Especificación de Datos y Plan de Limpieza de QA (Spec-driven)\n\n";
    md += "Documento autogenerado para el análisis y auditoría de la base de datos de control de calidad (sch_leansurvey_qa).\n\n";
    
    md += "## 1. Relaciones de Integridad Referencial (Foreign Keys)\n";
    md += "Estas relaciones indican qué tablas dependen de otras y el orden estricto de eliminación en cascada.\n\n";
    md += "| Tabla Origen | Columna Origen | Tabla Destino (Ref) | Columna Destino |\n";
    md += "| :--- | :--- | :--- | :--- |\n";
    fkRaw.forEach(row => {
      md += "| " + row[0] + " | " + row[1] + " | " + row[2] + " | " + row[3] + " |\n";
    });
    md += "\n---\n\n";

    md += "## 2. Inventario de Proyectos en QA\n";
    md += "Identificación de proyectos para determinar cuáles se conservan y cuáles se limpian.\n\n";
    md += "| ID | Nombre Proyecto | Código | ID Cliente | Inspecciones (Surveys) | Equipos/Cuadrillas | Acción Propuesta |\n";
    md += "| :---: | :--- | :--- | :---: | :---: | :---: | :--- |\n";
    projectsRaw.forEach(row => {
      const id = row[0];
      const name = row[1];
      const code = row[2];
      const client = row[3];
      const surveys = row[4];
      const teams = row[5];
      let action = "**ELIMINAR** (Test/Basura)";
      if (id === '-1') action = "**CONSERVAR** (Requerido Sistema)";
      if (id === '1') action = "**CONSERVAR** (Sonacol / Servidumbre)";
      if (id === '3') action = "**CONSERVAR** (Metrogas / Conexión)";
      
      md += "| " + id + " | " + name + " | " + code + " | " + client + " | " + surveys + " | " + teams + " | " + action + " |\n";
    });
    md += "\n---\n\n";

    md += "## 3. Inventario de Empresas en QA\n";
    md += "Empresas clientes y subcontratistas asociadas.\n\n";
    md += "| ID | Nombre Empresa | RUT | Usuarios Vinculados | Acción Propuesta |\n";
    md += "| :---: | :--- | :--- | :---: | :--- |\n";
    companiesRaw.forEach(row => {
      const id = row[0];
      const name = row[1];
      const rut = row[2];
      const users = row[3];
      let action = "**ELIMINAR** (Sin vinculación activa)";
      if (['1', '2'].includes(id)) action = "**CONSERVAR** (Terracon / Lean)";
      if (id === '3') action = "**CONSERVAR** (Cliente Sonacol)";
      if (id === '4') action = "**CONSERVAR** (Cliente Metrogas)";
      if (['10', '11', '12', '13', '14', '15', '16'].includes(id)) action = "**CONSERVAR** (Subcontratista Conexión Metrogas)";
      
      md += "| " + id + " | " + name + " | " + rut + " | " + users + " | " + action + " |\n";
    });
    md += "\n---\n\n";

    md += "## 4. Auditoría de Usuarios en QA (Top 30 por ID)\n";
    md += "Listado de usuarios registrados en el sistema para depuración de la nómina.\n\n";
    md += "| ID | Nombre Usuario | Email | ID Empresa | Surveys Creados | Acción Propuesta |\n";
    md += "| :---: | :--- | :--- | :---: | :---: | :--- |\n";
    usersRaw.slice(0, 50).forEach(row => {
      const id = row[0];
      const name = row[1];
      const email = row[2];
      const empId = row[3];
      const surveys = row[4];
      let action = "**ELIMINAR** (Cuenta obsoleta / Test)";
      if (email.toLowerCase().includes('@terracon.cl')) action = "**CONSERVAR** (Personal Terracon)";
      if (email.toLowerCase().includes('sup2')) action = "**CONSERVAR** (Credencial Principal)";
      if (Number(surveys) > 0) action = "**CONSERVAR** (Tiene actividad)";
      
      md += "| " + id + " | " + name + " | " + email + " | " + empId + " | " + surveys + " | " + action + " |\n";
    });
    if (usersRaw.length > 50) {
      md += "| ... | ... | ... | ... | ... | *(Total de usuarios en QA: " + usersRaw.length + ")* |\n";
    }
    
    const outputDir = 'C:\\Users\\sgaja\\.gemini\\antigravity-ide\\brain\\3f1b237c-a5d6-4522-bb12-d3cab3cad5cf';
    fs.writeFileSync(path.join(outputDir, 'implementation_plan.md'), md, 'utf8');
    console.log('✅ Reporte generado y guardado en implementation_plan.md');

  } catch (err) {
    console.error('❌ Error en compilador:', err);
    ssh.dispose();
  }
}

main();
