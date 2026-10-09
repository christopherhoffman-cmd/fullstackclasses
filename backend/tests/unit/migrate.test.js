jest.mock('../../src/config/db', () => {
  const client = { query: jest.fn() };
  return { query: jest.fn(), transaction: jest.fn((fn) => fn(client)), client };
});

const db = require('../../src/config/db');
const { migrar } = require('../../src/config/migrate');

beforeEach(() => jest.clearAllMocks());

describe('migrations', () => {
  test('aplica migrations pendentes e cria o administrador quando não há usuários', async () => {
    db.query
      .mockResolvedValueOnce({}) // CREATE TABLE schema_migrations
      .mockResolvedValueOnce({ rows: [] }) // nenhuma aplicada
      .mockResolvedValueOnce({ rows: [{ total: 0 }] }) // sem usuários
      .mockResolvedValueOnce({}); // INSERT admin
    const log = jest.spyOn(console, 'log').mockImplementation(() => {});

    await migrar();

    const registradas = db.client.query.mock.calls.filter(([sql]) => /INSERT INTO schema_migrations/.test(sql));
    expect(registradas.length).toBeGreaterThanOrEqual(2);
    expect(db.query.mock.calls[3][0]).toMatch(/INSERT INTO usuarios/);
    expect(db.query.mock.calls[3][1][2]).toMatch(/^\$2/); // senha armazenada como hash bcrypt
    expect(log).toHaveBeenCalled();
    log.mockRestore();
  });

  test('não reaplica migrations nem recria administrador existente', async () => {
    db.query
      .mockResolvedValueOnce({})
      .mockResolvedValueOnce({ rows: [{ nome: '001_schema_inicial.sql' }, { nome: '002_dados_iniciais.sql' }] })
      .mockResolvedValueOnce({ rows: [{ total: 1 }] });

    await migrar();

    expect(db.transaction).not.toHaveBeenCalled();
    expect(db.query).toHaveBeenCalledTimes(3);
  });
});
