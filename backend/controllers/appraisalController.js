const db = require('../db');
const { logHistory } = require('../utils/historyLogger');

const BASE_URL = process.env.BASE_URL || 'http://localhost:4000';

// ==============================
// HELPERS
// ==============================

const safeJSON = (data) => {
  try {
    return JSON.stringify(data || {});
  } catch {
    return JSON.stringify({});
  }
};

const parseJSONColumn = (value) => {
  if (!value) return {};
  if (typeof value === 'object') return value;

  try {
    return JSON.parse(value);
  } catch {
    return {};
  }
};

const formatDateOnly = (value) => {
  if (!value) return null;

  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return value.toISOString().slice(0, 10);
  }

  const stringValue = String(value).trim();

  if (/^\d{4}-\d{2}-\d{2}$/.test(stringValue)) {
    return stringValue;
  }

  const parsed = new Date(stringValue);

  if (Number.isNaN(parsed.getTime())) {
    return null;
  }

  return parsed.toISOString().slice(0, 10);
};

const formatDateTimeForMySQL = (value) => {
  const parsed = value ? new Date(value) : new Date();

  if (Number.isNaN(parsed.getTime())) {
    return new Date().toISOString().slice(0, 19).replace('T', ' ');
  }

  return parsed.toISOString().slice(0, 19).replace('T', ' ');
};

const buildPhotoUrl = (filePath) => {
  if (!filePath) return null;
  return `${BASE_URL}${String(filePath).replace(/\\/g, '/')}`;
};

const getActorInfo = async (usuario) => {
  if (!usuario?.id) {
    return { id: null, nombreCompleto: 'Sistema' };
  }

  try {
    const [rows] = await db.query(
      `SELECT nombre, apellido FROM usuarios WHERE id = ? LIMIT 1`,
      [usuario.id]
    );

    if (!rows.length) {
      return {
        id: usuario.id,
        nombreCompleto: `Usuario ${usuario.id}`
      };
    }

    const row = rows[0];
    const nombreCompleto = `${row.nombre || ''} ${row.apellido || ''}`.trim();

    return {
      id: usuario.id,
      nombreCompleto: nombreCompleto || `Usuario ${usuario.id}`
    };
  } catch (error) {
    return {
      id: usuario.id,
      nombreCompleto: `Usuario ${usuario.id}`
    };
  }
};

const ensureColumnExists = async ({ table, column, definition }) => {
  const [rows] = await db.query(
    `
    SELECT 1
    FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = ?
      AND COLUMN_NAME = ?
    LIMIT 1
    `,
    [table, column]
  );

  if (!rows.length) {
    await db.query(`ALTER TABLE ${table} ADD COLUMN ${definition}`);
  }
};

const ensureAppraisalWorkflowColumns = async () => {
  await ensureColumnExists({
    table: 'appraisals',
    column: 'gerente_validado_por',
    definition: 'gerente_validado_por INT NULL'
  });
  await ensureColumnExists({
    table: 'appraisals',
    column: 'gerente_validado_at',
    definition: 'gerente_validado_at DATETIME NULL'
  });
  await ensureColumnExists({
    table: 'appraisals',
    column: 'gerente_validacion_observaciones',
    definition: 'gerente_validacion_observaciones VARCHAR(600) NULL'
  });
  await ensureColumnExists({
    table: 'appraisals',
    column: 'avance_porcentaje',
    definition: 'avance_porcentaje INT NOT NULL DEFAULT 0'
  });
  await db.query(`
    ALTER TABLE appraisals
    MODIFY COLUMN estatus ENUM(
      'borrador',
      'incompleto',
      'pendiente_validacion',
      'completo',
      'comprado'
    ) NOT NULL DEFAULT 'borrador'
  `);
};

const ensureFollowupsTable = async () => {
  await db.query(`
    CREATE TABLE IF NOT EXISTS appraisal_followups (
      id INT AUTO_INCREMENT PRIMARY KEY,
      appraisal_id BIGINT NOT NULL,
      comentario VARCHAR(600) NOT NULL,
      creado_por INT NULL,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_followups_appraisal (appraisal_id)
    )
  `);
};

const normalizeAppraisalStatus = (status) => {
  const value = String(status || '').trim().toLowerCase();
  if (!value || value === 'borrador') return 'incompleto';
  return value;
};

