const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const UsuarioModel = require('../models/usuario.model');
const AppError = require('../utils/AppError');
const { JWT_SECRET } = require('../middlewares/auth');


function gerarToken(usuario) {
  return jwt.sign(
    { sub: usuario.id, nome: usuario.nome, email: usuario.email, perfil: usuario.perfil },
    JWT_SECRET,
    { expiresIn: '8h' }
  );
}

function publico({ id, nome, email, perfil, created_at }) {
  return { id, nome, email, perfil, created_at };
}

class AuthService {
  static async login(email, senha) {
    if (!email || !senha) throw new AppError('Informe e-mail e senha.', 422);
    const usuario = await UsuarioModel.buscarPorEmail(String(email).trim().toLowerCase());
    const valida = usuario && (await bcrypt.compare(String(senha), usuario.senha_hash));
    if (!valida) throw new AppError('E-mail ou senha inválidos.', 401);
    return { token: gerarToken(usuario), usuario: publico(usuario) };
  }
}

module.exports = AuthService;
