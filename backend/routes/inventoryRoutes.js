const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const router = express.Router();
const inventoryController = require('../controllers/inventoryController');

const uploadDir = path.join(process.cwd(), 'uploads/reacondicionamiento');

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: uploadDir,
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const safeName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
    cb(null, safeName);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'];

    if (!allowed.includes(file.mimetype)) {
      return cb(new Error('Solo se permiten PDF o imágenes'));
    }

    cb(null, true);
  }
});

router.post('/', inventoryController.crearDesdeAvaluo);
router.get('/', inventoryController.listarInventario);
router.patch('/:id/estado', inventoryController.actualizarEstadoInventario);

router.get('/:id/pricing', inventoryController.obtenerPricingInventario);
router.post('/:id/comparables', inventoryController.agregarComparableInventario);
router.delete('/:id/comparables/:comparableId', inventoryController.eliminarComparableInventario);
router.post('/:id/pricing/asignar', inventoryController.asignarPrecioInventario);

router.get('/:id/reacondicionamiento', inventoryController.obtenerGastosReacondicionamiento);
router.post(
  '/:id/reacondicionamiento/gastos',
  upload.single('evidencia'),
  inventoryController.agregarGastoReacondicionamiento
);
router.delete(
  '/:id/reacondicionamiento/gastos/:gastoId',
  inventoryController.eliminarGastoReacondicionamiento
);

router.get('/:id/publicaciones', inventoryController.obtenerPublicacionesInventario);
router.post('/:id/publicaciones/publicar', inventoryController.publicarInventario);
router.post(
  '/:id/publicaciones/:publicationId/reintentar',
  inventoryController.reintentarPublicacionInventario
);
router.patch(
  '/:id/publicaciones/:publicationId/status',
  inventoryController.cambiarEstadoPublicacionInventario
);
router.get('/publicaciones/config', inventoryController.obtenerConfiguracionPublicacion);
router.post('/publicaciones/config', inventoryController.guardarConfiguracionPublicacion);

module.exports = router;