const calculateProgressPercentage = (payload = {}) => {
  const sections = [
    payload.generales,
    payload.documentacion,
    payload.interior,
    payload.carroceria,
    payload.sistemaElectrico,
    payload.fugasMotor,
    payload.valuacion
  ];
  const completed = sections.filter((section) => Object.keys(section || {}).length > 0).length;
  return Math.round((completed / sections.length) * 100);
};

const getUserDisplayNameById = async (userId) => {
  if (!userId) return null;
  const [rows] = await db.query(
    `SELECT nombre, apellido FROM usuarios WHERE id = ? LIMIT 1`,
    [userId]
  );
  if (!rows.length) return `Usuario ${userId}`;
  const row = rows[0];
  const fullName = `${row.nombre || ''} ${row.apellido || ''}`.trim();
  return fullName || `Usuario ${userId}`;
};

// ==============================
// MAPEADOR
// ==============================

const mapAppraisalRow = async (row) => {
  const [photos] = await db.query(
    `
    SELECT *
    FROM appraisal_photos
    WHERE appraisal_id = ?
    ORDER BY created_at ASC
    `,
    [row.id]
  );

  const fotosGenerales = photos
    .filter((p) => p.photo_type === 'general')
    .map((p) => ({
      id: p.id,
      slotKey: p.slot_key,
      name: p.original_name,
      fileName: p.file_name,
      path: p.file_path,
      mimeType: p.mime_type,
      url: buildPhotoUrl(p.file_path)
    }));

  const fotosDetalle = photos
    .filter((p) => p.photo_type === 'detail')
    .map((p) => ({
      id: p.id,
      name: p.original_name,
      fileName: p.file_name,
      path: p.file_path,
      mimeType: p.mime_type,
      url: buildPhotoUrl(p.file_path)
    }));

  const gerenteValidadoNombre = await getUserDisplayNameById(row.gerente_validado_por);

  return {
    id: row.id,
    folio: row.folio,
    clienteNombre: row.cliente_nombre,
    clienteTelefono: row.cliente_telefono,
    vehiculoInteres: row.vehiculo_interes,
    fechaAvaluo: row.fecha_avaluo,
    fechaActualizacion: row.fecha_actualizacion,
    estatus: row.estatus,
    avancePorcentaje: Number(row.avance_porcentaje) || 0,
    asesorVentas: row.asesor_ventas,
    generales: parseJSONColumn(row.generales_json),
    documentacion: parseJSONColumn(row.documentacion_json),
    interior: parseJSONColumn(row.interior_json),
    carroceria: parseJSONColumn(row.carroceria_json),
    sistemaElectrico: parseJSONColumn(row.sistema_electrico_json),
    fugasMotor: parseJSONColumn(row.fugas_motor_json),
    valuacion: parseJSONColumn(row.valuacion_json),
    validacionGerente: {
      validadoPor: row.gerente_validado_por || null,
      validadoNombre: gerenteValidadoNombre || null,
      validadoAt: row.gerente_validado_at || null,
      observaciones: row.gerente_validacion_observaciones || ''
    },
    fotosGenerales,
    fotosDetalle
  };
};

// ==============================
// LISTAR
// ==============================

const listarAppraisals = async (req, res) => {
  try {
    await ensureAppraisalWorkflowColumns();
    const [rows] = await db.query(
      `SELECT * FROM appraisals ORDER BY fecha_actualizacion DESC`
    );

    const data = await Promise.all(rows.map(mapAppraisalRow));

    res.json({
      ok: true,
      appraisals: data
    });
  } catch (error) {
    console.error('Error al listar avalúos:', error);
    res.status(500).json({
      ok: false,
      error: 'Error al listar avalúos'
    });
  }
};

// ==============================
// OBTENER POR ID
// ==============================

const obtenerAppraisalPorId = async (req, res) => {
  try {
    await ensureAppraisalWorkflowColumns();
    const { id } = req.params;

    const [rows] = await db.query(
      `SELECT * FROM appraisals WHERE id = ? LIMIT 1`,
      [id]
    );

    if (!rows.length) {
      return res.status(404).json({
        ok: false,
        error: 'Avalúo no encontrado'
      });
    }

    const appraisal = await mapAppraisalRow(rows[0]);

    res.json({
      ok: true,
      appraisal
    });
  } catch (error) {
    console.error('Error al obtener avalúo:', error);
    res.status(500).json({
      ok: false,
      error: 'Error al obtener avalúo'
    });
  }
};

