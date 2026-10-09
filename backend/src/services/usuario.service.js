const bcrypt = require('bcryptjs');
const UsuarioModel = require('../models/usuario.model');
const AppError = require('../utils/AppError');
const { idValido } = require('../utils/validacao');

const PERFIS = ['admin', 'pesquisador', 'gestor'];
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validarDados(dados = {}, { senhaObrigatoria }) {
  const nome = String(dados.nome || '').trim();
  const email = String(dados.email || '').trim().toLowerCase();
  if (!nome) throw new AppError('O nome é obrigatório.', 422);
  if (!EMAIL_REGEX.test(email)) throw new AppError('E-mail inválido.', 422);
  if (!PERFIS.includes(dados.perfil)) throw new AppError(`Perfil inválido. Use: ${PERFIS.join(', ')}.`, 422);
  const senha = dados.senha ? String(dados.senha) : '';
  if ((senhaObrigatoria || senha) && senha.length < 6) {
    throw new AppError('A senha deve ter ao menos 6 caracteres.', 422);
  }
  return { nome, email, perfil: dados.perfil, senha };
}

class UsuarioService {
  static async listar() {
    return UsuarioModel.buscarTodos();
  }

  static async criar(dados) {
    const v = validarDados(dados, { senhaObrigatoria: true });
    const senhaHash = await bcrypt.hash(v.senha, 10);
    return UsuarioModel.criar({ ...v, senhaHash });
  }

  static async atualizar(id, dados) {
    const usuarioId = idValido(id);
    const v = validarDados(dados, { senhaObrigatoria: false });
    const senhaHash = v.senha ? await bcrypt.hash(v.senha, 10) : null;
    const atualizado = await UsuarioModel.atualizar(usuarioId, { ...v, senhaHash });
    if (!atualizado) throw new AppError('Usuário não encontrado.', 404);
    return atualizado;
  }

  static async remover(id) {
    const usuarioId = idValido(id);
    const removido = await UsuarioModel.remover(usuarioId);
    if (!removido) throw new AppError('Usuário não encontrado.', 404);
  }
}

module.exports = UsuarioService;
module.exports.PERFIS = PERFIS;
