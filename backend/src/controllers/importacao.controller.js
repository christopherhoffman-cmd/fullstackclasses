const ImportacaoService = require('../services/importacao.service');

const ok = (res, dados, status = 200) => res.status(status).json({ sucesso: true, dados });

const ImportacaoController = {
  async modelo(req, res) {
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="modelo-importacao.csv"');
    res.send(await ImportacaoService.modeloCsv());
  },
  async csv(req, res) {
    const texto = typeof req.body === 'string' ? req.body : req.body?.conteudo;
    ok(res, await ImportacaoService.importarCsv(texto));
  },
};

module.exports = ImportacaoController;
