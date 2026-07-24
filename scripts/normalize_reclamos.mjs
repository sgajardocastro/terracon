import https from 'https';

// Descomentar y ajustar baseURL
const baseURL = 'https://servidor.leanglobal.cl/lean-services-qa/api'

async function normalizeSurveys() {
    console.log("Iniciando normalizacion de reclamos atascados en Pre Creado...");
    try {
        const resList = await new Promise((resolve, reject) => {
            https.get(`${baseURL}/servicio/leanglobal/procesosSurveyV3`, (res) => {
                let data = '';
                res.on('data', chunk => data += chunk);
                res.on('end', () => resolve(JSON.parse(data)));
                res.on('error', reject);
            });
        });

        const surveys = resList.datos || [];
        // Filtramos solo Template 153 en estado Pre Creado
        const reclamosPreCreados = surveys.filter(s => 
            (String(s.id_template) === '153' || String(s.codi_template_srv) === '153') && 
            s.estado_srv === 'Pre Creado'
        );

        console.log(`Se encontraron ${reclamosPreCreados.length} reclamos en estado Pre Creado.`);

        for (const r of reclamosPreCreados) {
            console.log(`Normalizando Reclamo ID: ${r.id_survey}...`);
            
            // 1. Obtener Flujo de Aprobacion
            const resFlujo = await new Promise((resolve, reject) => {
                https.get(`${baseURL}/servicio/leanglobal/flujosAprobacion`, (res) => {
                    let data = '';
                    res.on('data', chunk => data += chunk);
                    res.on('end', () => resolve(JSON.parse(data)));
                });
            });
            const flowRow = (resFlujo.datos || []).find(f => Number(f.id_survey) === Number(r.id_survey));
            const idFlow = flowRow?.id_flow;

            if (!idFlow) {
                console.log(`  No se encontro id_flow para el survey ${r.id_survey}`);
                continue;
            }

            // 2. Actualizar estado del survey a 'Creado'
            await new Promise((resolve, reject) => {
                const payload = JSON.stringify({ id_survey: r.id_survey, estado_srv: 'Creado' });
                const req = https.request(`${baseURL}/survey/UpdSurveyEstado`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Content-Length': Buffer.byteLength(payload)
                    }
                }, (res) => {
                    let data = '';
                    res.on('data', chunk => data += chunk);
                    res.on('end', resolve);
                });
                req.write(payload);
                req.end();
            });

            console.log(`  -> Reclamo ${r.id_survey} actualizado a Creado.`);
        }

        console.log("Normalizacion completada!");

    } catch (e) {
        console.error("Error durante la normalizacion", e);
    }
}

normalizeSurveys();
