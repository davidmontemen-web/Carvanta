const express = require('express');
const cors = require('cors');
const path = require('path');

const db = require('./db');
const usuariosRoutes = require('./routes/usuarios.routes');
const authRoutes = require('./routes/auth.routes');
const appraisalRoutes = require('./routes/appraisalRoutes');
const appraisalPhotoRoutes = require('./routes/appraisalPhotoRoutes');
const inventoryRoutes = require('./routes/inventoryRoutes');

const app = express();

// Middlewares base
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Ruta base
app.get('/', (req, res) => {
  res.json({
    ok: true,
    message: 'Backend de Carvanta funcionando'
  });
});

// Health check
app.get('/api/health', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT 1 AS ok');
    res.json({
      ok: true,
      db: rows[0]
    });
  } catch (error) {
    console.error('Error en health check:', error);
    res.status(500).json({
      ok: false,
      error: error.message
    });
  }
});

// Rutas API
app.use('/api/auth', authRoutes);
app.use('/api/usuarios', usuariosRoutes);
app.use('/api/appraisals', appraisalRoutes);
app.use('/api/appraisals', appraisalPhotoRoutes);
app.use('/api/inventario', inventoryRoutes);

module.exports = app;