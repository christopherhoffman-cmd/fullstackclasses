const { Router } = require('express');
const TopsisController = require('../controllers/topsis.controller');

const router = Router();
router.post('/executar', TopsisController.executar);

module.exports = router;