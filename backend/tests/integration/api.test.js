const request = require('supertest');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

jest.mock('../../src/config/db', () => ({
  query: jest.fn(),
  transaction: jest.fn((fn) => fn({ query: jest.fn() })),
  pool: {},
}));
jest.mock('../../src/models/municipio.model');
jest.mock('../../src/models/criterio.model');
jest.mock('../../src/models/matriz.model');
jest.mock('../../src/models/simulacao.model');
jest.mock('../../src/models/usuario.model');

const db = require('../../src/config/db');
const MunicipioModel = require('../../src/models/municipio.model');
const CriterioModel = require('../../src/models/criterio.model');
const MatrizModel = require('../../src/models/matriz.model');
const SimulacaoModel = require('../../src/models/simulacao.model');
const UsuarioModel = require('../../src/models/usuario.model');
const app = require('../../src/app');
const { JWT_SECRET } = require('../../src/middlewares/auth');

const token = (perfil, id = 1) => `Bearer ${jwt.sign({ sub: id, nome: 'Teste', email: 't@t.br', perfil }, JWT_SECRET)}`;
const ADMIN = token('admin');
const PESQUISADOR = token('pesquisador', 2);
const GESTOR = token('gestor', 3);

const CRITERIOS = [
  { id: 1, codigo: 'C1', nome: 'C1', tipo: 'custo', peso: 0.2, unidade: '%' },
  { id: 2, codigo: 'C2', nome: 'C2', tipo: 'beneficio', peso: 0.2 },
  { id: 3, codigo: 'C3', nome: 'C3', tipo: 'beneficio', peso: 0.15 },
  { id: 4, codigo: 'C4', nome: 'C4', tipo: 'custo', peso: 0.25 },
  { id: 5, codigo: 'C5', nome: 'C5', tipo: 'beneficio', peso: 0.2 },
  { id: 6, codigo: 'C6', nome: 'C6', tipo: 'custo', peso: 0 },
];
const MUNICIPIOS = [
  { id: 10, nome: 'Município A', uf: 'BA' },
  { id: 11, nome: 'Município B', uf: 'BA' },
  { id: 12, nome: 'Município C', uf: 'BA' },
  { id: 13, nome: 'Sem dados', uf: 'BA' },
];
const VALORES = {
  10: [15, 0.8, 980, 0.75, 5.2],
  11: [5, 2.1, 1850, 0.62, 5.8],
  12: [22, 0.3, 650, 0.89, 4.9],
};
const LINHAS_MATRIZ = Object.entries(VALORES).flatMap(([m, vals]) =>
  vals.map((valor, j) => ({ municipio_id: Number(m), criterio_id: j + 1, valor }))
);

beforeEach(() => {
  jest.clearAllMocks();
  CriterioModel.buscarTodos.mockResolvedValue(CRITERIOS.map((c) => ({ ...c })));
  MunicipioModel.buscarTodos.mockResolvedValue(MUNICIPIOS);
  MatrizModel.buscarValores.mockResolvedValue(LINHAS_MATRIZ);
  MatrizModel.salvarValores.mockImplementation(async (itens) => itens.length);
});

describe('Sistema', () => {
  test('GET /api/health com banco conectado e indisponível', async () => {
    db.query.mockResolvedValueOnce({ rows: [] });
    expect((await request(app).get('/api/health')).status).toBe(200);
    db.query.mockRejectedValueOnce(new Error('down'));
    expect((await request(app).get('/api/health')).status).toBe(503);
  });

  test('Swagger publicado em /api/docs.json', async () => {
    const res = await request(app).get('/api/docs.json');
    expect(res.status).toBe(200);
    expect(res.body.openapi).toMatch(/^3\./);
    expect(res.body.paths['/topsis/executar']).toBeDefined();
  });

  test('rota inexistente retorna 404 e JSON inválido retorna 400', async () => {
    expect((await request(app).get('/nao-existe')).status).toBe(404);
    const res = await request(app).post('/api/auth/login').set('Content-Type', 'application/json').send('{x');
    expect(res.status).toBe(400);
  });
});

