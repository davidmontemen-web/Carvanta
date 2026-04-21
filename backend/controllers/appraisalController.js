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

  return {
    id: row.id,
    folio: row.folio,
    clienteNombre: row.cliente_nombre,
    clienteTelefono: row.cliente_telefono,
    vehiculoInteres: row.vehiculo_interes,
    fechaAvaluo: row.fecha_avaluo,
    fechaActualizacion: row.fecha_actualizacion,
    estatus: row.estatus,
    asesorVentas: row.asesor_ventas,
    generales: parseJSONColumn(row.generales_json),
    documentacion: parseJSONColumn(row.documentacion_json),
    interior: parseJSONColumn(row.interior_json),
    carroceria: parseJSONColumn(row.carroceria_json),
    sistemaElectrico: parseJSONColumn(row.sistema_electrico_json),
    fugasMotor: parseJSONColumn(row.fugas_motor_json),
    valuacion: parseJSONColumn(row.valuacion_json),
    fotosGenerales,
    fotosDetalle
  };
};

// ==============================
// LISTAR
// ==============================

const listarAppraisals = async (req, res) => {
  try {
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

// ==============================
// CREAR
// ==============================

const crearAppraisal = async (req, res) => {
  try {
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

    if (!id || !folio || !clienteNombre || !clienteTelefono || !vehiculoInteres || !fechaAvaluo) {
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
        creado_por
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        id,
        folio,
        clienteNombre,
        clienteTelefono,
        vehiculoInteres,
        fechaAvaluo,
        fechaActualizacion || new Date(),
        estatus || 'borrador',
        asesorVentas || null,
        safeJSON(generales),
        safeJSON(documentacion),
        safeJSON(interior),
        safeJSON(carroceria),
        safeJSON(sistemaElectrico),
        safeJSON(fugasMotor),
        safeJSON(valuacion),
        req.usuario?.id || null
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
      detalle: `Avalúo creado con estatus ${estatus || 'borrador'}`
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
      valuacion
    } = req.body;

    const [rows] = await db.query(
      `SELECT id, estatus FROM appraisals WHERE id = ? LIMIT 1`,
      [id]
    );

    if (!rows.length) {
      return res.status(404).json({
        ok: false,
        error: 'Avalúo no encontrado'
      });
    }

    const estatusActual = rows[0].estatus;
    const estatusNuevo = estatus || 'borrador';

    if (estatusActual === 'completo' && req.usuario?.rol !== 'administrador') {
      return res.status(403).json({
        ok: false,
        error: 'No puedes editar un avalúo completo'
      });
    }

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
        valuacion_json = ?
      WHERE id = ?
      `,
      [
        folio,
        clienteNombre,
        clienteTelefono,
        vehiculoInteres,
        fechaAvaluo,
        fechaActualizacion || new Date(),
        estatusNuevo,
        asesorVentas || null,
        safeJSON(generales),
        safeJSON(documentacion),
        safeJSON(interior),
        safeJSON(carroceria),
        safeJSON(sistemaElectrico),
        safeJSON(fugasMotor),
        safeJSON(valuacion),
        id
      ]
    );

    if (!updateResult || updateResult.affectedRows !== 1) {
      return res.status(500).json({
        ok: false,
        error: 'No se pudo confirmar la actualización del avalúo'
      });
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

    if (estatusActual === 'completo' && req.usuario?.rol === 'administrador') {
      await logHistory({
        appraisalId: Number(id),
        usuario: actor,
        accion: 'COMPLETED_RECORD_EDITED',
        detalle: 'Un administrador editó un avalúo completo'
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
  crearAppraisal,
  actualizarAppraisal
};