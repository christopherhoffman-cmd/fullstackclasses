const db = require('../config/db');

class MatrizModel {
  static async buscarValores() {
    const { rows } = await db.query('SELECT municipio_id, criterio_id, valor FROM matriz_decisao;');
    return rows;
  }

  static async buscarPorMunicipio(municipioId) {
    const { rows } = await db.query(
      'SELECT criterio_id, valor FROM matriz_decisao WHERE municipio_id = $1;',
      [municipioId]
    );
    return Object.fromEntries(rows.map((r) => [r.criterio_id, r.valor]));
  }

  static async salvarValores(itens, client = db) {
    const executar = async (c) => {
      for (const item of itens) {
        if (item.valor === null) {
          await c.query(
            'DELETE FROM matriz_decisao WHERE municipio_id = $1 AND criterio_id = $2;',
            [item.municipio_id, item.criterio_id]
          );
        } else {
          await c.query(
            `INSERT INTO matriz_decisao (municipio_id, criterio_id, valor)
             VALUES ($1, $2, $3)
             ON CONFLICT (municipio_id, criterio_id) DO UPDATE SET valor = EXCLUDED.valor;`,
            [item.municipio_id, item.criterio_id, item.valor]
          );
        }
      }
      return itens.length;
    };
    return client === db ? db.transaction(executar) : executar(client);
  }
}

module.exports = MatrizModel;
