const db = require('../config/db');
const MunicipioModel = require('../models/municipio.model');
const MatrizModel = require('../models/matriz.model');
const AppError = require('../utils/AppError');
const { numeroOuNulo, idValido } = require('../utils/validacao');

const UFS = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS', 'MG', 'PA',
  'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO',
];

function validarDados(dados = {}) {
  const nome = String(dados.nome || '').trim();
  const uf = String(dados.uf || '').trim().toUpperCase();
  if (!nome || !uf) throw new AppError('Nome e UF são obrigatórios.', 422);
  if (nome.length > 200) throw new AppError('O nome deve ter no máximo 200 caracteres.', 422);
  if (!UFS.includes(uf)) throw new AppError(`UF inválida: ${uf}.`, 422);

  const populacao = numeroOuNulo(dados.populacao, 'populacao');
  const idh = numeroOuNulo(dados.idh, 'idh');
  const latitude = numeroOuNulo(dados.latitude, 'latitude');
  const longitude = numeroOuNulo(dados.longitude, 'longitude');
  const codigoIbge = numeroOuNulo(dados.codigo_ibge, 'codigo_ibge');

  if (populacao !== null && (!Number.isInteger(populacao) || populacao < 0)) {
    throw new AppError('A população deve ser um inteiro não negativo.', 422);
  }
  if (idh !== null && (idh < 0 || idh > 1)) throw new AppError('O IDH deve estar entre 0 e 1.', 422);
  if (latitude !== null && (latitude < -90 || latitude > 90)) {
    throw new AppError('A latitude deve estar entre -90 e 90.', 422);
  }
  if (longitude !== null && (longitude < -180 || longitude > 180)) {
    throw new AppError('A longitude deve estar entre -180 e 180.', 422);
  }
  if (codigoIbge !== null && !/^\d{7}$/.test(String(codigoIbge))) {
    throw new AppError('O código IBGE deve ter 7 dígitos.', 422);
  }

  return { nome, uf, populacao, idh, latitude, longitude, codigo_ibge: codigoIbge };
}

function itensMatriz(municipioId, valores) {
  if (!valores || typeof valores !== 'object') return [];
  return Object.entries(valores).map(([criterioId, valor]) => ({
    municipio_id: municipioId,
    criterio_id: idValido(criterioId),
    valor: numeroOuNulo(valor, `valor do critério ${criterioId}`),
  }));
}

class MunicipioService {
  static async listarTodos() {
    return MunicipioModel.buscarTodos();
  }

  static async buscarPorId(id) {
    const municipio = await MunicipioModel.buscarPorId(idValido(id));
    if (!municipio) throw new AppError('Município não encontrado.', 404);
    const valores = await MatrizModel.buscarPorMunicipio(municipio.id);
    return { ...municipio, valores };
  }

  static async criarMunicipio(dados) {
    const validado = validarDados(dados);
    const id = await db.transaction(async (client) => {
      const novoId = await MunicipioModel.criar(validado, client);
      await MatrizModel.salvarValores(itensMatriz(novoId, dados.valores), client);
      return novoId;
    });
    return MunicipioService.buscarPorId(id);
  }

  static async atualizarMunicipio(id, dados) {
    const municipioId = idValido(id);
    const validado = validarDados(dados);
    const atualizado = await db.transaction(async (client) => {
      const ok = await MunicipioModel.atualizar(municipioId, validado, client);
      if (!ok) return false;
      await MatrizModel.salvarValores(itensMatriz(municipioId, dados.valores), client);
      return true;
    });
    if (!atualizado) throw new AppError('Município não encontrado.', 404);
    return MunicipioService.buscarPorId(municipioId);
  }

  static async removerMunicipio(id) {
    const removido = await MunicipioModel.remover(idValido(id));
    if (!removido) throw new AppError('Município não encontrado.', 404);
  }
}

module.exports = MunicipioService;
module.exports.validarDados = validarDados;
module.exports.UFS = UFS;
