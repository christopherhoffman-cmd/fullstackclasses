const express = require('express');
const cors = require('cors');
require('dotenv').config();

const routes = require('./routes');

const app = express();
const PORT = process.env.PORT || 3001;

// Middlewares
app.use(cors());
app.use(express.json());

// Rotas da API
app.use('/api', routes);

// Rota de verificação de saúde da API
app.get('/', (req, res) => {
  res.status(200).json({
    projeto: 'Plataforma de Energia Renovável com TOPSIS',
    status: 'API Online',
    versao: '1.0.0',
  });
});

// Inicialização do servidor
app.listen(PORT, () => {
  console.log(`=================================`);
  console.log(`Servidor rodando na porta ${PORT}`);
  console.log(`URL Base: http://localhost:${PORT}/api`);
  console.log(`=================================`);
});