describe('Autenticação (RNF04)', () => {
  const hash = bcrypt.hashSync('segredo1', 4);

  test('login exige e-mail e senha', async () => {
    expect((await request(app).post('/api/auth/login').send({})).status).toBe(422);
  });

  test('credenciais inválidas → 401', async () => {
    UsuarioModel.buscarPorEmail.mockResolvedValue({ id: 1, senha_hash: hash });
    const res = await request(app).post('/api/auth/login').send({ email: 'a@b.br', senha: 'errada' });
    expect(res.status).toBe(401);
  });

  test('login válido retorna JWT sem expor o hash', async () => {
    UsuarioModel.buscarPorEmail.mockResolvedValue({ id: 1, nome: 'Ana', email: 'a@b.br', perfil: 'gestor', senha_hash: hash });
    const res = await request(app).post('/api/auth/login').send({ email: ' A@B.br ', senha: 'segredo1' });
    expect(res.status).toBe(200);
    expect(UsuarioModel.buscarPorEmail).toHaveBeenCalledWith('a@b.br');
    expect(jwt.verify(res.body.dados.token, JWT_SECRET).perfil).toBe('gestor');
    expect(res.body.dados.usuario.senha_hash).toBeUndefined();
  });

  test('rotas protegidas exigem token válido', async () => {
    expect((await request(app).get('/api/municipios')).status).toBe(401);
    expect((await request(app).get('/api/municipios').set('Authorization', 'Bearer invalido')).status).toBe(401);
  });

  test('perfis sem permissão recebem 403', async () => {
    expect((await request(app).post('/api/municipios').set('Authorization', GESTOR).send({})).status).toBe(403);
    expect((await request(app).get('/api/usuarios').set('Authorization', PESQUISADOR)).status).toBe(403);
    expect((await request(app).delete('/api/simulacoes/1').set('Authorization', PESQUISADOR)).status).toBe(403);
  });
});

describe('Municípios (RF01)', () => {
  test('lista municípios', async () => {
    const res = await request(app).get('/api/municipios').set('Authorization', GESTOR);
    expect(res.status).toBe(200);
    expect(res.body.dados).toHaveLength(MUNICIPIOS.length);
  });

  test('cria município com valores da matriz', async () => {
    MunicipioModel.criar.mockResolvedValue(20);
    MunicipioModel.buscarPorId.mockResolvedValue({ id: 20, nome: 'Novo', uf: 'BA' });
    MatrizModel.buscarPorMunicipio.mockResolvedValue({ 1: 3.5 });
    const res = await request(app)
      .post('/api/municipios')
      .set('Authorization', PESQUISADOR)
      .send({ nome: 'Novo', uf: 'ba', idh: '0,7', valores: { 1: '3,5', 2: '' } });
    expect(res.status).toBe(201);
    expect(MunicipioModel.criar.mock.calls[0][0]).toMatchObject({ nome: 'Novo', uf: 'BA', idh: 0.7 });
    expect(MatrizModel.salvarValores.mock.calls[0][0]).toEqual([
      { municipio_id: 20, criterio_id: 1, valor: 3.5 },
      { municipio_id: 20, criterio_id: 2, valor: null },
    ]);
  });

  test('validação ao criar → 422', async () => {
    const res = await request(app).post('/api/municipios').set('Authorization', ADMIN).send({ nome: 'X' });
    expect(res.status).toBe(422);
    expect(res.body.erro).toMatch(/obrigatórios/);
  });

  test('atualiza e remove', async () => {
    MunicipioModel.atualizar.mockResolvedValueOnce(10).mockResolvedValueOnce(undefined);
    MunicipioModel.buscarPorId.mockResolvedValue({ id: 10, nome: 'A2', uf: 'BA' });
    MatrizModel.buscarPorMunicipio.mockResolvedValue({});
    expect((await request(app).put('/api/municipios/10').set('Authorization', ADMIN).send({ nome: 'A2', uf: 'BA' })).status).toBe(200);
    expect((await request(app).put('/api/municipios/99').set('Authorization', ADMIN).send({ nome: 'A2', uf: 'BA' })).status).toBe(404);

    MunicipioModel.remover.mockResolvedValueOnce(true).mockResolvedValueOnce(false);
    expect((await request(app).delete('/api/municipios/10').set('Authorization', ADMIN)).status).toBe(204);
    expect((await request(app).delete('/api/municipios/10').set('Authorization', ADMIN)).status).toBe(404);
  });

  test('erro de chave duplicada do PostgreSQL vira 409', async () => {
    MunicipioModel.criar.mockRejectedValue(Object.assign(new Error('dup'), { code: '23505', detail: 'codigo_ibge' }));
    const res = await request(app).post('/api/municipios').set('Authorization', ADMIN).send({ nome: 'X', uf: 'BA' });
    expect(res.status).toBe(409);
  });
});

