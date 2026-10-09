# API

A referência completa dos endpoints (perfis, corpos e respostas) é o Swagger/OpenAPI:

- Interface: http://localhost:3001/api/docs
- JSON: http://localhost:3001/api/docs.json

Autentique-se em `POST /api/auth/login` e use o token no botão **Authorize**. Respostas seguem o formato `{ "sucesso": true, "dados": ... }` ou `{ "sucesso": false, "erro": "..." }`.
