const { Router } = require('express');
const MunicipioController = require('../controllers/municipio.controller');

const router = Router();
router.get('/', MunicipioController.listar);
router.post('/', MunicipioController.criar);

module.exports = router;