describe('Critérios e pesos (RF02/RF03)', () => {
  test('lista', async () => {
    const res = await request(app).get('/api/criterios').set('Authorization', GESTOR);
    expect(res.body.dados).toHaveLength(CRITERIOS.length);
  });

  test('cria, atualiza e remove', async () => {
    CriterioModel.criar.mockImplementation(async (d) => ({ id: 7, ...d }));
    const criado = await request(app)
      .post('/api/criterios')
      .set('Authorization', PESQUISADOR)
      .send({ codigo: 'c7', nome: 'Projetos', tipo: 'beneficio', peso: 0.1, unidade: ' ' });
    expect(criado.status).toBe(201);
    expect(criado.body.dados).toMatchObject({ codigo: 'C7', unidade: null, peso: 0.1 });

    expect((await request(app).post('/api/criterios').set('Authorization', ADMIN).send({ nome: 'X', tipo: 'outro' })).status).toBe(422);
    expect((await request(app).post('/api/criterios').set('Authorization', ADMIN).send({ tipo: 'custo' })).status).toBe(422);

    CriterioModel.atualizar.mockResolvedValueOnce({ id: 7 }).mockResolvedValueOnce(undefined);
    expect((await request(app).put('/api/criterios/7').set('Authorization', ADMIN).send({ nome: 'P', tipo: 'custo' })).status).toBe(200);
    expect((await request(app).put('/api/criterios/8').set('Authorization', ADMIN).send({ nome: 'P', tipo: 'custo' })).status).toBe(404);

    CriterioModel.remover.mockResolvedValueOnce(true).mockResolvedValueOnce(false);
    expect((await request(app).delete('/api/criterios/7').set('Authorization', ADMIN)).status).toBe(204);
    expect((await request(app).delete('/api/criterios/7').set('Authorization', ADMIN)).status).toBe(404);
  });

  test('PUT /pesos exige soma = 1', async () => {
    CriterioModel.atualizarPesos.mockResolvedValue(CRITERIOS);
    const invalida = await request(app).put('/api/criterios/pesos').set('Authorization', ADMIN).send({ pesos: [{ id: 1, peso: 0.5 }] });
    expect(invalida.status).toBe(422);
    expect(invalida.body.erro).toMatch(/soma dos pesos/);
    expect((await request(app).put('/api/criterios/pesos').set('Authorization', ADMIN).send({})).status).toBe(422);
    const ok = await request(app)
      .put('/api/criterios/pesos')
      .set('Authorization', ADMIN)
      .send({ pesos: [{ id: 1, peso: 0.6 }, { id: 2, peso: 0.4 }] });
    expect(ok.status).toBe(200);
    expect(CriterioModel.atualizarPesos).toHaveBeenCalledWith([{ id: 1, peso: 0.6 }, { id: 2, peso: 0.4 }]);
  });
});

describe('TOPSIS (UC03 / RF04)', () => {
  const simulacaoSalva = (ranking) => ({
    id: 1,
    data_execucao: '2026-10-09',
    parametros: SimulacaoModel.salvarSimulacao.mock.calls[0][0].parametros,
    ranking,
  });

  beforeEach(() => {
    SimulacaoModel.salvarSimulacao.mockResolvedValue({ id: 1 });
    SimulacaoModel.buscarPorId.mockImplementation(async () => {
      const ranking = SimulacaoModel.salvarSimulacao.mock.calls[0][1].map((r) => ({
        ...r,
        nome: MUNICIPIOS.find((m) => m.id === r.municipio_id).nome,
      }));
      return simulacaoSalva(ranking);
    });
  });

  test('executa com os pesos salvos: B > A > C e deixa de fora quem não tem dados', async () => {
    const res = await request(app).post('/api/topsis/executar').set('Authorization', GESTOR).send({});
    expect(res.status).toBe(200);
    const { ranking, metadata } = res.body.dados;
    expect(ranking.map((r) => r.nome)).toEqual(['Município B', 'Município A', 'Município C']);
    expect(ranking[0].ci).toBeCloseTo(1);
    expect(ranking[0].faixa).toBe('Baixa');
    expect(metadata.criterios.map((c) => c.codigo)).toEqual(['C1', 'C2', 'C3', 'C4', 'C5']);
    expect(ranking.map((r) => r.municipio_id)).not.toContain(13);
    expect(SimulacaoModel.salvarSimulacao.mock.calls[0][0].usuarioId).toBe(3);
  });

  test('aceita subconjunto de municípios e pesos/tipos customizados', async () => {
    const res = await request(app)
      .post('/api/topsis/executar')
      .set('Authorization', ADMIN)
      .send({ municipios: [10, 12], criterios: [{ id: 1, peso: 1, tipo: 'beneficio' }], descricao: 'Só C1' });
    expect(res.status).toBe(200);
    expect(res.body.dados.ranking.map((r) => r.municipio_id)).toEqual([12, 10]);
    expect(SimulacaoModel.salvarSimulacao.mock.calls[0][0].descricao).toBe('Só C1');
  });

  test.each([
    [{ municipios: [10] }, /ao menos 2 municípios/],
    [{ criterios: [{ id: 99 }] }, /não encontrado/],
    [{ criterios: [{ id: 1, peso: -1 }] }, /não negativos/],
    [{ criterios: [{ id: 6 }] }, /peso maior que zero/],
  ])('rejeita %o com 422', async (corpo, erro) => {
    const res = await request(app).post('/api/topsis/executar').set('Authorization', ADMIN).send(corpo);
    expect(res.status).toBe(422);
    expect(res.body.erro).toMatch(erro);
  });

  test('valores não numéricos na matriz geram 422', async () => {
    MatrizModel.buscarValores.mockResolvedValue(LINHAS_MATRIZ.map((l) => ({ ...l, valor: l.municipio_id === 10 ? Number.NaN : l.valor })));
    const res = await request(app).post('/api/topsis/executar').set('Authorization', ADMIN).send({});
    expect(res.status).toBe(422);
  });
});

