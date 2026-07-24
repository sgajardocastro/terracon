import XLSX from 'xlsx';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const file_path = path.resolve(__dirname, '../Rev. Lean Global 20260623.xlsx');
const output_json_path = path.resolve(__dirname, '../gestion/excel_observations.json');
const output_md_path = path.resolve(__dirname, '../gestion/excel_observations.md');

try {
  const workbook = XLSX.readFile(file_path);
  const targetSheetName = workbook.SheetNames.find(name => name.trim() === 'Rev. 5 Junio 2026');
  
  if (!targetSheetName) {
    console.error('❌ No se encontró la hoja "Rev. 5 Junio 2026"');
  } else {
    const sheet = workbook.Sheets[targetSheetName];
    const rows = XLSX.utils.sheet_to_json(sheet, { defval: '' });
    
    // Clean rows and map keys dynamically
    const cleanedRows = [];
    for (const r of rows) {
      let num = '';
      let tipo = '';
      let comentarios = '';
      
      // Find keys case-insensitively or matching spanish characters
      for (const key of Object.keys(r)) {
        const kLower = key.toLowerCase().trim();
        if (kLower === 'n°' || kLower === 'num' || kLower === 'n') {
          num = r[key];
        } else if (kLower === 'tipo' || kLower === 'tipo plantilla' || kLower === 'módulo') {
          tipo = r[key];
        } else if (kLower === 'comentarios' || kLower === 'observacion' || kLower === 'observaciones' || kLower === 'comentario') {
          comentarios = r[key];
        }
      }
      
      // If we couldn't match dynamically, use raw index properties
      if (!num && r['N°'] !== undefined) num = r['N°'];
      if (!tipo && r['Tipo'] !== undefined) tipo = r['Tipo'];
      if (!comentarios && r['Comentarios'] !== undefined) comentarios = r['Comentarios'];
      
      if (num !== '' || tipo !== '' || comentarios !== '') {
        cleanedRows.push({
          num: String(num).trim(),
          tipo: String(tipo).trim().replace(/\r\n/g, ' / ').replace(/\n/g, ' / '),
          comentarios: String(comentarios).trim()
        });
      }
    }

    // Save to JSON
    fs.writeFileSync(output_json_path, JSON.stringify(cleanedRows, null, 2), 'utf8');
    console.log(`✅ JSON guardado en: ${output_json_path}`);

    // Generate beautiful Markdown table
    let md = `# 📝 Observaciones Recibidas (Planilla Excel: Hoja "Rev. 5 Junio 2026")\n\n`;
    md += `Este documento lista las observaciones consolidadas del cliente/equipo técnico para el módulo de seguridad y otros componentes, extraídas automáticamente de la planilla Excel.\n\n`;
    md += `| N° | Tipo / Plantilla de Inspección | Comentarios / Observaciones |\n`;
    md += `|---|---|---|\n`;
    
    for (const r of cleanedRows) {
      // Escape pipe character in comments to not break table formatting
      const commentEscaped = r.comentarios.replace(/\|/g, '\\|').replace(/\r\n/g, '<br>').replace(/\n/g, '<br>');
      const tipoEscaped = r.tipo.replace(/\|/g, '\\|');
      md += `| ${r.num} | ${tipoEscaped} | ${commentEscaped} |\n`;
    }
    
    fs.writeFileSync(output_md_path, md, 'utf8');
    console.log(`✅ Markdown guardado en: ${output_md_path}`);
  }
} catch (err) {
  console.error('❌ Error en script:', err.message);
}
