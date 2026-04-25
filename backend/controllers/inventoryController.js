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

const TRANSICIONES = {
  comprado: ['reacondicionamiento'],
  reacondicionamiento: ['precio_asignado'],
  precio_asignado: ['publicado'],
  publicado: ['apartado'],
  apartado: ['vendido'],
  vendido: [],
  detenido: [],
  no_vendible: []
};

const numberOrZero = (value) => {
  const numeric = Number(value);
  return Number.isNaN(numeric) ? 0 : numeric;
};

const roundMoney = (value) => Math.round(numberOrZero(value));

const calcularPricing = ({ inventario, comparables }) => {
  const precios = comparables
    .map((item) => numberOrZero(item.precio))
    .filter((precio) => precio > 0);

  const promedioMercado = precios.length
    ? precios.reduce((acc, precio) => acc + precio, 0) / precios.length
    : 0;

  const precioCompra = numberOrZero(inventario.precio_compra);
  const costoReacondicionamiento = numberOrZero(inventario.costo_reacondicionamiento);
  const costoTotal = precioCompra + costoReacondicionamiento;

  const precioMinimo = Math.max(costoTotal * 1.06, promedioMercado * 0.92);
  const precioSugerido = promedioMercado * 0.98;
  const precioObjetivo = promedioMercado * 1.02;

  return {
    promedioMercado: roundMoney(promedioMercado),
    precioMinimo: roundMoney(precioMinimo),
    precioSugerido: roundMoney(precioSugerido),
    precioObjetivo: roundMoney(precioObjetivo)
  };
};

const crearDesdeAvaluo = async (req, res) => {
  try {
    const { appraisalId, precioCompra } = req.body;

    const [exists] = await db.query(
      'SELECT id FROM inventario WHERE appraisal_id = ? LIMIT 1',
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
    res.status(500).json({
      ok: false,
      error: 'Error al crear inventario'
    });
  }
};

const actualizarEstadoInventario = async (req, res) => {
  try {
    const { id } = req.params;
    const { nuevo_estado } = req.body;

    if (!nuevo_estado) {
      return res.status(400).json({
        ok: false,
        error: 'El nuevo estado es obligatorio'
      });
    }

    const [rows] = await db.query(
      'SELECT estado FROM inventario WHERE id = ? LIMIT 1',
      [id]
    );

    if (!rows.length) {
      return res.status(404).json({
        ok: false,
        error: 'Registro de inventario no encontrado'
      });
    }

    const estadoActual = rows[0].estado;
    const permitidos = TRANSICIONES[estadoActual] || [];

    if (!permitidos.includes(nuevo_estado)) {
      return res.status(400).json({
        ok: false,
        error: `Transición no permitida: ${estadoActual} → ${nuevo_estado}`
      });
    }

    await db.query(
      `
      UPDATE inventario
      SET estado = ?, updated_at = NOW()
      WHERE id = ?
      `,
      [nuevo_estado, id]
    );

    return res.json({
      ok: true,
      message: `Estado actualizado a ${nuevo_estado}`,
      estado: nuevo_estado
    });
  } catch (error) {
    console.error('Error al actualizar estado de inventario:', error);
    return res.status(500).json({
      ok: false,
      error: 'Error al actualizar estado de inventario'
    });
  }
};

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
        color: generales.color || '',
        transmision: generales.transmision || '',
        numeroSerie: generales.numeroSerie || '',
        placas: generales.placas || '',
        numeroDuenos: generales.numeroDuenos || '',

        precioCompra: row.precio_compra ?? valuacion.tomaAutorizada ?? 0,
        costoReacondicionamiento: row.costo_reacondicionamiento ?? 0,
        costoTotal: row.costo_total ?? 0,
        precioVenta: row.precio_venta ?? null,
        precioMinimo: row.precio_minimo ?? null,

        diasInventario: Math.floor(
          (new Date() - new Date(row.fecha_ingreso)) / (1000 * 60 * 60 * 24)
        ),

        estado: row.estado || 'comprado'
      };
    });

    res.json({
      ok: true,
      inventario: data
    });
  } catch (error) {
    console.error('Error al listar inventario:', error);
    res.status(500).json({
      ok: false,
      error: 'Error al listar inventario'
    });
  }
};

const obtenerPricingInventario = async (req, res) => {
  try {
    const { id } = req.params;

    const [inventarioRows] = await db.query(
      `
      SELECT *
      FROM inventario
      WHERE id = ?
      LIMIT 1
      `,
      [id]
    );

    if (!inventarioRows.length) {
      return res.status(404).json({
        ok: false,
        error: 'Inventario no encontrado'
      });
    }

    const inventario = inventarioRows[0];

    const [comparables] = await db.query(
      `
      SELECT *
      FROM inventario_comparables
      WHERE inventario_id = ?
      ORDER BY created_at DESC, id DESC
      `,
      [id]
    );

    const [pricingRows] = await db.query(
      `
      SELECT *
      FROM inventario_pricing
      WHERE inventario_id = ?
      LIMIT 1
      `,
      [id]
    );

    const calculo = calcularPricing({
      inventario,
      comparables
    });

    res.json({
      ok: true,
      pricing: pricingRows[0] || null,
      comparables,
      calculo
    });
  } catch (error) {
    console.error('Error al obtener pricing:', error);
    res.status(500).json({
      ok: false,
      error: 'Error al obtener pricing'
    });
  }
};