// ==============================
// HISTORIAL
// ==============================

const obtenerHistorialAppraisal = async (req, res) => {
  try {
    const { id } = req.params;

    const [rows] = await db.query(
      `SELECT * FROM appraisal_history WHERE appraisal_id = ? ORDER BY created_at DESC, id DESC`,
      [id]
    );

    res.json({
      ok: true,
      historial: rows
    });
  } catch (error) {
    console.error('Error al obtener historial:', error);
    res.status(500).json({
      ok: false,
      error: 'Error al obtener historial'
    });
  }
};

const obtenerFollowupsAppraisal = async (req, res) => {
  try {
    await ensureFollowupsTable();
    const { id } = req.params;
    const [rows] = await db.query(
      `SELECT * FROM appraisal_followups WHERE appraisal_id = ? ORDER BY created_at DESC, id DESC`,
      [id]
    );
    res.json({ ok: true, followups: rows });
  } catch (error) {
    console.error('Error al obtener seguimientos:', error);
    res.status(500).json({ ok: false, error: 'Error al obtener seguimientos' });
  }
};

const crearFollowupAppraisal = async (req, res) => {
  try {
    await ensureFollowupsTable();
    const { id } = req.params;
    const comentario = String(req.body?.comentario || '').trim();
    if (!comentario) {
      return res.status(400).json({ ok: false, error: 'El comentario es obligatorio' });
    }
    await db.query(
      `INSERT INTO appraisal_followups (appraisal_id, comentario, creado_por) VALUES (?, ?, ?)`,
      [id, comentario, req.usuario?.id || null]
    );
    const actor = await getActorInfo(req.usuario);
    await logHistory({
      appraisalId: Number(id),
      usuario: actor,
      accion: 'FOLLOWUP_CREATED',
      detalle: comentario
    });
    return res.json({ ok: true, message: 'Seguimiento agregado' });
  } catch (error) {
    console.error('Error al crear seguimiento:', error);
    res.status(500).json({ ok: false, error: 'Error al crear seguimiento' });
  }
};

// ==============================
// CREAR
// ==============================

