const path = require('path');
const fs = require('fs');
const archiver = require('archiver');
const db = require('../db');

const BASE_URL = process.env.BASE_URL || 'http://localhost:4000';
const VALID_PHOTO_TYPES = ['general', 'detail'];
const VALID_GENERAL_SLOT_KEYS = [
  'frontal',
  'frontalDerecha',
  'lateralDerecha',
  'traseraDerecha',
  'trasera',
  'traseraIzquierda',
  'lateralIzquierda',
  'frontalIzquierda',
  'interiorTablero',
  'motor'
];

// ==============================
// HELPERS
// ==============================

const normalizePublicPath = (filePath) => {
  if (!filePath) return null;
  return filePath.replace(/\\/g, '/');
};

const buildFileUrl = (filePath) => {
  const normalizedPath = normalizePublicPath(filePath);
  return normalizedPath ? `${BASE_URL}${normalizedPath}` : null;
};

const getAbsolutePathFromPublicPath = (filePath) => {
  return path.join(process.cwd(), String(filePath || '').replace(/^\/+/, ''));
};

const fileExists = (absolutePath) => {
  try {
    return fs.existsSync(absolutePath);
  } catch {
    return false;
  }
};

const removeFileIfExists = async (absolutePath) => {
  if (!fileExists(absolutePath)) return;

  try {
    await fs.promises.unlink(absolutePath);
  } catch (error) {
    console.error('No se pudo eliminar archivo físico:', absolutePath, error);
  }
};

const validarPhotoType = (photoType) => {
  return VALID_PHOTO_TYPES.includes(photoType);
};

const validarSlotKeyGeneral = (slotKey) => {
  return VALID_GENERAL_SLOT_KEYS.includes(slotKey);
};

const obtenerAppraisalExistente = async (id) => {
  const [rows] = await db.query(
    'SELECT id FROM appraisals WHERE id = ? LIMIT 1',
    [id]
  );

  return rows.length ? rows[0] : null;
};

// ==============================
// SUBIR FOTO
// ==============================

const subirFotoAppraisal = async (req, res) => {
  try {
    const { id } = req.params;
    const { photoType, slotKey } = req.body;

    if (!req.file) {
      return res.status(400).json({
        ok: false,
        error: 'No se recibió archivo'
      });
    }

    if (!validarPhotoType(photoType)) {
      return res.status(400).json({
        ok: false,
        error: 'Tipo de foto no válido'
      });
    }

    if (photoType === 'general' && !slotKey) {
      return res.status(400).json({
        ok: false,
        error: 'La foto general requiere una posición (slotKey)'
      });
    }

    if (photoType === 'general' && !validarSlotKeyGeneral(slotKey)) {
      return res.status(400).json({
        ok: false,
        error: 'La posición de foto general no es válida'
      });
    }

    const appraisal = await obtenerAppraisalExistente(id);

    if (!appraisal) {
      return res.status(404).json({
        ok: false,
        error: 'Avalúo no encontrado'
      });
    }

    if (photoType === 'general') {
      const [oldPhotos] = await db.query(
        `
        SELECT id, file_path
        FROM appraisal_photos
        WHERE appraisal_id = ? AND photo_type = 'general' AND slot_key = ?
        `,
        [id, slotKey]
      );

      for (const old of oldPhotos) {
        const absolutePath = getAbsolutePathFromPublicPath(old.file_path);
        await removeFileIfExists(absolutePath);

        await db.query(
          'DELETE FROM appraisal_photos WHERE id = ?',
          [old.id]
        );
      }
    }

    const publicPath = `/uploads/appraisals/${req.file.filename}`;

    await db.query(
      `
      INSERT INTO appraisal_photos (
        appraisal_id,
        photo_type,
        slot_key,
        original_name,
        file_name,
        file_path,
        mime_type
      )
      VALUES (?, ?, ?, ?, ?, ?, ?)
      `,
      [
        id,
        photoType,
        photoType === 'general' ? slotKey : null,
        req.file.originalname,
        req.file.filename,
        publicPath,
        req.file.mimetype
      ]
    );

    res.status(201).json({
      ok: true,
      message: 'Foto cargada correctamente',
      file: {
        name: req.file.originalname,
        fileName: req.file.filename,
        path: normalizePublicPath(publicPath),
        mimeType: req.file.mimetype,
        url: buildFileUrl(publicPath)
      }
    });
  } catch (error) {
    console.error('Error al subir foto:', error);
    res.status(500).json({
      ok: false,
      error: 'Error al subir foto'
    });
  }
};

// ==============================
// LISTAR FOTOS
// ==============================

const listarFotosAppraisal = async (req, res) => {
  try {
    const { id } = req.params;

    const appraisal = await obtenerAppraisalExistente(id);

    if (!appraisal) {
      return res.status(404).json({
        ok: false,
        error: 'Avalúo no encontrado'
      });
    }

    const [photos] = await db.query(
      `
      SELECT
        id,
        appraisal_id,
        photo_type,
        slot_key,
        original_name,
        file_name,
        file_path,
        mime_type,
        created_at
      FROM appraisal_photos
      WHERE appraisal_id = ?
      ORDER BY created_at ASC
      `,
      [id]
    );

    res.json({
      ok: true,
      photos: photos.map((photo) => ({
        ...photo,
        file_path: normalizePublicPath(photo.file_path),
        url: buildFileUrl(photo.file_path)
      }))
    });
  } catch (error) {
    console.error('Error al listar fotos:', error);
    res.status(500).json({
      ok: false,
      error: 'Error al listar fotos'
    });
  }
};

// ==============================
// DESCARGAR ZIP
// ==============================

const descargarZipFotosAppraisal = async (req, res) => {
  try {
    const { id } = req.params;
    const { photoType } = req.query;

    if (!validarPhotoType(photoType)) {
      return res.status(400).json({
        ok: false,
        error: 'Tipo de foto no válido para ZIP'
      });
    }

    const appraisal = await obtenerAppraisalExistente(id);

    if (!appraisal) {
      return res.status(404).json({
        ok: false,
        error: 'Avalúo no encontrado'
      });
    }

    const [photos] = await db.query(
      `
      SELECT id, photo_type, slot_key, original_name, file_name, file_path
      FROM appraisal_photos
      WHERE appraisal_id = ? AND photo_type = ?
      ORDER BY created_at ASC
      `,
      [id, photoType]
    );

    if (!photos.length) {
      return res.status(404).json({
        ok: false,
        error: 'No hay fotos para descargar'
      });
    }

    const zipName =
      photoType === 'general'
        ? `avaluo_${id}_fotos_generales.zip`
        : `avaluo_${id}_fotos_detalle.zip`;

    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', `attachment; filename="${zipName}"`);

    const archive = archiver('zip', {
      zlib: { level: 9 }
    });

    archive.on('error', (error) => {
      throw error;
    });

    archive.pipe(res);

    for (const photo of photos) {
      const absolutePath = getAbsolutePathFromPublicPath(photo.file_path);

      if (fileExists(absolutePath)) {
        const safeName = photo.original_name || photo.file_name;
        archive.file(absolutePath, { name: safeName });
      }
    }

    await archive.finalize();
  } catch (error) {
    console.error('Error al descargar ZIP de fotos:', error);

    if (!res.headersSent) {
      res.status(500).json({
        ok: false,
        error: 'Error al generar ZIP de fotos'
      });
    }
  }
};

module.exports = {
  subirFotoAppraisal,
  listarFotosAppraisal,
  descargarZipFotosAppraisal
};