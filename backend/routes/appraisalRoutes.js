const express = require('express');
const router = express.Router();

const {
  listarAppraisals,
  obtenerAppraisalPorId,
  crearAppraisal,
  actualizarAppraisal
} = require('../controllers/appraisalController');

const { validarToken } = require('../middlewares/auth.middleware');

router.get('/', validarToken, listarAppraisals);
router.get('/:id', validarToken, obtenerAppraisalPorId);
router.post('/', validarToken, crearAppraisal);
router.put('/:id', validarToken, actualizarAppraisal);

module.exports = router;