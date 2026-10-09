const RelatorioService = require('../services/relatorio.service');

const RelatorioController = {
  async pdf(req, res) {
    const { nomeArquivo, conteudo } = await RelatorioService.gerarPdf(req.params.id);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${nomeArquivo}"`);
    res.send(conteudo);
  },
  async csv(req, res) {
    const { nomeArquivo, conteudo } = await RelatorioService.gerarCsv(req.params.id);
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${nomeArquivo}"`);
    res.send(conteudo);
  },
};

module.exports = RelatorioController;
