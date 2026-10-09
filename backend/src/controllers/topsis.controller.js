const TopsisService = require('../services/topsis.service');

class TopsisController {
  static async executar(req, res) {
    try {
      const { criterios } = req.body;
      const resultado = await TopsisService.executarAnalise(criterios);
      return res.status(200).json({
        sucesso: true,
        mensagem: 'Cálculo TOPSIS executado com sucesso.',
        dados: resultado,
      });
    } catch (error) {
      return res.status(500).json({
        sucesso: false,
        erro: error.message,
      });
    }
  }
}

module.exports = TopsisController;