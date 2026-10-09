const { Router } = require('express');
const RelatorioController = require('../controllers/relatorio.controller');

const router = Router();
router.get('/:id/pdf', RelatorioController.pdf);
router.get('/:id/csv', RelatorioController.csv);

module.exports = router;
