const { Router } = require('express');
const CriterioController = require('../controllers/criterio.controller');
const { autorizar } = require('../middlewares/auth');

const router = Router();
const editores = autorizar('admin', 'pesquisador');

router.get('/', CriterioController.listar);
router.post('/', editores, CriterioController.criar);
router.put('/pesos', editores, CriterioController.atualizarPesos);
router.put('/:id', editores, CriterioController.atualizar);
router.delete('/:id', editores, CriterioController.remover);

module.exports = router;
