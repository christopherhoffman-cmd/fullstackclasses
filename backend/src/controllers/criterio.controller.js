const CriterioService = require('../services/criterio.service');

class CriterioController {
  static async listar(req, res) {
    const criterios = await CriterioService.listarTodos();
    res.status(200).json({ sucesso: true, dados: criterios });
  }

  static async criar(req, res) {
    const criterio = await CriterioService.criar(req.body);
    res.status(201).json({ sucesso: true, dados: criterio });
  }

  static async atualizar(req, res) {
    const criterio = await CriterioService.atualizar(req.params.id, req.body);
    res.status(200).json({ sucesso: true, dados: criterio });
  }

  static async atualizarPesos(req, res) {
    const criterios = await CriterioService.atualizarPesos(req.body?.pesos);
    res.status(200).json({ sucesso: true, dados: criterios });
  }

  static async remover(req, res) {
    await CriterioService.remover(req.params.id);
    res.status(204).end();
  }
}

module.exports = CriterioController;
