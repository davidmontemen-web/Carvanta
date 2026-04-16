const express = require('express');
const cors = require('cors');
require('dotenv').config();

const db = require('./db');
const usuariosRoutes = require('./routes/usuarios.routes');

const app = express();

const authRoutes = require('./routes/auth.routes');

const path = require('path');
const appraisalRoutes = require('./routes/appraisalRoutes');
const appraisalPhotoRoutes = require('./routes/appraisalPhotoRoutes');

// Middlewares
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

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

// Rutas del sistema
app.use('/api/usuarios', usuariosRoutes);

// Puerto
const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});

app.use('/api/appraisals', appraisalRoutes);
app.use('/api/appraisals', appraisalPhotoRoutes);

app.use('/api/auth', authRoutes);