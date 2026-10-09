const { Router } = require('express');
const CriterioController = require('../controllers/criterio.controller');

const router = Router();
router.get('/', CriterioController.listar);
router.patch('/:id/peso', CriterioController.atualizarPeso);

module.exports = router;