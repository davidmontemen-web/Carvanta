const db = require('../db');

const parseJSONColumn = (value) => {
  if (!value) return {};
  if (typeof value === 'object') return value;

  try {
    return JSON.parse(value);
  } catch {
    return {};
  }
};

// Crear desde avalúo
const crearDesdeAvaluo = async (req, res) => {
  try {
    const { appraisalId, precioCompra } = req.body;

    const [exists] = await db.query(
      'SELECT id FROM inventario WHERE appraisal_id = ?',
      [appraisalId]
    );

    if (exists.length) {
      return res.status(400).json({
        ok: false,
        error: 'Este avalúo ya está en inventario'
      });
    }

    await db.query(
      `
      INSERT INTO inventario (appraisal_id, precio_compra)
      VALUES (?, ?)
      `,
      [appraisalId, precioCompra || 0]
    );

    res.json({
      ok: true,
      message: 'Vehículo agregado a inventario'
    });
  } catch (error) {
    console.error('Error al crear inventario:', error);
    res.status(500).json({ ok: false, error: 'Error al crear inventario' });
  }
};

// Listar inventario con info del avalúo
const listarInventario = async (req, res) => {
  try {
    const [rows] = await db.query(`
  SELECT 
    i.*,
    a.generales_json,
    a.valuacion_json,
    a.folio,
    p.file_path AS foto_principal
  FROM inventario i
  JOIN appraisals a ON a.id = i.appraisal_id
  LEFT JOIN appraisal_photos p
    ON p.id = (
      SELECT ap.id
      FROM appraisal_photos ap
      WHERE ap.appraisal_id = a.id
        AND ap.photo_type = 'general'
      ORDER BY ap.created_at ASC, ap.id ASC
      LIMIT 1
    )
  ORDER BY i.fecha_ingreso DESC
`);

    const data = rows.map((row) => {
        const fotoUrl = row.foto_principal
  ? `http://localhost:4000${row.foto_principal}`
  : null;
      const generales = parseJSONColumn(row.generales_json);
      const valuacion = parseJSONColumn(row.valuacion_json);

      return {
        id: row.id,
        foto: fotoUrl,
        appraisalId: row.appraisal_id,
        folio: row.folio,
        marca: generales.marca || '',
        submarca: generales.submarca || '',
        version: generales.version || '',
        anio: generales.anio || '',
        km: generales.kilometraje || '',

        precioCompra: row.precio_compra ?? valuacion.tomaAutorizada ?? 0,
        costoTotal: row.costo_total ?? 0,
        precioVenta: row.precio_venta ?? null,

        diasInventario: Math.floor(
          (new Date() - new Date(row.fecha_ingreso)) / (1000 * 60 * 60 * 24)
        ),

        estado: row.estado || 'comprado'
      };
    });

    res.json({ ok: true, inventario: data });
  } catch (error) {
    console.error('Error al listar inventario:', error);
    res.status(500).json({ ok: false, error: 'Error al listar inventario' });
  }
};

module.exports = {
  crearDesdeAvaluo,
  listarInventario
};