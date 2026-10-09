const CriterioModel = require('../models/criterio.model');

class CriterioService {
  static async listarTodos() {
    return await CriterioModel.buscarTodos();
  }

  static async atualizarPeso(id, peso) {
    if (peso < 0 || peso > 1) {
      throw new Error('O peso deve estar entre 0 e 1.');
    }
    return await CriterioModel.atualizarPeso(id, peso);
  }
}

module.exports = CriterioService;