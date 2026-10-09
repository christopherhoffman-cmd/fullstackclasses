const UsuarioService = require('../services/usuario.service');

const ok = (res, dados, status = 200) => res.status(status).json({ sucesso: true, dados });

const UsuarioController = {
  async listar(req, res) {
    ok(res, await UsuarioService.listar());
  },
  async criar(req, res) {
    ok(res, await UsuarioService.criar(req.body), 201);
  },
  async atualizar(req, res) {
    ok(res, await UsuarioService.atualizar(req.params.id, req.body));
  },
  async remover(req, res) {
    await UsuarioService.remover(req.params.id);
    res.status(204).end();
  },
};

module.exports = UsuarioController;
