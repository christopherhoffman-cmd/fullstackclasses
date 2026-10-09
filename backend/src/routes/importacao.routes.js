const { Router } = require('express');
const express = require('express');
const ImportacaoController = require('../controllers/importacao.controller');
const { autorizar } = require('../middlewares/auth');

const router = Router();
const editores = autorizar('admin', 'pesquisador');

router.get('/modelo-csv', ImportacaoController.modelo);
router.post('/csv', editores, express.text({ type: ['text/csv', 'text/plain'] }), ImportacaoController.csv);

module.exports = router;
