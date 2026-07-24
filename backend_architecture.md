
# Análisis de Integración Backend - Módulo de Equipamiento

## 1. Brecha Funcional (Gap Analysis)

Comparando el esquema proporcionado con los requisitos del Frontend (`TablaEquipamiento.vue`, `EquipamientoConexionIndicadores.vue`), se identifican los siguientes puntos faltantes o mejoras necesarias:

### A. Usuario Asignado vs Usuario Creación
- **Frontend requiere:** "Usuario Asignado".
- **Backend tiene:** `id_usuario_creacion` (quien dio de alta el equipo) y `id_usuario_registro` (quien subió el documento).
- **Faltante:** No existe un campo explícito para el "Dueño" o "Responsable" actual del equipo si este cambia.
- **Solución:** Agregar `id_usuario_responsable` a `TEQU_EQUIPO`.

### B. Estados de Negocio vs Estados de Sistema
- **Frontend requiere:** `Cumple`, `No Cumple`, `En Calibración`, `Por Vencer`.
- **Backend tiene:** `estado` ('Abierto' | 'Cerrado').
- **Faltante:** Lógica para traducir fechas y estados binarios a los 4 estados de negocio.
- **Solución:** Crear una VISTA (View) que encapsule esta lógica.

### C. Contratista
- **Frontend requiere:** Nombre del Contratista.
- **Backend tiene:** Relación a `tsec_users` -> `tpar_empresas`.
- **Solución:** Resolver mediante JOIN en la Vista principal.

---

## 2. Propuesta de DDL (Schema Extensions)

```sql
-- Agregar campo de responsable (Usuario Asignado)
ALTER TABLE sch_leansurvey_dev.TEQU_EQUIPO 
ADD COLUMN id_usuario_responsable INTEGER REFERENCES sch_leansurvey_dev.tsec_users(id_user);

-- Actualizar históricos existentes (por defecto el creador es responsable)
UPDATE sch_leansurvey_dev.TEQU_EQUIPO SET id_usuario_responsable = id_usuario_creacion 
WHERE id_usuario_responsable IS NULL;
```

---

## 3. Automatización (Triggers)

Implementación de la regla de negocio: *"Si fecha_prox_calibracion < NOW(), estado = Cerrado"*.

```sql
CREATE OR REPLACE FUNCTION sch_leansurvey_dev.fn_actualizar_estado_equipo()
RETURNS TRIGGER AS $$
BEGIN
    -- Si se inserta o actualiza una documentación, revisar la fecha más reciente
    -- y actualizar el estado del equipo padre.
    
    WITH UltimaDoc AS (
        SELECT id_equipo, fecha_prox_calibracion
        FROM sch_leansurvey_dev.TEQU_DOCUMENTACION_EQUIPO
        WHERE id_equipo = NEW.id_equipo
        ORDER BY fecha_prox_calibracion DESC
        LIMIT 1
    )
    UPDATE sch_leansurvey_dev.TEQU_EQUIPO
    SET estado = CASE 
        WHEN ud.fecha_prox_calibracion < CURRENT_DATE THEN 'Cerrado'
        ELSE 'Abierto'
    END
    FROM UltimaDoc ud
    WHERE sch_leansurvey_dev.TEQU_EQUIPO.id_equipo = ud.id_equipo;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_actualizar_vencimiento
AFTER INSERT OR UPDATE ON sch_leansurvey_dev.TEQU_DOCUMENTACION_EQUIPO
FOR EACH ROW
EXECUTE FUNCTION sch_leansurvey_dev.fn_actualizar_estado_equipo();
```

---

## 4. Vistas para el Frontend (Data Layers)

### Vista Principal: `vw_equipos_dashboard`

Esta vista alimenta directamente a `TablaEquipamiento.vue`.

```sql
CREATE OR REPLACE VIEW sch_leansurvey_dev.vw_equipos_dashboard AS
SELECT 
    e.id_equipo,
    e.marca,
    e.numero_serie AS serie,
    e.tipo_equipo AS tipo,
    e.json_data->>'presion' AS presion, -- Extracción JSONB
    e.fecha_registro,
    
    -- Información de la última calibración
    d.fecha_ult_calibracion,
    d.fecha_prox_calibracion,
    d.registro_acreditacion AS id_doc,
    
    -- Usuarios y Empresa
    u.codi_user || ' ' || u.apellido_pat AS usuario, -- Formato corto
    emp.razon_social AS contratista, -- Asumiendo tpar_empresas.razon_social
    
    -- Lógica de Estados de Negocio (Frontend)
    CASE 
        WHEN e.estado = 'Cerrado' THEN 'No Cumple'
        WHEN d.fecha_prox_calibracion < CURRENT_DATE THEN 'No Cumple' -- Redundancia de seguridad
        WHEN d.fecha_prox_calibracion BETWEEN CURRENT_DATE AND (CURRENT_DATE + INTERVAL '30 days') THEN 'Por Vencer'
        WHEN d.estado = 'En Proceso' THEN 'En Calibración' -- Si existiera este estado intermedio en Docs
        ELSE 'Cumple'
    END AS estado_negocio,
    
    -- Metadatos para ordenamiento
    d.fecha_prox_calibracion AS sort_date

FROM sch_leansurvey_dev.TEQU_EQUIPO e
LEFT JOIN LATERAL (
    SELECT * FROM sch_leansurvey_dev.TEQU_DOCUMENTACION_EQUIPO 
    WHERE id_equipo = e.id_equipo 
    ORDER BY fecha_prox_calibracion DESC LIMIT 1
) d ON true
LEFT JOIN sch_leansurvey_dev.tsec_users u ON e.id_usuario_responsable = u.id_user
LEFT JOIN sch_leansurvey_dev.tpar_empresas emp ON u.id_empresa = emp.id_empresa;
```

### Vista de Indicadores: `vw_kpi_equipos`

Alimenta a `EquipamientoConexionIndicadores.vue`.

```sql
CREATE OR REPLACE VIEW sch_leansurvey_dev.vw_kpi_equipos AS
SELECT
    COUNT(*) AS total_equipos,
    COUNT(*) FILTER (WHERE estado_negocio = 'Cumple') AS total_cumple,
    COUNT(*) FILTER (WHERE estado_negocio = 'No Cumple') AS total_no_cumple,
    COUNT(*) FILTER (WHERE estado_negocio = 'En Calibración') AS total_en_calibracion,
    COUNT(*) FILTER (WHERE estado_negocio = 'Por Vencer') AS total_por_vencer
FROM sch_leansurvey_dev.vw_equipos_dashboard;
```
