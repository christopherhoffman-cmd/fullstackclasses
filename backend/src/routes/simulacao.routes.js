const { Router } = require('express');
const SimulacaoController = require('../controllers/simulacao.controller');
const { autorizar } = require('../middlewares/auth');

const router = Router();
router.get('/', SimulacaoController.listar);
router.get('/ultima', SimulacaoController.ultima);
router.get('/:id', SimulacaoController.obter);
router.delete('/:id', autorizar('admin'), SimulacaoController.remover);

module.exports = router;
