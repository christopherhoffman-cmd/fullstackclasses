const AppError = require('../utils/AppError');

function naoEncontrado(req, res) {
  res.status(404).json({ sucesso: false, erro: `Rota não encontrada: ${req.method} ${req.originalUrl}` });
}

function errorHandler(err, req, res, next) {
  if (err instanceof AppError) {
    return res.status(err.status).json({ sucesso: false, erro: err.message });
  }
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ sucesso: false, erro: 'JSON inválido no corpo da requisição.' });
  }
  if (err.code === '23505') {
    return res.status(409).json({ sucesso: false, erro: 'Registro duplicado.' });
  }
  console.error(err);
  return res.status(500).json({ sucesso: false, erro: 'Erro interno do servidor.' });
}

module.exports = { errorHandler, naoEncontrado };
