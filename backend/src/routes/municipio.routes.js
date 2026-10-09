const { Router } = require('express');
const MunicipioController = require('../controllers/municipio.controller');
const { autorizar } = require('../middlewares/auth');

const router = Router();
const editores = autorizar('admin', 'pesquisador');

router.get('/', MunicipioController.listar);
router.post('/', editores, MunicipioController.criar);
router.put('/:id', editores, MunicipioController.atualizar);
router.delete('/:id', editores, MunicipioController.remover);

module.exports = router;
