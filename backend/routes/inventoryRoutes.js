const express = require('express');
const router = express.Router();
const inventoryController = require('../controllers/inventoryController');

router.post('/', inventoryController.crearDesdeAvaluo);
router.get('/', inventoryController.listarInventario);

module.exports = router;