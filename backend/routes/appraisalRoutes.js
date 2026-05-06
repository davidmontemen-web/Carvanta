const express = require('express');
const router = express.Router();

const {
  listarAppraisals,
  obtenerAppraisalPorId,
  obtenerHistorialAppraisal,
  obtenerFollowupsAppraisal,
  crearFollowupAppraisal,
  crearAppraisal,
  actualizarAppraisal
} = require('../controllers/appraisalController');

const { validarToken } = require('../middlewares/auth.middleware');
const { descargarPdfAppraisal } = require('../controllers/appraisalPdfController');

router.get('/', validarToken, listarAppraisals);
router.get('/:id', validarToken, obtenerAppraisalPorId);
router.get('/:id/history', validarToken, obtenerHistorialAppraisal);
router.get('/:id/followups', validarToken, obtenerFollowupsAppraisal);
router.post('/:id/followups', validarToken, crearFollowupAppraisal);
router.post('/', validarToken, crearAppraisal);
router.put('/:id', validarToken, actualizarAppraisal);
router.get('/:id/pdf', validarToken, descargarPdfAppraisal);

module.exports = router;
