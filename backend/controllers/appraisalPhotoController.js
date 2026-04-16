const path = require('path');
const fs = require('fs');
const archiver = require('archiver');
const db = require('../db');



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

    if (!['general', 'detail'].includes(photoType)) {
      return res.status(400).json({
        ok: false,
        error: 'Tipo de foto no válido'
      });
    }

    const [appraisal] = await db.query(
      'SELECT id FROM appraisals WHERE id = ? LIMIT 1',
      [id]
    );

    if (!appraisal.length) {
      return res.status(404).json({
        ok: false,
        error: 'Avalúo no encontrado'
      });
    }

    if (photoType === 'general' && slotKey) {
      const [oldPhotos] = await db.query(
        `
        SELECT id, file_path
        FROM appraisal_photos
        WHERE appraisal_id = ? AND photo_type = 'general' AND slot_key = ?
        `,
        [id, slotKey]
      );

      for (const old of oldPhotos) {
        const absolutePath = path.join(
          process.cwd(),
          old.file_path.replace(/^\/+/, '')
        );

        if (fs.existsSync(absolutePath)) {
          fs.unlinkSync(absolutePath);
        }

        await db.query('DELETE FROM appraisal_photos WHERE id = ?', [old.id]);
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
        slotKey || null,
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
        path: publicPath,
        url: `http://localhost:4000${publicPath}`
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

const listarFotosAppraisal = async (req, res) => {
  try {
    const { id } = req.params;

    const [photos] = await db.query(
      `
      SELECT id, appraisal_id, photo_type, slot_key, original_name, file_name, file_path, mime_type, created_at
      FROM appraisal_photos
      WHERE appraisal_id = ?
      ORDER BY created_at ASC
      `,
      [id]
    );

    res.json({
      ok: true,
      photos: photos.map((p) => ({
        ...p,
        url: `http://localhost:4000${p.file_path.replace(/\\/g, '/')}`
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

const descargarZipFotosAppraisal = async (req, res) => {
  try {
    const { id } = req.params;
    const { photoType } = req.query;

    if (!['general', 'detail'].includes(photoType)) {
      return res.status(400).json({
        ok: false,
        error: 'Tipo de foto no válido para ZIP'
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
      const absolutePath = path.join(
        process.cwd(),
        photo.file_path.replace(/^\/+/, '')
      );

      if (fs.existsSync(absolutePath)) {
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