const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');

const {
  subirFotoAppraisal,
  listarFotosAppraisal,
  descargarZipFotosAppraisal
} = require('../controllers/appraisalPhotoController');

const { validarToken } = require('../middlewares/auth.middleware');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(process.cwd(), 'uploads/appraisals'));
  },
  filename: function (req, file, cb) {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const ext = path.extname(file.originalname);
    cb(null, `${unique}${ext}`);
  }
});

const upload = multer({ storage });

router.get('/:id/photos', validarToken, listarFotosAppraisal);
router.post('/:id/photos', validarToken, upload.single('photo'), subirFotoAppraisal);
router.get('/:id/photos/zip', validarToken, descargarZipFotosAppraisal);

module.exports = router;