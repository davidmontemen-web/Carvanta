const jwt = require('jsonwebtoken');

const validarToken = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        ok: false,
        error: 'Token no proporcionado'
      });
    }

    const token = authHeader.split(' ')[1];

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.usuario = decoded;
    next();
  } catch (error) {
    return res.status(401).json({
      ok: false,
      error: 'Token inválido o expirado'
    });
  }
};

const soloAdministrador = (req, res, next) => {
  if (!req.usuario || req.usuario.rol !== 'administrador') {
    return res.status(403).json({
      ok: false,
      error: 'No tienes permisos para esta acción'
    });
  }

  next();
};

module.exports = {
  validarToken,
  soloAdministrador
};