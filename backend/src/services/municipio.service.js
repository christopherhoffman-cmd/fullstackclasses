const MunicipioModel = require('../models/municipio.model');

class MunicipioService {
  static async listarTodos() {
    return await MunicipioModel.buscarTodos();
  }

  static async criarMunicipio(dados) {
    if (!dados.nome || !dados.uf) {
      throw new Error('Nome e UF são obrigatórios.');
    }
    return await MunicipioModel.criar(dados);
  }
}

module.exports = MunicipioService;