const db = require('../db');

const mapAppraisalRow = async (row) => {
  const [photos] = await db.query(
    `
    SELECT id, photo_type, slot_key, original_name, file_name, file_path, mime_type, created_at
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
      url: `http://localhost:4000${p.file_path.replace(/\\/g, '/')}`
    }));

  const fotosDetalle = photos
    .filter((p) => p.photo_type === 'detail')
    .map((p) => ({
      id: p.id,
      name: p.original_name,
      fileName: p.file_name,
      path: p.file_path,
      mimeType: p.mime_type,
      url: `http://localhost:4000${p.file_path.replace(/\\/g, '/')}`
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
    generales: row.generales_json || {},
    documentacion: row.documentacion_json || {},
    interior: row.interior_json || {},
    carroceria: row.carroceria_json || {},
    sistemaElectrico: row.sistema_electrico_json || {},
    fugasMotor: row.fugas_motor_json || {},
    valuacion: row.valuacion_json || {},
    fotosGenerales,
    fotosDetalle
  };
};

const listarAppraisals = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT 
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
        valuacion_json
      FROM appraisals
      ORDER BY actualizado_en DESC
    `);

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

const obtenerAppraisalPorId = async (req, res) => {
  try {
    const { id } = req.params;

    const [rows] = await db.query(
      `
      SELECT 
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
        valuacion_json
      FROM appraisals
      WHERE id = ?
      LIMIT 1
      `,
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

    await db.query(
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
        fechaActualizacion || null,
        estatus || 'borrador',
        asesorVentas || null,
        JSON.stringify(generales || {}),
        JSON.stringify(documentacion || {}),
        JSON.stringify(interior || {}),
        JSON.stringify(carroceria || {}),
        JSON.stringify(sistemaElectrico || {}),
        JSON.stringify(fugasMotor || {}),
        JSON.stringify(valuacion || {}),
        req.usuario?.id || null
      ]
    );

    res.status(201).json({
  ok: true,
  message: 'Avalúo creado correctamente',
  appraisalId: id
});
  } catch (error) {
    console.error('Error al crear avalúo:', error);
    res.status(500).json({
      ok: false,
      error: 'Error al crear avalúo'
    });
  }
};

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

    const [exists] = await db.query(
      'SELECT id FROM appraisals WHERE id = ? LIMIT 1',
      [id]
    );

    if (!exists.length) {
      return res.status(404).json({
        ok: false,
        error: 'Avalúo no encontrado'
      });
    }

    await db.query(
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
        fechaActualizacion || null,
        estatus || 'borrador',
        asesorVentas || null,
        JSON.stringify(generales || {}),
        JSON.stringify(documentacion || {}),
        JSON.stringify(interior || {}),
        JSON.stringify(carroceria || {}),
        JSON.stringify(sistemaElectrico || {}),
        JSON.stringify(fugasMotor || {}),
        JSON.stringify(valuacion || {}),
        id
      ]
    );

    res.json({
  ok: true,
  message: 'Avalúo actualizado correctamente',
  appraisalId: id
});
  } catch (error) {
    console.error('Error al actualizar avalúo:', error);
    res.status(500).json({
      ok: false,
      error: 'Error al actualizar avalúo'
    });
  }
};

module.exports = {
  listarAppraisals,
  obtenerAppraisalPorId,
  crearAppraisal,
  actualizarAppraisal
};