const agregarComparableInventario = async (req, res) => {
  try {
    const { id } = req.params;
    const { fuente, anio, km, precio, link, observaciones } = req.body;

    if (!fuente || !precio) {
      return res.status(400).json({
        ok: false,
        error: 'Fuente y precio son obligatorios'
      });
    }

    const [inventarioRows] = await db.query(
      'SELECT id FROM inventario WHERE id = ? LIMIT 1',
      [id]
    );

    if (!inventarioRows.length) {
      return res.status(404).json({
        ok: false,
        error: 'Inventario no encontrado'
      });
    }

    const [result] = await db.query(
      `
      INSERT INTO inventario_comparables (
        inventario_id,
        fuente,
        anio,
        km,
        precio,
        link,
        observaciones
      )
      VALUES (?, ?, ?, ?, ?, ?, ?)
      `,
      [
        id,
        fuente,
        anio || null,
        km || null,
        precio,
        link || null,
        observaciones || null
      ]
    );

    res.status(201).json({
      ok: true,
      message: 'Comparable agregado correctamente',
      comparableId: result.insertId
    });
  } catch (error) {
    console.error('Error al agregar comparable:', error);
    res.status(500).json({
      ok: false,
      error: 'Error al agregar comparable'
    });
  }
};

const eliminarComparableInventario = async (req, res) => {
  try {
    const { id, comparableId } = req.params;

    const [result] = await db.query(
      `
      DELETE FROM inventario_comparables
      WHERE id = ? AND inventario_id = ?
      `,
      [comparableId, id]
    );

    if (!result.affectedRows) {
      return res.status(404).json({
        ok: false,
        error: 'Comparable no encontrado'
      });
    }

    res.json({
      ok: true,
      message: 'Comparable eliminado correctamente'
    });
  } catch (error) {
    console.error('Error al eliminar comparable:', error);
    res.status(500).json({
      ok: false,
      error: 'Error al eliminar comparable'
    });
  }
};

const asignarPrecioInventario = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      precioVentaFinal,
      precioMinimo,
      precioSugerido,
      precioObjetivo,
      costoReacondicionamiento
    } = req.body;

    if (!precioVentaFinal || Number(precioVentaFinal) <= 0) {
      return res.status(400).json({
        ok: false,
        error: 'El precio de venta final es obligatorio'
      });
    }

    const [inventarioRows] = await db.query(
      `
      SELECT *
      FROM inventario
      WHERE id = ?
      LIMIT 1
      `,
      [id]
    );

    if (!inventarioRows.length) {
      return res.status(404).json({
        ok: false,
        error: 'Inventario no encontrado'
      });
    }

    const inventario = inventarioRows[0];

    if (!['reacondicionamiento', 'precio_asignado'].includes(inventario.estado)) {
      return res.status(400).json({
        ok: false,
        error: 'Solo puedes asignar precio desde reacondicionamiento o editarlo si ya está asignado'
      });
    }

    const [comparables] = await db.query(
      `
      SELECT *
      FROM inventario_comparables
      WHERE inventario_id = ?
      `,
      [id]
    );

    if (comparables.length < 2) {
      return res.status(400).json({
        ok: false,
        error: 'Debes registrar al menos 2 comparables de mercado'
      });
    }

    const inventarioParaCalculo = {
      ...inventario,
      costo_reacondicionamiento:
        costoReacondicionamiento ?? inventario.costo_reacondicionamiento
    };

    const calculo = calcularPricing({
      inventario: inventarioParaCalculo,
      comparables
    });

    const finalPrecioMinimo = precioMinimo || calculo.precioMinimo;
    const finalPrecioSugerido = precioSugerido || calculo.precioSugerido;
    const finalPrecioObjetivo = precioObjetivo || calculo.precioObjetivo;

    await db.query(
      `
      INSERT INTO inventario_pricing (
        inventario_id,
        precio_compra,
        costo_reacondicionamiento,
        precio_minimo,
        precio_sugerido,
        precio_objetivo,
        precio_venta_final,
        promedio_mercado
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        precio_compra = VALUES(precio_compra),
        costo_reacondicionamiento = VALUES(costo_reacondicionamiento),
        precio_minimo = VALUES(precio_minimo),
        precio_sugerido = VALUES(precio_sugerido),
        precio_objetivo = VALUES(precio_objetivo),
        precio_venta_final = VALUES(precio_venta_final),
        promedio_mercado = VALUES(promedio_mercado),
        updated_at = CURRENT_TIMESTAMP
      `,
      [
        id,
        inventario.precio_compra || 0,
        costoReacondicionamiento || inventario.costo_reacondicionamiento || 0,
        finalPrecioMinimo,
        finalPrecioSugerido,
        finalPrecioObjetivo,
        precioVentaFinal,
        calculo.promedioMercado
      ]
    );

    await db.query(
      `
      UPDATE inventario
      SET
        precio_venta = ?,
        precio_minimo = ?,
        costo_reacondicionamiento = ?,
        estado = 'precio_asignado',
        updated_at = NOW()
      WHERE id = ?
      `,
      [
        precioVentaFinal,
        finalPrecioMinimo,
        costoReacondicionamiento || inventario.costo_reacondicionamiento || 0,
        id
      ]
    );

    res.json({
      ok: true,
      message: 'Precio asignado correctamente',
      pricing: {
        precioVentaFinal,
        precioMinimo: finalPrecioMinimo,
        precioSugerido: finalPrecioSugerido,
        precioObjetivo: finalPrecioObjetivo,
        promedioMercado: calculo.promedioMercado
      }
    });
  } catch (error) {
    console.error('Error al asignar precio:', error);
    res.status(500).json({
      ok: false,
      error: 'Error al asignar precio'
    });
  }
};

