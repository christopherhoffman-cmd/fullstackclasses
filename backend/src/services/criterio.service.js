const CriterioModel = require('../models/criterio.model');
const AppError = require('../utils/AppError');
const { numeroOuNulo, idValido } = require('../utils/validacao');

const TOLERANCIA_SOMA = 0.001;

function validarPeso(peso) {
  const n = numeroOuNulo(peso, 'peso');
  if (n === null || n < 0 || n > 1) throw new AppError('O peso deve estar entre 0 e 1.', 422);
  return n;
}

function validarDados(dados = {}) {
  const nome = String(dados.nome || '').trim();
  if (!nome) throw new AppError('O nome do critério é obrigatório.', 422);
  if (!['beneficio', 'custo'].includes(dados.tipo)) {
    throw new AppError('O tipo deve ser "beneficio" ou "custo".', 422);
  }
  const texto = (v) => (v === undefined || v === null || String(v).trim() === '' ? null : String(v).trim());
  return {
    codigo: texto(dados.codigo)?.toUpperCase() ?? null,
    nome,
    descricao: texto(dados.descricao),
    tipo: dados.tipo,
    peso: dados.peso === undefined ? 0 : validarPeso(dados.peso),
    unidade: texto(dados.unidade),
    fonte: texto(dados.fonte),
  };
}

class CriterioService {
  static async listarTodos() {
    return CriterioModel.buscarTodos();
  }

  static async criar(dados) {
    return CriterioModel.criar(validarDados(dados));
  }

  static async atualizar(id, dados) {
    const atualizado = await CriterioModel.atualizar(idValido(id), validarDados(dados));
    if (!atualizado) throw new AppError('Critério não encontrado.', 404);
    return atualizado;
  }

  static async atualizarPesos(pesos) {
    if (!Array.isArray(pesos) || pesos.length === 0) {
      throw new AppError('Informe a lista de pesos: [{ id, peso }].', 422);
    }
    const itens = pesos.map((p) => ({ id: idValido(p.id), peso: validarPeso(p.peso) }));
    const soma = itens.reduce((s, p) => s + p.peso, 0);
    if (Math.abs(soma - 1) > TOLERANCIA_SOMA) {
      throw new AppError(`A soma dos pesos deve ser 1.0 (atual: ${soma.toFixed(4)}).`, 422);
    }
    return CriterioModel.atualizarPesos(itens);
  }

  static async remover(id) {
    const removido = await CriterioModel.remover(idValido(id));
    if (!removido) throw new AppError('Critério não encontrado.', 404);
  }
}

module.exports = CriterioService;
