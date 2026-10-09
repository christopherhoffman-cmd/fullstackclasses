const TopsisService = require('../services/topsis.service');

class TopsisController {
  static async executar(req, res) {
    const resultado = await TopsisService.executarAnalise(req.body || {}, req.usuario);
    res.status(200).json({
      sucesso: true,
      mensagem: 'Cálculo TOPSIS executado com sucesso.',
      dados: resultado,
    });
  }
}

module.exports = TopsisController;
