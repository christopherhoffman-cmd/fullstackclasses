const MunicipioService = require('../services/municipio.service');

class MunicipioController {
  static async listar(req, res) {
    const municipios = await MunicipioService.listarTodos();
    res.status(200).json({ sucesso: true, dados: municipios });
  }

  static async criar(req, res) {
    const novoMunicipio = await MunicipioService.criarMunicipio(req.body);
    res.status(201).json({ sucesso: true, dados: novoMunicipio });
  }

  static async atualizar(req, res) {
    const municipio = await MunicipioService.atualizarMunicipio(req.params.id, req.body);
    res.status(200).json({ sucesso: true, dados: municipio });
  }

  static async remover(req, res) {
    await MunicipioService.removerMunicipio(req.params.id);
    res.status(204).end();
  }
}

module.exports = MunicipioController;