describe('Simulações e relatórios (RF06 / RF10 / UC04)', () => {
  const SIM = {
    id: 5,
    data_execucao: '2026-10-09T12:00:00Z',
    descricao: 'Cenário; teste',
    usuario_nome: 'Ana',
    parametros: {
      criterios: [{ id: 1, codigo: 'C1', nome: 'C1 - % sem eletricidade', tipo: 'custo', unidade: '%', peso: 1, peso_normalizado: 1 }],
      valores: { 10: { 1: 15 }, 11: { 1: 5 } },
    },
    ranking: [
      { municipio_id: 11, nome: 'Município B', uf: 'BA', ci: 1, dPlus: 0, dMinus: 0.2, posicao: 1 },
      { municipio_id: 10, nome: 'Município A', uf: 'BA', ci: 0, dPlus: 0.2, dMinus: 0, posicao: 2 },
    ],
  };

  test('lista histórico com limite saneado', async () => {
    SimulacaoModel.listar.mockResolvedValue([]);
    await request(app).get('/api/simulacoes?limite=99999').set('Authorization', GESTOR);
    expect(SimulacaoModel.listar).toHaveBeenCalledWith({ limite: 500 });
  });

  test('última simulação (null quando não há)', async () => {
    SimulacaoModel.buscarUltimaId.mockResolvedValueOnce(undefined).mockResolvedValueOnce(5);
    SimulacaoModel.buscarPorId.mockResolvedValue(SIM);
    expect((await request(app).get('/api/simulacoes/ultima').set('Authorization', GESTOR)).body.dados).toBeNull();
    expect((await request(app).get('/api/simulacoes/ultima').set('Authorization', GESTOR)).body.dados.simulacao_id).toBe(5);
  });

  test('obter e excluir simulação', async () => {
    SimulacaoModel.buscarPorId.mockResolvedValueOnce(SIM).mockResolvedValueOnce(null);
    expect((await request(app).get('/api/simulacoes/5').set('Authorization', GESTOR)).body.dados.ranking).toHaveLength(2);
    expect((await request(app).get('/api/simulacoes/6').set('Authorization', GESTOR)).status).toBe(404);
    SimulacaoModel.remover.mockResolvedValueOnce(true).mockResolvedValueOnce(false);
    expect((await request(app).delete('/api/simulacoes/5').set('Authorization', ADMIN)).status).toBe(204);
    expect((await request(app).delete('/api/simulacoes/5').set('Authorization', ADMIN)).status).toBe(404);
  });

  test('exporta CSV com cabeçalho, BOM e campos escapados', async () => {
    SimulacaoModel.buscarPorId.mockResolvedValue(SIM);
    const res = await request(app).get('/api/relatorios/5/csv').set('Authorization', GESTOR);
    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toMatch(/text\/csv/);
    expect(res.headers['content-disposition']).toMatch(/simulacao-5\.csv/);
    const linhas = res.text.replace(/^﻿/, '').trim().split('\r\n');
    expect(linhas[0]).toBe('posicao;municipio;uf;ci;distancia_positiva;distancia_negativa;vulnerabilidade;C1 (%)');
    expect(linhas[1]).toBe('1;Município B;BA;1.000000;0.000000;0.200000;Baixa;5');
  });

  test('exporta PDF', async () => {
    SimulacaoModel.buscarPorId.mockResolvedValue(SIM);
    const res = await request(app).get('/api/relatorios/5/pdf').set('Authorization', GESTOR).buffer(true);
    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toBe('application/pdf');
    expect(res.body.subarray(0, 4).toString()).toBe('%PDF');
  });
});

