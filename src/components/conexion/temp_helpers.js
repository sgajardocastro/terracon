function getLatestHistoryData(item) {
    const certs = certificationsMap.value[item.id_equipo];
    if (!certs || certs.length === 0) return null;
    
    // Sort logic to be sure we get the latest by date
    const sorted = [...certs].sort((a, b) => {
        const dA = new Date(a.fecha_ult_calibracion || 0);
        const dB = new Date(b.fecha_ult_calibracion || 0);
        return dB - dA; 
    });
    
    return sorted[0];
}

function getDisplayPresion(item) {
    const last = getLatestHistoryData(item);
    if (last && last.json_data && last.json_data.presion) {
        return last.json_data.presion;
    }
    return item.presion || 'NA';
}

function getDisplayUsuario(item) {
    const last = getLatestHistoryData(item);
    if (last && last.id_usuario_responsable) {
        return getUserName(last.id_usuario_responsable);
    }
    return item.usuario || (item.nombre_responsable || '-');
}
