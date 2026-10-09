const { Router } = require('express');
const UsuarioController = require('../controllers/usuario.controller');
const { autorizar } = require('../middlewares/auth');

const router = Router();
router.use(autorizar('admin'));

router.get('/', UsuarioController.listar);
router.post('/', UsuarioController.criar);
router.put('/:id', UsuarioController.atualizar);
router.delete('/:id', UsuarioController.remover);

module.exports = router;
