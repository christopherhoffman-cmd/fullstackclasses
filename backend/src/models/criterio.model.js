const db = require('../config/db');

class CriterioModel {
  static async buscarTodos() {
    const { rows } = await db.query('SELECT * FROM criterios ORDER BY codigo ASC NULLS LAST, id ASC;');
    return rows;
  }

  static async buscarPorId(id) {
    const { rows } = await db.query('SELECT * FROM criterios WHERE id = $1;', [id]);
    return rows[0];
  }

  static async criar({ codigo, nome, descricao, tipo, peso, unidade, fonte }) {
    const query = `
      INSERT INTO criterios (codigo, nome, descricao, tipo, peso, unidade, fonte)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *;
    `;
    const { rows } = await db.query(query, [codigo, nome, descricao, tipo, peso, unidade, fonte]);
    return rows[0];
  }

  static async atualizar(id, { codigo, nome, descricao, tipo, peso, unidade, fonte }) {
    const query = `
      UPDATE criterios SET codigo = $1, nome = $2, descricao = $3, tipo = $4,
        peso = $5, unidade = $6, fonte = $7
      WHERE id = $8
      RETURNING *;
    `;
    const { rows } = await db.query(query, [codigo, nome, descricao, tipo, peso, unidade, fonte, id]);
    return rows[0];
  }

  static async atualizarPesos(pesos) {
    return db.transaction(async (client) => {
      for (const { id, peso } of pesos) {
        await client.query('UPDATE criterios SET peso = $1 WHERE id = $2;', [peso, id]);
      }
      const { rows } = await client.query('SELECT * FROM criterios ORDER BY codigo ASC NULLS LAST, id ASC;');
      return rows;
    });
  }

  static async remover(id) {
    const { rowCount } = await db.query('DELETE FROM criterios WHERE id = $1;', [id]);
    return rowCount > 0;
  }
}

module.exports = CriterioModel;
