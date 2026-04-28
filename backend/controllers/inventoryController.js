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

const PUBLICATION_CHANNELS = ['mercadolibre', 'seminuevos', 'autocosmos', 'facebook'];

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
    await db.query(`
      ALTER TABLE ${table}
      ADD COLUMN ${definition}
    `);
  }
};

const ensurePublicationTables = async () => {
  await db.query(`
    CREATE TABLE IF NOT EXISTS inventario_publicaciones (
      id INT AUTO_INCREMENT PRIMARY KEY,
      inventario_id INT NOT NULL,
      canal VARCHAR(50) NOT NULL,
      status ENUM('draft','queued','published','failed','paused') NOT NULL DEFAULT 'draft',
      titulo VARCHAR(255) NULL,
      descripcion TEXT NULL,
      external_id VARCHAR(120) NULL,
      external_url VARCHAR(500) NULL,
      error_message VARCHAR(500) NULL,
      payload_snapshot JSON NULL,
      published_at DATETIME NULL,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      UNIQUE KEY uq_inventario_canal (inventario_id, canal)
    )
  `);

  await db.query(`
    CREATE TABLE IF NOT EXISTS inventario_publicacion_eventos (
      id INT AUTO_INCREMENT PRIMARY KEY,
      inventario_id INT NOT NULL,
      publicacion_id INT NULL,
      canal VARCHAR(50) NULL,
      tipo VARCHAR(60) NOT NULL,
      detalle VARCHAR(500) NULL,
      payload JSON NULL,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await db.query(`
    CREATE TABLE IF NOT EXISTS inventario_publicacion_canales_config (
      id INT AUTO_INCREMENT PRIMARY KEY,
      canal VARCHAR(50) NOT NULL UNIQUE,
      provider VARCHAR(40) NOT NULL DEFAULT 'webhook',
      activo TINYINT(1) NOT NULL DEFAULT 0,
      profile_url VARCHAR(500) NULL,
      webhook_url VARCHAR(500) NULL,
      api_key VARCHAR(255) NULL,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )
  `);

  await ensureColumnExists({
    table: 'inventario_publicacion_canales_config',
    column: 'profile_url',
    definition: 'profile_url VARCHAR(500) NULL AFTER activo'
  });

  await ensureColumnExists({
    table: 'inventario_publicacion_canales_config',
    column: 'provider',
    definition: "provider VARCHAR(40) NOT NULL DEFAULT 'webhook' AFTER canal"
  });
};

const getChannelConfigs = async () => {
  const [rows] = await db.query(
    `
    SELECT canal, provider, activo, profile_url, webhook_url, api_key
    FROM inventario_publicacion_canales_config
    `
  );

  const map = {};
  rows.forEach((row) => {
    map[row.canal] = row;
  });
  return map;
};

const publishToChannel = async ({ channel, config, payload }) => {
  if (!config || !config.activo) {
    return {
      ok: false,
      error: 'Canal no configurado o inactivo'
    };
  }

  const provider = config.provider || 'webhook';

  if (provider === 'profile_link_only') {
    if (!config.profile_url) {
      return {
        ok: false,
        error: 'Canal profile_link_only sin profile_url configurado'
      };
    }

    return {
      ok: true,
      externalId: `${channel}-profile-${Date.now()}`,
      externalUrl: config.profile_url,
      raw: { provider, mode: 'profile_link_only' }
    };
  }

  if (!config.webhook_url) {
    return {
      ok: false,
      error: 'Canal sin webhook_url configurado'
    };
  }

  const headers = {
    'Content-Type': 'application/json'
  };

  if (config.api_key) {
    headers.Authorization = `Bearer ${config.api_key}`;
  }

  try {
    const response = await fetch(config.webhook_url, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        canal: channel,
        ...payload
      })
    });

    if (!response.ok) {
      const text = await response.text();
      return {
        ok: false,
        error: `Error provider (${response.status}): ${text || response.statusText}`
      };
    }

    const data = await response.json().catch(() => ({}));
    return {
      ok: true,
      externalId: data?.external_id || data?.id || `${channel}-${Date.now()}`,
      externalUrl: data?.external_url || data?.url || payload?.profileUrl || null,
      raw: data
    };
  } catch (error) {
    return {
      ok: false,
      error: error?.message || 'Error de conexión con provider'
    };
  }
};

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

const obtenerPublicacionesInventario = async (req, res) => {
  try {
    const { id } = req.params;
    await ensurePublicationTables();

    const [inventarioRows] = await db.query(
      'SELECT id, estado, precio_venta FROM inventario WHERE id = ? LIMIT 1',
      [id]
    );

    if (!inventarioRows.length) {
      return res.status(404).json({ ok: false, error: 'Inventario no encontrado' });
    }

    const [publicaciones] = await db.query(
      `
      SELECT *
      FROM inventario_publicaciones
      WHERE inventario_id = ?
      ORDER BY canal ASC
      `,
      [id]
    );

    const [eventos] = await db.query(
      `
      SELECT *
      FROM inventario_publicacion_eventos
      WHERE inventario_id = ?
      ORDER BY created_at DESC, id DESC
      LIMIT 80
      `,
      [id]
    );

    const channelConfigs = await getChannelConfigs();

    return res.json({
      ok: true,
      inventario: inventarioRows[0],
      canalesDisponibles: PUBLICATION_CHANNELS,
      canalesConfig: PUBLICATION_CHANNELS.map((canal) => ({
        canal,
        activo: Boolean(channelConfigs[canal]?.activo),
        provider: channelConfigs[canal]?.provider || 'webhook',
        configured:
          channelConfigs[canal]?.provider === 'profile_link_only'
            ? Boolean(channelConfigs[canal]?.profile_url)
            : Boolean(channelConfigs[canal]?.webhook_url),
        profileUrl: channelConfigs[canal]?.profile_url || ''
      })),
      publicaciones,
      eventos
    });
  } catch (error) {
    console.error('Error al obtener publicaciones de inventario:', error);
    return res.status(500).json({ ok: false, error: 'Error al obtener publicaciones' });
  }
};

const publicarInventario = async (req, res) => {
  try {
    const { id } = req.params;
    const { canales = [], titulo = '', descripcion = '' } = req.body;

    await ensurePublicationTables();

    const canalesValidos = Array.isArray(canales)
      ? canales.filter((canal) => PUBLICATION_CHANNELS.includes(canal))
      : [];

    if (!canalesValidos.length) {
      return res.status(400).json({ ok: false, error: 'Selecciona al menos un canal válido' });
    }

    const [inventarioRows] = await db.query(
      'SELECT id, estado, precio_venta FROM inventario WHERE id = ? LIMIT 1',
      [id]
    );

    if (!inventarioRows.length) {
      return res.status(404).json({ ok: false, error: 'Inventario no encontrado' });
    }

    const inventario = inventarioRows[0];
    if (!inventario.precio_venta || Number(inventario.precio_venta) <= 0) {
      return res.status(400).json({
        ok: false,
        error: 'Debes tener precio de venta asignado antes de publicar'
      });
    }

    const resultados = [];
    const channelConfigs = await getChannelConfigs();
    let publishedCount = 0;

    for (const canal of canalesValidos) {
      const payloadSnapshot = JSON.stringify({
        titulo: titulo || null,
        descripcion: descripcion || null,
        precioVenta: inventario.precio_venta
      });

      const publishResult = await publishToChannel({
        channel: canal,
        config: channelConfigs[canal],
        payload: {
          inventarioId: Number(id),
          titulo: titulo || null,
          descripcion: descripcion || null,
          precioVenta: inventario.precio_venta,
          profileUrl: channelConfigs[canal]?.profile_url || null
        }
      });

      const finalStatus = publishResult.ok ? 'published' : 'failed';
      const externalId = publishResult.ok ? publishResult.externalId : null;
      const externalUrl = publishResult.ok ? publishResult.externalUrl : null;
      const errorMessage = publishResult.ok ? null : publishResult.error;

      const [result] = await db.query(
        `
        INSERT INTO inventario_publicaciones (
          inventario_id, canal, status, titulo, descripcion, external_id, external_url,
          error_message, payload_snapshot, published_at
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
          status = VALUES(status),
          titulo = VALUES(titulo),
          descripcion = VALUES(descripcion),
          external_id = VALUES(external_id),
          external_url = VALUES(external_url),
          error_message = VALUES(error_message),
          payload_snapshot = VALUES(payload_snapshot),
          published_at = VALUES(published_at),
          updated_at = CURRENT_TIMESTAMP
        `,
        [
          id,
          canal,
          finalStatus,
          titulo || null,
          descripcion || null,
          externalId,
          externalUrl,
          errorMessage,
          payloadSnapshot,
          publishResult.ok ? new Date() : null
        ]
      );

      const publicationId = result.insertId || null;

      await db.query(
        `
        INSERT INTO inventario_publicacion_eventos (
          inventario_id, publicacion_id, canal, tipo, detalle, payload
        )
        VALUES (?, ?, ?, ?, ?, ?)
        `,
        [
          id,
          publicationId,
          canal,
          publishResult.ok ? 'published' : 'failed',
          publishResult.ok
            ? 'Publicación enviada correctamente al provider'
            : `Error enviando al provider: ${publishResult.error}`,
          payloadSnapshot
        ]
      );

      resultados.push({
        canal,
        status: finalStatus,
        externalId,
        externalUrl,
        error: errorMessage
      });

      if (publishResult.ok) {
        publishedCount += 1;
      }
    }

    if (publishedCount > 0) {
      await db.query(
        `
        UPDATE inventario
        SET estado = 'publicado', updated_at = NOW()
        WHERE id = ? AND estado IN ('precio_asignado', 'publicado')
        `,
        [id]
      );
    }

    return res.json({
      ok: publishedCount > 0,
      message: publishedCount > 0
        ? 'Publicación procesada'
        : 'Ningún canal pudo publicarse; revisa configuración de providers',
      publishedCount,
      resultados
    });
  } catch (error) {
    console.error('Error al publicar inventario:', error);
    return res.status(500).json({ ok: false, error: 'Error al publicar inventario' });
  }
};

const reintentarPublicacionInventario = async (req, res) => {
  try {
    const { id, publicationId } = req.params;
    await ensurePublicationTables();

    const [rows] = await db.query(
      `
      SELECT *
      FROM inventario_publicaciones
      WHERE id = ? AND inventario_id = ?
      LIMIT 1
      `,
      [publicationId, id]
    );

    if (!rows.length) {
      return res.status(404).json({ ok: false, error: 'Publicación no encontrada' });
    }

    const item = rows[0];
    const channelConfigs = await getChannelConfigs();

    const publishResult = await publishToChannel({
      channel: item.canal,
      config: channelConfigs[item.canal],
      payload: {
        inventarioId: Number(id),
        titulo: item.titulo || null,
        descripcion: item.descripcion || null
      }
    });

    const finalStatus = publishResult.ok ? 'published' : 'failed';
    const externalId = publishResult.ok ? publishResult.externalId : null;
    const externalUrl = publishResult.ok ? publishResult.externalUrl : null;
    const errorMessage = publishResult.ok ? null : publishResult.error;

    await db.query(
      `
      UPDATE inventario_publicaciones
      SET
        status = ?,
        external_id = ?,
        external_url = ?,
        error_message = ?,
        published_at = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
      `,
      [
        finalStatus,
        externalId,
        externalUrl,
        errorMessage,
        publishResult.ok ? new Date() : null,
        publicationId
      ]
    );

    await db.query(
      `
      INSERT INTO inventario_publicacion_eventos (
        inventario_id, publicacion_id, canal, tipo, detalle
      )
      VALUES (?, ?, ?, ?, ?)
      `,
      [
        id,
        publicationId,
        item.canal,
        publishResult.ok ? 'retry' : 'retry_failed',
        publishResult.ok
          ? 'Se reintentó publicación y quedó publicada'
          : `Falló reintento de publicación: ${publishResult.error}`
      ]
    );

    if (publishResult.ok) {
      await db.query(
        `
        UPDATE inventario
        SET estado = 'publicado', updated_at = NOW()
        WHERE id = ? AND estado IN ('precio_asignado', 'publicado')
        `,
        [id]
      );
    }

    return res.json({
      ok: publishResult.ok,
      message: publishResult.ok
        ? 'Publicación reintentada correctamente'
        : `No se pudo reintentar publicación: ${publishResult.error}`,
      publication: {
        id: Number(publicationId),
        canal: item.canal,
        status: finalStatus,
        externalId,
        externalUrl,
        error: errorMessage
      }
    });
  } catch (error) {
    console.error('Error al reintentar publicación:', error);
    return res.status(500).json({ ok: false, error: 'Error al reintentar publicación' });
  }
};

const cambiarEstadoPublicacionInventario = async (req, res) => {
  try {
    const { id, publicationId } = req.params;
    const { status } = req.body;
    await ensurePublicationTables();

    const nextStatus = String(status || '').trim().toLowerCase();
    if (!['paused', 'published'].includes(nextStatus)) {
      return res.status(400).json({
        ok: false,
        error: 'Estado inválido. Usa paused o published'
      });
    }

    const [rows] = await db.query(
      `
      SELECT id, canal, status
      FROM inventario_publicaciones
      WHERE id = ? AND inventario_id = ?
      LIMIT 1
      `,
      [publicationId, id]
    );

    if (!rows.length) {
      return res.status(404).json({ ok: false, error: 'Publicación no encontrada' });
    }

    const current = rows[0];

    await db.query(
      `
      UPDATE inventario_publicaciones
      SET
        status = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
      `,
      [nextStatus, publicationId]
    );

    await db.query(
      `
      INSERT INTO inventario_publicacion_eventos (
        inventario_id, publicacion_id, canal, tipo, detalle
      )
      VALUES (?, ?, ?, ?, ?)
      `,
      [
        id,
        publicationId,
        current.canal,
        nextStatus === 'paused' ? 'paused' : 'resumed',
        nextStatus === 'paused'
          ? 'Publicación pausada manualmente'
          : 'Publicación reactivada manualmente'
      ]
    );

    return res.json({
      ok: true,
      message: nextStatus === 'paused' ? 'Publicación pausada' : 'Publicación reactivada',
      publication: {
        id: Number(publicationId),
        canal: current.canal,
        previousStatus: current.status,
        status: nextStatus
      }
    });
  } catch (error) {
    console.error('Error al cambiar estado de publicación:', error);
    return res.status(500).json({ ok: false, error: 'Error al cambiar estado de publicación' });
  }
};

const obtenerConfiguracionPublicacion = async (_req, res) => {
  try {
    await ensurePublicationTables();
    const configs = await getChannelConfigs();

    return res.json({
      ok: true,
      canales: PUBLICATION_CHANNELS.map((canal) => ({
        canal,
        activo: Boolean(configs[canal]?.activo),
        provider: configs[canal]?.provider || 'webhook',
        configured:
          configs[canal]?.provider === 'profile_link_only'
            ? Boolean(configs[canal]?.profile_url)
            : Boolean(configs[canal]?.webhook_url),
        webhookUrl: configs[canal]?.webhook_url || null
        ,
        profileUrl: configs[canal]?.profile_url || null
      }))
    });
  } catch (error) {
    console.error('Error al obtener configuración de publicación:', error);
    return res.status(500).json({ ok: false, error: 'Error al obtener configuración' });
  }
};

const guardarConfiguracionPublicacion = async (req, res) => {
  try {
    await ensurePublicationTables();
    const { canal, provider = 'webhook', activo, webhookUrl, apiKey, profileUrl } = req.body;

    if (!PUBLICATION_CHANNELS.includes(canal)) {
      return res.status(400).json({ ok: false, error: 'Canal inválido' });
    }
    if (!['webhook', 'profile_link_only'].includes(provider)) {
      return res.status(400).json({ ok: false, error: 'provider inválido' });
    }

    if (webhookUrl && !/^https?:\/\//i.test(webhookUrl)) {
      return res.status(400).json({ ok: false, error: 'webhookUrl debe iniciar con http/https' });
    }
    if (profileUrl && !/^https?:\/\//i.test(profileUrl)) {
      return res.status(400).json({ ok: false, error: 'profileUrl debe iniciar con http/https' });
    }

    await db.query(
      `
      INSERT INTO inventario_publicacion_canales_config (
        canal, provider, activo, profile_url, webhook_url, api_key
      )
      VALUES (?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        provider = VALUES(provider),
        activo = VALUES(activo),
        profile_url = VALUES(profile_url),
        webhook_url = VALUES(webhook_url),
        api_key = VALUES(api_key),
        updated_at = CURRENT_TIMESTAMP
      `,
      [canal, provider, activo ? 1 : 0, profileUrl || null, webhookUrl || null, apiKey || null]
    );

    return res.json({
      ok: true,
      message: 'Configuración de canal guardada',
      canal
    });
  } catch (error) {
    console.error('Error al guardar configuración de publicación:', error);
    return res.status(500).json({ ok: false, error: 'Error al guardar configuración' });
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
eliminarGastoReacondicionamiento,
obtenerPublicacionesInventario,
publicarInventario,
reintentarPublicacionInventario,
cambiarEstadoPublicacionInventario,
obtenerConfiguracionPublicacion,
guardarConfiguracionPublicacion
};