// 🔹 Obtener gastos de reacondicionamiento
const obtenerGastosReacondicionamiento = async (req, res) => {
  try {
    const { id } = req.params;

    const [gastos] = await db.query(
      `
      SELECT *
      FROM inventario_reacondicionamiento_gastos
      WHERE inventario_id = ?
      ORDER BY created_at DESC
      `,
      [id]
    );

    res.json({
      ok: true,
      gastos
    });
  } catch (error) {
    console.error('Error obteniendo gastos:', error);
    res.status(500).json({
      ok: false,
      error: 'Error obteniendo gastos'
    });
  }
};

// 🔹 Agregar gasto
const agregarGastoReacondicionamiento = async (req, res) => {
  try {
    const { id } = req.params;
    const { categoria, concepto, proveedor, costo, fecha, observaciones } = req.body;

    const evidenciaUrl = req.file
      ? `/uploads/reacondicionamiento/${req.file.filename}`
      : null;

    if (!categoria || !concepto || !costo) {
      return res.status(400).json({
        ok: false,
        error: 'Categoría, concepto y costo son obligatorios'
      });
    }

    await db.query(
      `
      INSERT INTO inventario_reacondicionamiento_gastos
      (inventario_id, categoria, concepto, proveedor, costo, fecha, observaciones, evidencia_url)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        id,
        categoria,
        concepto,
        proveedor || null,
        costo,
        fecha || null,
        observaciones || null,
        evidenciaUrl
      ]
    );

    // 🔥 recalcular costo total
    const [sum] = await db.query(
      `
      SELECT SUM(costo) as total
      FROM inventario_reacondicionamiento_gastos
      WHERE inventario_id = ?
      `,
      [id]
    );

    const total = sum[0].total || 0;

    await db.query(
      `
      UPDATE inventario
      SET costo_reacondicionamiento = ?
      WHERE id = ?
      `,
      [total, id]
    );

    res.json({
      ok: true,
      message: 'Gasto agregado correctamente',
      total
    });

  } catch (error) {
    console.error('Error agregando gasto:', error);
    res.status(500).json({
      ok: false,
      error: 'Error agregando gasto'
    });
  }
};

// 🔹 Eliminar gasto
const eliminarGastoReacondicionamiento = async (req, res) => {
  try {
    const { id, gastoId } = req.params;

    await db.query(
      `
      DELETE FROM inventario_reacondicionamiento_gastos
      WHERE id = ? AND inventario_id = ?
      `,
      [gastoId, id]
    );

    // recalcular
    const [sum] = await db.query(
      `
      SELECT SUM(costo) as total
      FROM inventario_reacondicionamiento_gastos
      WHERE inventario_id = ?
      `,
      [id]
    );

    const total = sum[0].total || 0;

    await db.query(
      `
      UPDATE inventario
      SET costo_reacondicionamiento = ?
      WHERE id = ?
      `,
      [total, id]
    );

    res.json({
      ok: true,
      message: 'Gasto eliminado',
      total
    });

  } catch (error) {
    console.error('Error eliminando gasto:', error);
    res.status(500).json({
      ok: false,
      error: 'Error eliminando gasto'
    });
  }
};

module.exports = {
  crearDesdeAvaluo,
  listarInventario,
  actualizarEstadoInventario,
  obtenerPricingInventario,
  agregarComparableInventario,
  eliminarComparableInventario,
  asignarPrecioInventario,
  obtenerGastosReacondicionamiento,
agregarGastoReacondicionamiento,
eliminarGastoReacondicionamiento
};