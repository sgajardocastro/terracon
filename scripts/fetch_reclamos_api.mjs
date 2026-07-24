import https from 'https';

https.get('https://servidor.leanglobal.cl/lean-services-qa/api/servicio/leanglobal/procesosSurveyV3', (res) => {
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  res.on('end', () => {
    try {
      const parsed = JSON.parse(data);
      if (parsed.datos) {
        const template153 = parsed.datos.filter(item => String(item.id_template) === '153' || String(item.codi_template_srv) === '153');
        
        template153.forEach(item => {
           const str = JSON.stringify(item).toUpperCase();
           if (str.includes('JAVIER') || str.includes('MOYANO')) {
               console.log(`FOUND JAVIER in ID: ${item.id_survey} | ESTADO_SRV: ${item.estado_srv} | ID_USER: ${item.id_user}`);
               console.log(str.substring(0, 200) + "...");
           }
        });
      }
    } catch (e) {
      console.error("Parse error", e);
    }
  });
});
