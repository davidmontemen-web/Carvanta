const express = require('express');
const cors = require('cors');
require('dotenv').config();
const db = require('./db');

const app = express();

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.json({ ok: true, message: 'Backend de Carvanta funcionando' });
});

app.get('/api/health', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT 1 AS ok');
    res.json({ ok: true, db: rows[0] });
  } catch (error) {
    res.status(500).json({ ok: false, error: error.message });
  }
});

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});