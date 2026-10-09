const CriterioService = require('../services/criterio.service');

class CriterioController {
  static async listar(req, res) {
    try {
      const criterios = await CriterioService.listarTodos();
      return res.status(200).json({ sucesso: true, dados: criterios });
    } catch (error) {
      return res.status(500).json({ sucesso: false, erro: error.message });
    }
  }

  static async atualizarPeso(req, res) {
    try {
      const { id } = req.params;
      const { peso } = req.body;
      const atualizado = await CriterioService.atualizarPeso(id, peso);
      return res.status(200).json({ sucesso: true, dados: atualizado });
    } catch (error) {
      return res.status(400).json({ sucesso: false, erro: error.message });
    }
  }
}

module.exports = CriterioController;