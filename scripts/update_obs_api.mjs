import { NodeSSH } from 'node-ssh';

const ssh = new NodeSSH();

async function run() {
  try {
    console.log('🔌 Connecting to servidor.leanglobal.cl...');
    await ssh.connect({
      host: 'servidor.leanglobal.cl',
      port: 1295,
      username: 'root',
      password: 'lgbl2025.'
    });
    console.log('✅ SSH Connected.');

    // 1. Fetch current API observations state to /tmp/obs.json on the server
    console.log('📥 Fetching current state from API (port 3001)...');
    await ssh.execCommand('curl -s http://localhost:3001/api/observaciones > /tmp/obs.json');

    // 2. Modify template 74 using a Node inline execution on the server
    console.log('✏️ Modifying template 74 evidence to 4123 and resolving points...');
    const nodeInlineCmd = `node -e "
      const fs = require('fs');
      try {
        const data = JSON.parse(fs.readFileSync('/tmp/obs.json', 'utf8'));
        const item = data.find(x => Number(x.template_id) === 74);
        if (item) {
          console.log('Found template 74, updating...');
          item.evidenceId = '4123';
          item.pdfOk = true;
          item.notes = 'Evidencia en https://servidor.leanglobal.cl/lean-services-qa/api/archivo/terracon/66eb20d4-15d0-4859-a36a-1fe4c47aab1f.pdf. Se corrigió el ancho de columnas en el PDF y la secuencia de los ítems.';
          item.pointsState = {
            '0': { resolved: true, note: 'Corregido a aérea' },
            '1': { resolved: true, note: 'Corregido a el trabajador' }
          };
        } else {
          console.log('Template 74 not found in active list, adding it...');
          data.push({
            template_id: 74,
            template_nombre: 'OBSERVACION DE CONDUCTA / MAESTROS',
            template_codigo: 'TPI-XXX-PRR-REG-015',
            familia_id: 22,
            familia_nombre: 'Observaciones de Conducta (OBC)',
            evidenceId: '4123',
            pdfOk: true,
            notes: 'Evidencia en https://servidor.leanglobal.cl/lean-services-qa/api/archivo/terracon/66eb20d4-15d0-4859-a36a-1fe4c47aab1f.pdf. Se corrigió el ancho de columnas en el PDF y la secuencia de los ítems.',
            pointsState: {
              '0': { resolved: true, note: 'Corregido a aérea' },
              '1': { resolved: true, note: 'Corregido a el trabajador' }
            }
          });
        }
        fs.writeFileSync('/tmp/obs_updated.json', JSON.stringify(data), 'utf8');
        console.log('Saved updated file.');
      } catch (err) {
        console.error('Error in inline script:', err.message);
        process.exit(1);
      }
    "`;
    const nodeRes = await ssh.execCommand(nodeInlineCmd);
    console.log(nodeRes.stdout || nodeRes.stderr);

    // 3. POST the updated state back to the API
    console.log('📤 Posting updated state back to API (port 3001)...');
    const postRes = await ssh.execCommand('curl -s -X POST -H "Content-Type: application/json" -d @/tmp/obs_updated.json http://localhost:3001/api/observaciones');
    console.log('POST Response:', postRes.stdout || 'Success (No output)');

    // 4. Verify the updated state by fetching it again
    console.log('🔍 Verifying updated state for template 74 from API...');
    const verifyRes = await ssh.execCommand('curl -s http://localhost:3001/api/observaciones | node -e "
      const fs = require(\\'fs\\');
      const input = fs.readFileSync(0, \\'utf8\\');
      try {
        const data = JSON.parse(input);
        const item = data.find(x => Number(x.template_id) === 74);
        console.log('Template 74 API State:', JSON.stringify(item, null, 2));
      } catch(e) {
        console.log('Failed to parse response:', input);
      }
    "');
    console.log(verifyRes.stdout || verifyRes.stderr);

    // Clean up temporary files on the remote server
    await ssh.execCommand('rm -f /tmp/obs.json /tmp/obs_updated.json');

  } catch (err) {
    console.error('❌ Error:', err.message || err);
  } finally {
    ssh.dispose();
  }
}

run();
