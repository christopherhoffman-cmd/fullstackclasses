const jwt = require('jsonwebtoken');
const AppError = require('../utils/AppError');

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-altere-em-producao';

function autenticar(req, res, next) {
  const [esquema, token] = (req.headers.authorization || '').split(' ');
  if (esquema !== 'Bearer' || !token) {
    return next(new AppError('Token de autenticação não informado.', 401));
  }
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.usuario = { id: payload.sub, nome: payload.nome, email: payload.email, perfil: payload.perfil };
    return next();
  } catch {
    return next(new AppError('Token inválido ou expirado.', 401));
  }
}

function autorizar(...perfis) {
  return (req, res, next) => {
    if (!req.usuario || !perfis.includes(req.usuario.perfil)) {
      return next(new AppError('Acesso negado para o seu perfil.', 403));
    }
    return next();
  };
}

module.exports = { autenticar, autorizar, JWT_SECRET };
