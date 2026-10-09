const { Router } = require('express');
const db = require('../config/db');
const { autenticar } = require('../middlewares/auth');
const authRoutes = require('./auth.routes');
const usuarioRoutes = require('./usuario.routes');
const municipioRoutes = require('./municipio.routes');
const criterioRoutes = require('./criterio.routes');
const topsisRoutes = require('./topsis.routes');
const simulacaoRoutes = require('./simulacao.routes');
const relatorioRoutes = require('./relatorio.routes');
const importacaoRoutes = require('./importacao.routes');

const router = Router();

router.get('/health', async (req, res) => {
  try {
    await db.query('SELECT 1;');
    res.status(200).json({ sucesso: true, status: 'ok', banco: 'conectado' });
  } catch {
    res.status(503).json({ sucesso: false, status: 'degradado', banco: 'indisponível' });
  }
});
router.use('/auth', authRoutes);

router.use(autenticar);
router.use('/usuarios', usuarioRoutes);
router.use('/municipios', municipioRoutes);
router.use('/criterios', criterioRoutes);
router.use('/topsis', topsisRoutes);
router.use('/simulacoes', simulacaoRoutes);
router.use('/relatorios', relatorioRoutes);
router.use('/importacao', importacaoRoutes);

module.exports = router;
