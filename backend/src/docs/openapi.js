const ref = (nome) => ({ $ref: `#/components/schemas/${nome}` });
const json = (schema) => ({ 'application/json': { schema } });
const dados = (schema) => ({ description: 'Sucesso', content: json({ type: 'object', properties: { dados: schema } }) });
const lista = (nome) => dados({ type: 'array', items: ref(nome) });
const corpo = (schema) => ({ required: true, content: json(schema) });
const id = [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }];
const semConteudo = { 204: { description: 'Sem conteúdo' } };
const arquivo = (tipo) => ({ 200: { description: 'Arquivo', content: { [tipo]: { schema: { type: 'string', format: 'binary' } } } } });
const objeto = (properties) => ({ type: 'object', properties });
const texto = { type: 'string' };
const numero = { type: 'number' };
const inteiro = { type: 'integer' };

const op = (tag, summary, extra = {}) => ({ tags: [tag], summary, ...extra });

module.exports = {
  openapi: '3.0.3',
  info: { title: 'API TOPSIS - Energia Renovável', version: '2.0.0' },
  servers: [{ url: '/api' }],
  security: [{ bearerAuth: [] }],
  components: {
    securitySchemes: { bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' } },
    responses: {
      401: { description: 'Não autenticado', content: json(ref('Erro')) },
      422: { description: 'Dados inválidos', content: json(ref('Erro')) },
    },
    schemas: {
      Erro: objeto({ sucesso: { type: 'boolean' }, erro: texto }),
      Usuario: objeto({ id: inteiro, nome: texto, email: texto, perfil: { type: 'string', enum: ['admin', 'pesquisador', 'gestor'] } }),
      Municipio: objeto({
        id: inteiro, nome: texto, uf: texto, codigo_ibge: inteiro, populacao: inteiro, idh: numero,
        latitude: numero, longitude: numero, valores: { type: 'object', description: '{ criterio_id: valor }' },
      }),
      Criterio: objeto({
        id: inteiro, codigo: texto, nome: texto, tipo: { type: 'string', enum: ['beneficio', 'custo'] },
        peso: numero, unidade: texto, fonte: texto,
      }),
      Simulacao: objeto({
        simulacao_id: inteiro, data_execucao: texto, descricao: texto, usuario_nome: texto,
        ranking: { type: 'array', items: objeto({ posicao: inteiro, municipio_id: inteiro, nome: texto, ci: numero, dPlus: numero, dMinus: numero, faixa: texto }) },
        metadata: { type: 'object' },
      }),
    },
  },
  paths: {
    '/health': { get: op('Sistema', 'Verifica API e banco', { security: [], responses: { 200: { description: 'OK' }, 503: { description: 'Banco indisponível' } } }) },
    '/auth/login': {
      post: op('Autenticação', 'Login (retorna JWT)', {
        security: [],
        requestBody: corpo(objeto({ email: texto, senha: texto })),
        responses: { 200: dados(objeto({ token: texto, usuario: ref('Usuario') })), 401: { $ref: '#/components/responses/401' } },
      }),
    },
    '/usuarios': {
      get: op('Usuários', 'Lista usuários (admin)', { responses: { 200: lista('Usuario') } }),
      post: op('Usuários', 'Cria usuário (admin)', { requestBody: corpo(objeto({ nome: texto, email: texto, perfil: texto, senha: texto })), responses: { 201: dados(ref('Usuario')) } }),
    },
    '/usuarios/{id}': {
      put: op('Usuários', 'Atualiza usuário (admin)', { parameters: id, requestBody: corpo(objeto({ nome: texto, email: texto, perfil: texto, senha: texto })), responses: { 200: dados(ref('Usuario')) } }),
      delete: op('Usuários', 'Exclui usuário (admin)', { parameters: id, responses: semConteudo }),
    },
    '/municipios': {
      get: op('Municípios', 'Lista municípios com valores da matriz', { responses: { 200: lista('Municipio') } }),
      post: op('Municípios', 'Cria município', { requestBody: corpo(ref('Municipio')), responses: { 201: dados(ref('Municipio')) } }),
    },
    '/municipios/{id}': {
      put: op('Municípios', 'Atualiza município', { parameters: id, requestBody: corpo(ref('Municipio')), responses: { 200: dados(ref('Municipio')) } }),
      delete: op('Municípios', 'Exclui município', { parameters: id, responses: semConteudo }),
    },
    '/criterios': {
      get: op('Critérios', 'Lista critérios', { responses: { 200: lista('Criterio') } }),
      post: op('Critérios', 'Cria critério', { requestBody: corpo(ref('Criterio')), responses: { 201: dados(ref('Criterio')) } }),
    },
    '/criterios/pesos': {
      put: op('Critérios', 'Salva os pesos (soma = 1)', {
        requestBody: corpo(objeto({ pesos: { type: 'array', items: objeto({ id: inteiro, peso: numero }) } })),
        responses: { 200: lista('Criterio') },
      }),
    },
    '/criterios/{id}': {
      put: op('Critérios', 'Atualiza critério', { parameters: id, requestBody: corpo(ref('Criterio')), responses: { 200: dados(ref('Criterio')) } }),
      delete: op('Critérios', 'Exclui critério', { parameters: id, responses: semConteudo }),
    },
    '/topsis/executar': {
      post: op('TOPSIS', 'Executa o TOPSIS e salva a simulação', {
        requestBody: corpo(objeto({
          descricao: texto,
          municipios: { type: 'array', items: inteiro },
          criterios: { type: 'array', items: objeto({ id: inteiro, peso: numero, tipo: texto }) },
        })),
        responses: { 200: dados(ref('Simulacao')) },
      }),
    },
    '/simulacoes': { get: op('Simulações', 'Histórico de simulações', { parameters: [{ name: 'limite', in: 'query', schema: inteiro }], responses: { 200: { description: 'Sucesso' } } }) },
    '/simulacoes/ultima': { get: op('Simulações', 'Última simulação', { responses: { 200: dados(ref('Simulacao')) } }) },
    '/simulacoes/{id}': {
      get: op('Simulações', 'Resultado de uma simulação', { parameters: id, responses: { 200: dados(ref('Simulacao')) } }),
      delete: op('Simulações', 'Exclui simulação (admin)', { parameters: id, responses: semConteudo }),
    },
    '/relatorios/{id}/pdf': { get: op('Relatórios', 'Exporta simulação em PDF', { parameters: id, responses: arquivo('application/pdf') }) },
    '/relatorios/{id}/csv': { get: op('Relatórios', 'Exporta simulação em CSV', { parameters: id, responses: arquivo('text/csv') }) },
    '/importacao/modelo-csv': { get: op('Importação', 'Baixa o modelo de CSV', { responses: arquivo('text/csv') }) },
    '/importacao/csv': {
      post: op('Importação', 'Importa municípios e valores via CSV', {
        requestBody: corpo(objeto({ conteudo: texto })),
        responses: { 200: dados(objeto({ criados: inteiro, atualizados: inteiro, valores: inteiro, erros: { type: 'array', items: { type: 'object' } } })), 422: { $ref: '#/components/responses/422' } },
      }),
    },
  },
};
