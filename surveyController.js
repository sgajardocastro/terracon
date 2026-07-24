const surveyModel = require("../models/surveyModel");
const survey = new surveyModel();
const { crearConsentimientoEnrolamiento } = require("../services/enrolamientoService");

module.exports = {
  postSurvey: async (req, res) => {
    try {
      const {
        id_tipo_srv,
        id_template,
        id_user,
        id_user_creacion,
        id_empresa_cliente,
        estado_srv = "Creado",
        header_seed,
        body_seed,
        approval_seed,
        header_exec,
        body_exec,
        approval_exec,
        fecha_plan_ini,
        fecha_plan_fin,
        fecha_real_ini,
        fecha_real_fin,
        fecha_upload,
        latitud,
        longitud,
        id_proyecto,
        id_flow_tmpl,
        id_survey_padre,
      } = req.body;
      const id_personalizado = req.body.id_personalizado ?? null;

      const idSurvey = await survey.postSurvey({
        id_tipo_srv,
        id_template,
        id_user,
        id_user_creacion,
        id_empresa_cliente,
        estado_srv,
        header_seed,
        body_seed,
        approval_seed,
        header_exec,
        body_exec,
        approval_exec,
        fecha_plan_ini,
        fecha_plan_fin,
        fecha_real_ini,
        fecha_real_fin,
        fecha_upload,
        latitud,
        longitud,
        id_proyecto,
        id_flow_tmpl,
        id_personalizado,
        id_survey_padre: id_survey_padre ?? null,
      });

      res.status(201).json({ message: "Survey creado correctamente", idSurvey });
    } catch (err) {
      console.error("Error en postSurvey:", err);
      res.status(500).json({ error: err.message });
    }
  },
  // ⭐⭐⭐ NUEVO: crea el survey de consentimiento + flow listo para firmar
  postConsentimientoEnrolamiento: async (req, res) => {
    try {
      const { id_user, rut } = req.body; // 👈 viene desde el front

      if (!id_user || !rut) {
        return res.status(400).json({ error: "Faltan id_user o rut" });
      }

      const payload = await crearConsentimientoEnrolamiento({ id_user, rut });

      return res.status(200).json(payload);
    } catch (err) {
      console.error("❌ Error en postConsentimientoEnrolamiento:", err);
      return res.status(500).json({ error: err.message });
    }
  },
  
  putSurvey: async (req, res) => {
    try {
      const { id_survey } = req.params;
      const { estado_srv, body_exec, fecha_real_ini, latitud, longitud } = req.body;

      const updated = await survey.updateSurveyFields(id_survey, {
        estado_srv,
        body_exec,
        fecha_real_ini,        
        latitud,
        longitud
      });

      res.status(200).json({ message: "Survey actualizado correctamente", updated });
    } catch (err) {
      console.error("Error en putSurvey:", err);
      res.status(500).json({ error: err.message });
    }
  },
  putSurveyFechaEjecFin: async (req, res) => {
    try {
      const { id_survey } = req.params;
      const { estado_srv, body_exec, fecha_real_ini, fecha_ejec_fin, latitud, longitud } = req.body;

      const updated = await survey.updateSurveyFieldsFechaEjecFin(id_survey, {
        estado_srv,
        body_exec,
        fecha_real_ini,
        fecha_ejec_fin,
        latitud,
        longitud
      });

      res.status(200).json({ message: "Survey actualizado correctamente", updated });
    } catch (err) {
      console.error("Error en putSurvey:", err);
      res.status(500).json({ error: err.message });
    }
  },
  putSurveyPlan: async (req, res) => {
    try {
      const { id_survey } = req.params;
      const { id_user, fecha_plan_ini, fecha_plan_fin } = req.body;

      const updated = await survey.updateSurveyPlanFields(id_survey, { id_user, fecha_plan_ini, fecha_plan_fin } );

      res.status(200).json({ message: "Survey Plan actualizado correctamente", updated });
    } catch (err) {
      console.error("Error en putSurveyPlan:", err);
      res.status(500).json({ error: err.message });
    }
  },
  putSurveyUserFlow: async (req, res) => {
    try {      
      const { id_flow_stp, id_user_flujo, flag_equipo } = req.body;
      const updated = await survey.updateSurveyUserFlow({ id_flow_stp, id_user_flujo, flag_equipo });

      res.status(200).json({ message: "Survey User Flow actualizado correctamente", updated });
    } catch (err) {
      console.error("Error en putSurveyUserFlow:", err);
      res.status(500).json({ error: err.message });
    }
  },
  postDelSurvey: async (req, res) => {
    try {
      const { id_survey } = req.body;
      if (!id_survey) {
        return res.status(400).json({ error: "El campo id_survey es obligatorio" });
      } 
      const deleted = await survey.deleteSurvey(id_survey);
      res.status(200).json({ message: "Survey eliminado correctamente", deleted });
    } catch (err) {
      console.error("Error en postDelSurvey:", err);
      res.status(500).json({ error: err.message });
    } 
  },
  postUpdSurveyEstado: async (req, res) => {
    try {
      const { id_survey, estado_srv } = req.body;

      if (!id_survey) {
        return res
          .status(400)
          .json({ error: "El campo id_survey es obligatorio" });
      }

      // Si no viene estado, por defecto lo dejamos en 'Creado'
      const estado = estado_srv || 'Creado';

      const result = await survey.updateSurveyEstado(id_survey, estado);

      res.status(200).json({
        message: "Estado del survey actualizado correctamente",
        survey: result.survey,
      });
    } catch (err) {
      console.error("Error en postUpdSurveyEstado:", err);
      res.status(500).json({ error: err.message });
    }
  },
  postReopenSurvey: async (req, res) => {
    try {
      const { id_survey } = req.body;

      if (!id_survey) {
        return res
          .status(400)
          .json({ error: "El campo id_survey es obligatorio" });
      }

      const result = await survey.reopenSurvey(id_survey);

      res.status(200).json({
        message: "Survey reabierto y firmas limpiadas correctamente",
        survey: result.survey,
      });
    } catch (err) {
      console.error("Error en postReopenSurvey:", err);
      res.status(500).json({ error: err.message });
    }
  },
  postUpdSurveyAsignaciones: async (req, res) => {
    try {
      const { id_survey, asignaciones } = req.body;

      if (!id_survey) {
        return res.status(400).json({ error: "El campo id_survey es obligatorio" });
      }

      // normaliza asignaciones a OBJETO
      let asignObj = null;
      if (Array.isArray(asignaciones)) asignObj = asignaciones[0] ?? null;
      else if (asignaciones && typeof asignaciones === "object") asignObj = asignaciones;

      if (!asignObj || typeof asignObj !== "object") {
        return res.status(400).json({ error: "asignaciones debe ser un objeto o [ { ... } ]" });
      }

      // normaliza a números
      const normalizada = {};
      for (const [k, v] of Object.entries(asignObj)) {
        const n = Number(v);
        if (Number.isFinite(n) && n > 0) normalizada[k] = n;
      }

      if (!Object.keys(normalizada).length) {
        return res.status(400).json({ error: "asignaciones no tiene ids válidos (>0)" });
      }

      // 1) leer body_exec actual
      const bodyExec = (await survey.getBodyExecBySurveyId(id_survey)) || {};

      // 2) upsert asignaciones (si existe merge, si no crea)
      const actual = (
        Array.isArray(bodyExec.asignaciones) &&
        bodyExec.asignaciones[0] &&
        typeof bodyExec.asignaciones[0] === "object"
      ) ? bodyExec.asignaciones[0] : {};

      bodyExec.asignaciones = [ { ...actual, ...normalizada } ];

      // 3) guardar SOLO body_exec
      const updated = await survey.updateSurveyBodyExecOnly(id_survey, bodyExec);

      return res.status(200).json({
        message: "Asignaciones actualizadas correctamente",
        updated
      });

    } catch (err) {
      console.error("Error en postUpdSurveyAsignaciones:", err);
      return res.status(500).json({ error: err.message });
    }
  }
};