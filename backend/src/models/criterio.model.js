const db = require('../config/db');

class CriterioModel {
  static async buscarTodos() {
    const query = 'SELECT * FROM criterios ORDER BY id ASC;';
    const { rows } = await db.query(query);
    return rows;
  }

  static async atualizarPeso(id, peso) {
    const query = 'UPDATE criterios SET peso = $1 WHERE id = $2 RETURNING *;';
    const { rows } = await db.query(query, [peso, id]);
    return rows[0];
  }
}

module.exports = CriterioModel;