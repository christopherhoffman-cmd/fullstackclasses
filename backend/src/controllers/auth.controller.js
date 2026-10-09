const AuthService = require('../services/auth.service');

const ok = (res, dados, status = 200) => res.status(status).json({ sucesso: true, dados });

const AuthController = {
  async login(req, res) {
    ok(res, await AuthService.login(req.body?.email, req.body?.senha));
  },
};

module.exports = AuthController;
