const PDFDocument = require('pdfkit');
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

const addSectionTitle = (doc, title) => {
  doc.moveDown(0.8);
  doc
    .font('Helvetica-Bold')
    .fontSize(13)
    .fillColor('#111827')
    .text(title);
  doc.moveDown(0.3);
};

const addField = (doc, label, value) => {
  doc
    .font('Helvetica-Bold')
    .fontSize(10)
    .fillColor('#374151')
    .text(`${label}: `, { continued: true });

  doc
    .font('Helvetica')
    .fillColor('#111827')
    .text(value ?? '-', { continued: false });
};

const yesNoNa = (value) => {
  const map = {
    si: 'Sí',
    no: 'No',
    na: 'N/A'
  };
  return map[value] || value || '-';
};

const technical = (value) => {
  const map = {
    ok: 'OK',
    detalle: 'Detalle',
    na: 'N/A'
  };
  return map[value] || value || '-';
};

const money = (value) => {
  if (value === null || value === undefined || value === '') return '-';
  const numeric = Number(String(value).replace(/[^\d.-]/g, ''));
  if (Number.isNaN(numeric)) return String(value);

  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
    maximumFractionDigits: 0
  }).format(numeric);
};

const descargarPdfAppraisal = async (req, res) => {
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

    const row = rows[0];

    const appraisal = {
      ...row,
      generales: parseJSONColumn(row.generales_json),
      documentacion: parseJSONColumn(row.documentacion_json),
      interior: parseJSONColumn(row.interior_json),
      carroceria: parseJSONColumn(row.carroceria_json),
      sistemaElectrico: parseJSONColumn(row.sistema_electrico_json),
      fugasMotor: parseJSONColumn(row.fugas_motor_json),
      valuacion: parseJSONColumn(row.valuacion_json)
    };

    const doc = new PDFDocument({
      margin: 40,
      size: 'A4'
    });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="avaluo_${appraisal.folio || appraisal.id}.pdf"`
    );

    doc.pipe(res);

    // Header
    doc
      .font('Helvetica-Bold')
      .fontSize(20)
      .fillColor('#111827')
      .text('Carvanta');

    doc
      .font('Helvetica')
      .fontSize(10)
      .fillColor('#6B7280')
      .text('Reporte de avalúo vehicular');

    doc.moveDown(1);

    doc
      .roundedRect(40, doc.y, 515, 70, 10)
      .strokeColor('#D1D5DB')
      .stroke();

    doc
      .font('Helvetica-Bold')
      .fontSize(16)
      .fillColor('#111827')
      .text(`Folio: ${appraisal.folio || '-'}`, 55, doc.y + 12);

    doc
      .font('Helvetica')
      .fontSize(10)
      .fillColor('#374151')
      .text(`Estatus: ${appraisal.estatus || '-'}`, 55, doc.y + 8)
      .text(`Fecha de avalúo: ${appraisal.fecha_avaluo || '-'}`, 200, doc.y - 12)
      .text(`Asesor: ${appraisal.asesor_ventas || '-'}`, 380, doc.y - 12);

    doc.moveDown(3.5);

    addSectionTitle(doc, 'Cliente');
    addField(doc, 'Nombre', appraisal.cliente_nombre);
    addField(doc, 'Teléfono', appraisal.cliente_telefono);
    addField(doc, 'Vehículo de interés', appraisal.vehiculo_interes);

    addSectionTitle(doc, 'Generales del vehículo');
    addField(doc, 'Marca', appraisal.generales?.marca);
    addField(doc, 'Submarca', appraisal.generales?.submarca);
    addField(doc, 'Versión', appraisal.generales?.version);
    addField(doc, 'Año modelo', appraisal.generales?.anio);
    addField(doc, 'Transmisión', appraisal.generales?.transmision);
    addField(doc, 'Color', appraisal.generales?.color);
    addField(doc, 'Kilometraje', appraisal.generales?.kilometraje);
    addField(doc, 'Número de dueños', appraisal.generales?.numeroDuenos);
    addField(doc, 'Número de serie', appraisal.generales?.numeroSerie);
    addField(doc, 'Placas', appraisal.generales?.placas);
    addField(doc, 'Comentarios', appraisal.generales?.comentarios);

    addSectionTitle(doc, 'Documentación');
    addField(doc, 'Factura', yesNoNa(appraisal.documentacion?.factura));
    addField(doc, 'Carta origen', yesNoNa(appraisal.documentacion?.cartaOrigen));
    addField(doc, 'Tenencias', yesNoNa(appraisal.documentacion?.tenencias));
    addField(doc, 'Último servicio', yesNoNa(appraisal.documentacion?.ultimoServicio));
    addField(doc, 'Verificación', yesNoNa(appraisal.documentacion?.verificacion));
    addField(doc, 'Manuales', yesNoNa(appraisal.documentacion?.manuales));
    addField(doc, 'Garantía', yesNoNa(appraisal.documentacion?.garantia));
    addField(doc, 'Engomado', yesNoNa(appraisal.documentacion?.engomado));
    addField(doc, 'Tarjeta de circulación', yesNoNa(appraisal.documentacion?.tarjetaCirculacion));
    addField(doc, 'Póliza de seguro', yesNoNa(appraisal.documentacion?.polizaSeguro));
    addField(doc, 'Comentarios', appraisal.documentacion?.comentarios);

    addSectionTitle(doc, 'Aspecto físico interior');
    addField(doc, 'Vestiduras', appraisal.interior?.vestiduras);
    addField(doc, 'Cielo', appraisal.interior?.cielo);
    addField(doc, 'Consola central', appraisal.interior?.consolaCentral);
    addField(doc, 'Alfombras', appraisal.interior?.alfombras);
    addField(doc, 'Tablero', appraisal.interior?.tablero);
    addField(doc, 'Encendedor', appraisal.interior?.encendedor);
    addField(doc, 'Puertas laterales', appraisal.interior?.puertasLaterales);
    addField(doc, 'Volante', appraisal.interior?.volante);
    addField(doc, 'Comentarios', appraisal.interior?.comentarios);

    if (doc.y > 650) doc.addPage();

    addSectionTitle(doc, 'Sistema eléctrico');
    addField(doc, 'Espejos eléctricos', yesNoNa(appraisal.sistemaElectrico?.espejosElectricos));
    addField(doc, 'Bolsas de aire', yesNoNa(appraisal.sistemaElectrico?.bolsasAire));
    addField(doc, 'Aire acondicionado', yesNoNa(appraisal.sistemaElectrico?.aireAcondicionado));
    addField(doc, 'Control de crucero', yesNoNa(appraisal.sistemaElectrico?.controlCrucero));
    addField(doc, 'Check engine', yesNoNa(appraisal.sistemaElectrico?.checkEngine));
    addField(doc, 'Asientos eléctricos', yesNoNa(appraisal.sistemaElectrico?.asientosElectricos));
    addField(doc, 'Cristales eléctricos', yesNoNa(appraisal.sistemaElectrico?.cristalesElectricos));
    addField(doc, 'Pantalla', yesNoNa(appraisal.sistemaElectrico?.pantalla));
    addField(doc, 'Luces externas', yesNoNa(appraisal.sistemaElectrico?.lucesExternas));
    addField(doc, 'Comentarios', appraisal.sistemaElectrico?.comentarios);

    addSectionTitle(doc, 'Fugas y motor');
    addField(doc, 'Motor', technical(appraisal.fugasMotor?.motor));
    addField(doc, 'Transmisión', technical(appraisal.fugasMotor?.transmision));
    addField(doc, 'Sistema de frenos', technical(appraisal.fugasMotor?.sistemaFrenos));
    addField(doc, 'Dirección hidráulica', technical(appraisal.fugasMotor?.direccionHidraulica));
    addField(doc, 'Amortiguadores', technical(appraisal.fugasMotor?.amortiguadores));
    addField(doc, 'Anticongelante', technical(appraisal.fugasMotor?.anticongelante));
    addField(doc, 'Aire acondicionado', technical(appraisal.fugasMotor?.aireAcondicionado));
    addField(doc, 'Flechas', technical(appraisal.fugasMotor?.flechas));
    addField(doc, 'Soportes de motor', technical(appraisal.fugasMotor?.soportesMotor));
    addField(doc, 'Soportes de caja', technical(appraisal.fugasMotor?.soportesCaja));
    addField(doc, 'Comentarios', appraisal.fugasMotor?.comentarios);

    addSectionTitle(doc, 'Valuación');
    addField(doc, 'Toma libro', money(appraisal.valuacion?.tomaLibro));
    addField(doc, 'Venta libro', money(appraisal.valuacion?.ventaLibro));
    addField(doc, 'Media', money(appraisal.valuacion?.media));
    addField(doc, 'Reparaciones', money(appraisal.valuacion?.reparaciones));
    addField(doc, 'Toma autorizada', money(appraisal.valuacion?.tomaAutorizada));
    addField(doc, 'Comentarios', appraisal.valuacion?.comentarios);

    doc.moveDown(1.5);
    doc
      .font('Helvetica')
      .fontSize(9)
      .fillColor('#6B7280')
      .text(`PDF generado el ${new Date().toLocaleString('es-MX')}`, {
        align: 'right'
      });

    doc.end();
  } catch (error) {
    console.error('Error al generar PDF del avalúo:', error);
    res.status(500).json({
      ok: false,
      error: 'Error al generar PDF del avalúo'
    });
  }
};

module.exports = {
  descargarPdfAppraisal
};