const MunicipioService = require('../services/municipio.service');

class MunicipioController {
  static async listar(req, res) {
    try {
      const municipios = await MunicipioService.listarTodos();
      return res.status(200).json({ sucesso: true, dados: municipios });
    } catch (error) {
      return res.status(500).json({ sucesso: false, erro: error.message });
    }
  }

  static async criar(req, res) {
    try {
      const novoMunicipio = await MunicipioService.criarMunicipio(req.body);
      return res.status(201).json({ sucesso: true, dados: novoMunicipio });
    } catch (error) {
      return res.status(400).json({ sucesso: false, erro: error.message });
    }
  }
}

module.exports = MunicipioController;