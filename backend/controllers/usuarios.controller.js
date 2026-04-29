const bcrypt = require('bcryptjs');
const db = require('../db');

const listarUsuarios = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT 
        id,
        nombre,
        apellido,
        email,
        rol,
        activo,
        creado_en,
        actualizado_en
      FROM usuarios
      ORDER BY id DESC
    `);

    res.json({ ok: true, usuarios: rows });
  } catch (error) {
    console.error('Error al listar usuarios:', error);
    res.status(500).json({ ok: false, error: 'Error al listar usuarios' });
  }
};

const crearUsuario = async (req, res) => {
  try {
    const { nombre, apellido, email, password, rol } = req.body;

    if (!nombre || !apellido || !email || !password || !rol) {
      return res.status(400).json({
        ok: false,
        error: 'Todos los campos son obligatorios'
      });
    }

    if (!['administrador', 'valuador', 'tecnico_servicio'].includes(rol)) {
      return res.status(400).json({
        ok: false,
        error: 'Rol no válido'
      });
    }

    const [existe] = await db.query(
      'SELECT id FROM usuarios WHERE email = ? LIMIT 1',
      [email]
    );

    if (existe.length > 0) {
      return res.status(400).json({
        ok: false,
        error: 'Ya existe un usuario con ese correo'
      });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const [result] = await db.query(
      `
      INSERT INTO usuarios (nombre, apellido, email, password, rol, activo)
      VALUES (?, ?, ?, ?, ?, 1)
      `,
      [nombre, apellido, email, passwordHash, rol]
    );

    res.status(201).json({
      ok: true,
      message: 'Usuario creado correctamente',
      id: result.insertId
    });
  } catch (error) {
    console.error('Error al crear usuario:', error);
    res.status(500).json({ ok: false, error: 'Error al crear usuario' });
  }
};

const cambiarEstadoUsuario = async (req, res) => {
  try {
    const { id } = req.params;
    const { activo } = req.body;

    if (activo !== 0 && activo !== 1 && activo !== true && activo !== false) {
      return res.status(400).json({
        ok: false,
        error: 'El estado enviado no es válido'
      });
    }

    const nuevoEstado = activo === true || activo === 1 ? 1 : 0;

    const [usuario] = await db.query(
      'SELECT id FROM usuarios WHERE id = ? LIMIT 1',
      [id]
    );

    if (usuario.length === 0) {
      return res.status(404).json({
        ok: false,
        error: 'Usuario no encontrado'
      });
    }

    await db.query(
      'UPDATE usuarios SET activo = ? WHERE id = ?',
      [nuevoEstado, id]
    );

    res.json({
      ok: true,
      message: 'Estado actualizado correctamente'
    });
  } catch (error) {
    console.error('Error al cambiar estado del usuario:', error);
    res.status(500).json({
      ok: false,
      error: 'Error al cambiar estado del usuario'
    });
  }
};

const jwt = require('jsonwebtoken');

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const [rows] = await db.query(
      'SELECT * FROM usuarios WHERE email = ? LIMIT 1',
      [email]
    );

    if (rows.length === 0) {
      return res.status(400).json({
        ok: false,
        error: 'Credenciales inválidas'
      });
    }

    const usuario = rows[0];

    if (!usuario.activo) {
      return res.status(403).json({
        ok: false,
        error: 'Usuario inactivo'
      });
    }

    const passwordValido = await bcrypt.compare(password, usuario.password);

    if (!passwordValido) {
      return res.status(400).json({
        ok: false,
        error: 'Credenciales inválidas'
      });
    }

    const token = jwt.sign(
      {
        id: usuario.id,
        rol: usuario.rol
      },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    );

    res.json({
      ok: true,
      token,
      usuario: {
        id: usuario.id,
        nombre: usuario.nombre,
        apellido: usuario.apellido,
        email: usuario.email,
        rol: usuario.rol
      }
    });
  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({
      ok: false,
      error: 'Error en login'
    });
  }
};

module.exports = {
  listarUsuarios,
  crearUsuario,
  cambiarEstadoUsuario,
  login
};
