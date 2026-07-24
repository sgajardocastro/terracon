import api from './api';

export const sstService = {
    // Informe
    getOrCreateInforme: async (id_empresa, id_proyecto, id_periodo, tipo = 'SST') => {
        const response = await api.post('/sst/get-or-create', { id_empresa, id_proyecto, id_periodo, tipo });
        return response.data;
    },

    // Accidentabilidad
    getAccidentabilidad: async (id_informe) => {
        const response = await api.get(`/sst/accidentabilidad/${id_informe}`);
        return response.data;
    },

    saveAccidentabilidad: async (data) => {
        const response = await api.post('/sst/accidentabilidad', data);
        return response.data;
    },

    deleteAccidentabilidad: async (id_accidentabilidad) => {
        const response = await api.delete(`/sst/accidentabilidad/${id_accidentabilidad}`);
        return response.data;
    },

    updateInforme: async (id_informe, data) => {
        const response = await api.post(`/sst/informe/${id_informe}`, data);
        return response.data;
    },

    // Incidentes
    getIncidentes: async (id_informe) => {
        const response = await api.get(`/sst/incidentes/${id_informe}`);
        return response.data;
    },

    saveIncidente: async (data) => {
        const response = await api.post('/sst/incidentes', data);
        return response.data;
    },

    deleteIncidente: async (id_incidente) => {
        const response = await api.delete(`/sst/incidentes/${id_incidente}`);
        return response.data;
    },
    
    uploadPDF: async (id_informe, blob) => {
        const formData = new FormData();
        formData.append('pdf', blob, `informe_sst_${id_informe}.pdf`);
        const response = await api.post(`/sst/upload-pdf/${id_informe}`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return response.data;
    },

    savePDFFromHtml: async (id_informe, htmlContent) => {
        const response = await api.post(`/sst/generate-pdf-html/${id_informe}`, { htmlContent });
        return response.data;
    }
};