const crearAppraisal = async (req, res) => {
  try {
    await ensureAppraisalWorkflowColumns();
    const {
      id,
      folio,
      clienteNombre,
      clienteTelefono,
      vehiculoInteres,
      fechaAvaluo,
      fechaActualizacion,
      estatus,
      asesorVentas,
      generales,
      documentacion,
      interior,
      carroceria,
      sistemaElectrico,
      fugasMotor,
      valuacion
    } = req.body;

    const normalizedStatus = normalizeAppraisalStatus(estatus);
    const fechaAvaluoFormateada = formatDateOnly(fechaAvaluo);
    const fechaActualizacionMysql = formatDateTimeForMySQL(fechaActualizacion);
    const avancePorcentaje = calculateProgressPercentage({
      generales,
      documentacion,
      interior,
      carroceria,
      sistemaElectrico,
      fugasMotor,
      valuacion
    });

    if (
      !id ||
      !folio ||
      !clienteNombre ||
      !clienteTelefono ||
      !vehiculoInteres ||
      !fechaAvaluoFormateada
    ) {
      return res.status(400).json({
        ok: false,
        error: 'Faltan campos obligatorios del avalúo'
      });
    }

    const [exists] = await db.query(
      `SELECT id FROM appraisals WHERE id = ? OR folio = ? LIMIT 1`,
      [id, folio]
    );

    if (exists.length) {
      return res.status(400).json({
        ok: false,
        error: 'Ya existe un avalúo con ese identificador o folio'
      });
    }

    const [insertResult] = await db.query(
      `
      INSERT INTO appraisals (
        id,
        folio,
        cliente_nombre,
        cliente_telefono,
        vehiculo_interes,
        fecha_avaluo,
        fecha_actualizacion,
        estatus,
        asesor_ventas,
        generales_json,
        documentacion_json,
        interior_json,
        carroceria_json,
        sistema_electrico_json,
        fugas_motor_json,
        valuacion_json,
        creado_por,
        avance_porcentaje
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        id,
        folio,
        clienteNombre,
        clienteTelefono,
        vehiculoInteres,
        fechaAvaluoFormateada,
        fechaActualizacionMysql,
        normalizedStatus,
        asesorVentas || null,
        safeJSON(generales),
        safeJSON(documentacion),
        safeJSON(interior),
        safeJSON(carroceria),
        safeJSON(sistemaElectrico),
        safeJSON(fugasMotor),
        safeJSON(valuacion),
        req.usuario?.id || null,
        avancePorcentaje
      ]
    );

    if (!insertResult || insertResult.affectedRows !== 1) {
      return res.status(500).json({
        ok: false,
        error: 'No se pudo confirmar la inserción del avalúo'
      });
    }

    const actor = await getActorInfo(req.usuario);

    await logHistory({
      appraisalId: id,
      usuario: actor,
      accion: 'CREATED',
      detalle: `Avalúo creado con estatus ${normalizedStatus}`
    });

    res.json({
      ok: true,
      message: 'Avalúo creado correctamente',
      appraisalId: id
    });
  } catch (error) {
    console.error('Error al crear avalúo:', error);
    console.error('Error SQL message:', error?.message);
    console.error('Error SQL code:', error?.code);
    console.error('Error SQL errno:', error?.errno);
    console.error('Error SQL sqlMessage:', error?.sqlMessage);
    console.error('Error SQL sqlState:', error?.sqlState);

    res.status(500).json({
      ok: false,
      error: 'Error al crear avalúo',
      detalle: error?.sqlMessage || error?.message || 'Error desconocido'
    });
  }
};

// ==============================
// ACTUALIZAR
// ==============================

const actualizarAppraisal = async (req, res) => {
  try {
    await ensureAppraisalWorkflowColumns();
    const { id } = req.params;

    const {
      folio,
      clienteNombre,
      clienteTelefono,
      vehiculoInteres,
      fechaAvaluo,
      fechaActualizacion,
      estatus,
      asesorVentas,
      generales,
      documentacion,
      interior,
      carroceria,
      sistemaElectrico,
      fugasMotor,
      valuacion,
      validacionGerente
    } = req.body;

    const [rows] = await db.query(
      `SELECT id, estatus, carroceria_json, sistema_electrico_json, fugas_motor_json FROM appraisals WHERE id = ? LIMIT 1`,
      [id]
    );

    if (!rows.length) {
      return res.status(404).json({
        ok: false,
        error: 'Avalúo no encontrado'
      });
    }

    const estatusActual = rows[0].estatus;
    const currentCarroceria = parseJSONColumn(rows[0].carroceria_json);
    const currentSistemaElectrico = parseJSONColumn(rows[0].sistema_electrico_json);
    const currentFugasMotor = parseJSONColumn(rows[0].fugas_motor_json);
    const estatusNuevo = normalizeAppraisalStatus(estatus);
    const fechaAvaluoFormateada = formatDateOnly(fechaAvaluo);
    const fechaActualizacionMysql = formatDateTimeForMySQL(fechaActualizacion);

    if (!fechaAvaluoFormateada) {
      return res.status(400).json({
        ok: false,
        error: 'La fecha de avalúo no es válida'
      });
    }

    if (estatusActual === 'comprado' && req.usuario?.rol !== 'administrador') {
      return res.status(403).json({
        ok: false,
        error: 'No puedes editar un avalúo comprado'
      });
    }

    const rol = String(req.usuario?.rol || '').toLowerCase();
    const isManagerRole = ['administrador', 'gerente_avaluos', 'gerente'].includes(rol);
    const isTechnicalRole = ['tecnico_servicio', 'tecnico'].includes(rol);

    const technicalChanged =
      JSON.stringify(currentCarroceria) !== JSON.stringify(carroceria || {}) ||
      JSON.stringify(currentSistemaElectrico) !== JSON.stringify(sistemaElectrico || {}) ||
      JSON.stringify(currentFugasMotor) !== JSON.stringify(fugasMotor || {});

    if (technicalChanged && !isTechnicalRole && !isManagerRole) {
      return res.status(403).json({
        ok: false,
        error: 'Solo técnico de servicio o gerencia puede editar bloques técnicos'
      });
    }

    if (estatusNuevo === 'comprado' && (estatusActual !== 'completo' || !isManagerRole)) {
      return res.status(403).json({
        ok: false,
        error: 'Solo gerencia puede confirmar compra desde pendiente de validación'
      });
    }

    const managerValidationBy = isManagerRole && estatusNuevo === 'comprado'
      ? Number(req.usuario?.id) || null
      : null;
    const managerValidationAt = isManagerRole && estatusNuevo === 'comprado'
      ? new Date()
      : null;
    const managerValidationNotes = isManagerRole && estatusNuevo === 'comprado'
      ? String(validacionGerente?.observaciones || '').trim() || null
      : null;
    const avancePorcentaje = calculateProgressPercentage({
      generales,
      documentacion,
      interior,
      carroceria,
      sistemaElectrico,
      fugasMotor,
      valuacion
    });

    const [updateResult] = await db.query(
      `
      UPDATE appraisals
      SET
        folio = ?,
        cliente_nombre = ?,
        cliente_telefono = ?,
        vehiculo_interes = ?,
        fecha_avaluo = ?,
        fecha_actualizacion = ?,
        estatus = ?,
        asesor_ventas = ?,
        generales_json = ?,
        documentacion_json = ?,
        interior_json = ?,
        carroceria_json = ?,
        sistema_electrico_json = ?,
        fugas_motor_json = ?,
        valuacion_json = ?,
        avance_porcentaje = ?,
        gerente_validado_por = ?,
        gerente_validado_at = ?,
        gerente_validacion_observaciones = ?
      WHERE id = ?
      `,
      [
        folio,
        clienteNombre,
        clienteTelefono,
        vehiculoInteres,
        fechaAvaluoFormateada,
        fechaActualizacionMysql,
        estatusNuevo,
        asesorVentas || null,
        safeJSON(generales),
        safeJSON(documentacion),
        safeJSON(interior),
        safeJSON(carroceria),
        safeJSON(sistemaElectrico),
        safeJSON(fugasMotor),
        safeJSON(valuacion),
        avancePorcentaje,
        managerValidationBy,
        managerValidationAt,
        managerValidationNotes,
        id
      ]
    );

    if (!updateResult || updateResult.affectedRows !== 1) {
      return res.status(500).json({
        ok: false,
        error: 'No se pudo confirmar la actualización del avalúo'
      });
    }

    if (estatusNuevo === 'comprado' && estatusActual !== 'comprado') {
  const valuacionData = valuacion || {};
  const precioCompra = Number(valuacionData.tomaAutorizada) || 0;

  await db.query(
    `
    INSERT IGNORE INTO inventario (appraisal_id, precio_compra)
    VALUES (?, ?)
    `,
    [id, precioCompra]
  );
}

    const actor = await getActorInfo(req.usuario);

    await logHistory({
      appraisalId: Number(id),
      usuario: actor,
      accion: 'UPDATED',
      detalle: `Avalúo actualizado por ${actor.nombreCompleto}`
    });

    if (estatusActual !== estatusNuevo) {
      await logHistory({
        appraisalId: Number(id),
        usuario: actor,
        accion: 'STATUS_CHANGED',
        detalle: `Estatus cambiado de ${estatusActual} a ${estatusNuevo}`
      });
    }

    if (managerValidationBy) {
      await logHistory({
        appraisalId: Number(id),
        usuario: actor,
        accion: 'MANAGER_VALIDATED',
        detalle: `Gerencia validó compra${managerValidationNotes ? `: ${managerValidationNotes}` : ''}`
      });
    }

    if (estatusActual === 'comprado' && req.usuario?.rol === 'administrador') {
      await logHistory({
        appraisalId: Number(id),
        usuario: actor,
        accion: 'COMPLETED_RECORD_EDITED',
        detalle: 'Un administrador editó un avalúo comprado'
      });
    }

    res.json({
      ok: true,
      message: 'Avalúo actualizado correctamente',
      appraisalId: Number(id)
    });
  } catch (error) {
    console.error('Error al actualizar avalúo:', error);
    console.error('Error SQL message:', error?.message);
    console.error('Error SQL code:', error?.code);
    console.error('Error SQL errno:', error?.errno);
    console.error('Error SQL sqlMessage:', error?.sqlMessage);
    console.error('Error SQL sqlState:', error?.sqlState);

    res.status(500).json({
      ok: false,
      error: 'Error al actualizar avalúo',
      detalle: error?.sqlMessage || error?.message || 'Error desconocido'
    });
  }
};

// ==============================

module.exports = {
  listarAppraisals,
  obtenerAppraisalPorId,
  obtenerHistorialAppraisal,
  obtenerFollowupsAppraisal,
  crearFollowupAppraisal,
  crearAppraisal,
  actualizarAppraisal
};
