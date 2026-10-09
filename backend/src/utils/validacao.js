const AppError = require('./AppError');

function numeroOuNulo(valor, campo) {
  if (valor === null || valor === undefined || valor === '') return null;
  const n = typeof valor === 'number' ? valor : Number(String(valor).replace(',', '.'));
  if (!Number.isFinite(n)) throw new AppError(`O campo "${campo}" deve ser numérico.`, 422);
  return n;
}

function idValido(id) {
  const n = Number(id);
  if (!Number.isInteger(n) || n <= 0) throw new AppError('Identificador inválido.', 400);
  return n;
}

module.exports = { numeroOuNulo, idValido };
