require('dotenv').config({ quiet: true });
const app = require('./app');
const { migrar } = require('./config/migrate');

const PORT = Number(process.env.PORT) || 3001;

migrar()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Servidor rodando na porta ${PORT}`);
      console.log(`Swagger: http://localhost:${PORT}/api/docs`);
    });
  })
  .catch((error) => {
    console.error('Não foi possível preparar o banco de dados:', error.message);
    process.exit(1);
  });
