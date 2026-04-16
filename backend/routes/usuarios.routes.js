const express = require('express');
const router = express.Router();

const {
  listarUsuarios,
  crearUsuario,
  cambiarEstadoUsuario
} = require('../controllers/usuarios.controller');

const {
  validarToken,
  soloAdministrador
} = require('../middlewares/auth.middleware');

router.get('/', validarToken, soloAdministrador, listarUsuarios);
router.post('/', validarToken, soloAdministrador, crearUsuario);
router.patch('/:id/estado', validarToken, soloAdministrador, cambiarEstadoUsuario);

module.exports = router;