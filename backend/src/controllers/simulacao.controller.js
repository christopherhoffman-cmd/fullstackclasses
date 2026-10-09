const SimulacaoService = require('../services/simulacao.service');

const ok = (res, dados, status = 200) => res.status(status).json({ sucesso: true, dados });

const SimulacaoController = {
  async listar(req, res) {
    ok(res, await SimulacaoService.listar(req.query.limite));
  },
  async ultima(req, res) {
    ok(res, await SimulacaoService.obterUltima());
  },
  async obter(req, res) {
    ok(res, await SimulacaoService.obter(req.params.id));
  },
  async remover(req, res) {
    await SimulacaoService.remover(req.params.id);
    res.status(204).end();
  },
};

module.exports = SimulacaoController;
