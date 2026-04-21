const db = require('../db');

const logHistory = async ({
  appraisalId,
  usuario,
  accion,
  detalle = ''
}) => {
  try {
    await db.query(
      `
      INSERT INTO appraisal_history
      (appraisal_id, usuario_id, usuario_nombre, accion, detalle)
      VALUES (?, ?, ?, ?, ?)
      `,
      [
        appraisalId,
        usuario?.id || null,
        usuario?.nombreCompleto ||
          `${usuario?.nombre || ''} ${usuario?.apellido || ''}`.trim() ||
          'Sistema',
        accion,
        detalle
      ]
    );
  } catch (error) {
    console.error('Error registrando historial:', error);
  }
};

module.exports = { logHistory };