describe('Importação (RF09)', () => {
  test('modelo CSV contém as colunas dos critérios', async () => {
    const res = await request(app).get('/api/importacao/modelo-csv').set('Authorization', GESTOR);
    expect(res.text).toMatch(/nome;uf;codigo_ibge;populacao;idh;latitude;longitude;C1;C2;C3;C4;C5;C6/);
  });

  test('importa CSV criando/atualizando municípios e reportando erros por linha', async () => {
    MunicipioModel.buscarPorCodigoIbgeOuNome.mockResolvedValueOnce(undefined).mockResolvedValueOnce(10);
    MunicipioModel.criar.mockResolvedValue(30);
    const csv = 'nome;uf;idh;C1;C2\nNovo;BA;0,700;1234,5;2\nMunicípio A;BA;;15;\nSem UF;;;;\n';
    const res = await request(app).post('/api/importacao/csv').set('Authorization', PESQUISADOR).send({ conteudo: csv });
    expect(res.status).toBe(200);
    expect(res.body.dados).toMatchObject({ criados: 1, atualizados: 1, valores: 3, colunas_criterios: ['C1', 'C2'] });
    expect(res.body.dados.erros).toEqual([{ linha: 4, erro: 'Nome e UF são obrigatórios.' }]);
    expect(MatrizModel.salvarValores.mock.calls[0][0]).toEqual([
      { municipio_id: 30, criterio_id: 1, valor: 1234.5 },
      { municipio_id: 30, criterio_id: 2, valor: 2 },
    ]);
  });

  test('aceita corpo text/csv e valida cabeçalho', async () => {
    const semColunas = await request(app).post('/api/importacao/csv').set('Authorization', ADMIN).set('Content-Type', 'text/csv').send('a,b\n1,2');
    expect(semColunas.status).toBe(422);
    expect((await request(app).post('/api/importacao/csv').set('Authorization', ADMIN).send({ conteudo: 'nome;uf' })).status).toBe(422);
  });
});

describe('Usuários (RF08)', () => {
  test('admin lista, cria, atualiza e exclui', async () => {
    UsuarioModel.buscarTodos.mockResolvedValue([{ id: 1 }]);
    expect((await request(app).get('/api/usuarios').set('Authorization', ADMIN)).body.dados).toEqual([{ id: 1 }]);

    UsuarioModel.criar.mockImplementation(async ({ senhaHash, ...u }) => ({ id: 9, ...u, hashOk: bcrypt.compareSync('123456', senhaHash) }));
    const criado = await request(app)
      .post('/api/usuarios')
      .set('Authorization', ADMIN)
      .send({ nome: 'Gi', email: 'GI@X.BR', perfil: 'gestor', senha: '123456' });
    expect(criado.status).toBe(201);
    expect(criado.body.dados).toMatchObject({ email: 'gi@x.br', hashOk: true });

    UsuarioModel.atualizar.mockResolvedValueOnce({ id: 9 }).mockResolvedValueOnce(undefined);
    expect((await request(app).put('/api/usuarios/9').set('Authorization', ADMIN).send({ nome: 'Gi', email: 'gi@x.br', perfil: 'pesquisador' })).status).toBe(200);
    expect(UsuarioModel.atualizar.mock.calls[0][1].senhaHash).toBeNull();
    expect((await request(app).put('/api/usuarios/8').set('Authorization', ADMIN).send({ nome: 'Gi', email: 'gi@x.br', perfil: 'gestor' })).status).toBe(404);

    UsuarioModel.remover.mockResolvedValueOnce(true).mockResolvedValueOnce(false);
    expect((await request(app).delete('/api/usuarios/9').set('Authorization', ADMIN)).status).toBe(204);
    expect((await request(app).delete('/api/usuarios/9').set('Authorization', ADMIN)).status).toBe(404);
  });

  test.each([
    [{ nome: '', email: 'a@b.br', perfil: 'gestor', senha: '123456' }, /nome/],
    [{ nome: 'A', email: 'invalido', perfil: 'gestor', senha: '123456' }, /E-mail/],
    [{ nome: 'A', email: 'a@b.br', perfil: 'root', senha: '123456' }, /Perfil/],
    [{ nome: 'A', email: 'a@b.br', perfil: 'gestor', senha: '123' }, /6 caracteres/],
  ])('valida criação %#', async (corpo, erro) => {
    const res = await request(app).post('/api/usuarios').set('Authorization', ADMIN).send(corpo);
    expect(res.status).toBe(422);
    expect(res.body.erro).toMatch(erro);
  });
});
