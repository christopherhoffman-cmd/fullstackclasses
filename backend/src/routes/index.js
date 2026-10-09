const { Router } = require('express');
const municipioRoutes = require('./municipio.routes');
const criterioRoutes = require('./criterio.routes');
const topsisRoutes = require('./topsis.routes');

const router = Router();

router.use('/municipios', municipioRoutes);
router.use('/criterios', criterioRoutes);
router.use('/topsis', topsisRoutes);

module.exports = router;