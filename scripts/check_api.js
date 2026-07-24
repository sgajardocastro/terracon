import axios from 'axios';

const api = axios.create({
  baseURL: 'https://servidor.leanglobal.cl/lean-services-dev/api',
});

async function run() {
  try {
    console.log('Fetching tasks for project 1...');
    const res = await api.get('/servicio/leanglobal/obtenerGanttsTareasV3', {
      params: { id_proyecto: 1 }
    });
    const list = res.data?.datos ?? res.data ?? [];
    console.log('Total tasks:', list.length);
    
    // We want to find entries for June 3, 2026 (or today's date)
    // Let's print any task entry that has a date starting with '2026-06-03' or similar.
    let count = 0;
    for (const t of list) {
      if (t.json_data && Array.isArray(t.json_data)) {
        for (const entry of t.json_data) {
          const entryDate = entry.fecha || entry.date || entry.dia || '';
          if (entryDate.startsWith('2026-06-03') || entryDate.includes('2026-06-03')) {
            count++;
            console.log(`\n[Match ${count}] Task ID: ${t.id_tarea}, Task Name: ${t.nombre_tarea}`);
            console.log('Entry:', entry);
          }
        }
      }
    }
    console.log(`\nFound a total of ${count} entries matching 2026-06-03`);
  } catch (err) {
    console.error('Error:', err.message);
  }
}

run();
