const db = require('../config/db');

class MunicipioModel {
  static async buscarTodos() {
    const query = 'SELECT * FROM municipios ORDER BY nome ASC;';
    const { rows } = await db.query(query);
    return rows;
  }

  static async buscarPorId(id) {
    const query = 'SELECT * FROM municipios WHERE id = $1;';
    const { rows } = await db.query(query, [id]);
    return rows[0];
  }

  static async criar({ nome, uf, populacao, idh, latitude, longitude }) {
    const query = `
      INSERT INTO municipios (nome, uf, populacao, idh, latitude, longitude)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *;
    `;
    const values = [nome, uf, populacao, idh, latitude, longitude];
    const { rows } = await db.query(query, values);
    return rows[0];
  }
}

module.exports = MunicipioModel;