const db = require('../config/db');

const COLUNAS = `m.id, m.nome, m.uf, m.codigo_ibge, m.populacao, m.idh,
  m.latitude, m.longitude, m.created_at, m.updated_at`;

class MunicipioModel {
  static async buscarTodos() {
    const { rows } = await db.query(`
      SELECT ${COLUNAS},
        COALESCE(
          (SELECT json_object_agg(md.criterio_id, md.valor)
           FROM matriz_decisao md WHERE md.municipio_id = m.id),
          '{}'::json
        ) AS valores
      FROM municipios m
      ORDER BY m.nome ASC;
    `);
    return rows;
  }

  static async buscarPorId(id) {
    const { rows } = await db.query(`SELECT ${COLUNAS} FROM municipios m WHERE m.id = $1;`, [id]);
    return rows[0];
  }

  static async criar(dados, client = db) {
    const query = `
      INSERT INTO municipios (nome, uf, codigo_ibge, populacao, idh, latitude, longitude)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING id;
    `;
    const { rows } = await client.query(query, [
      dados.nome,
      dados.uf,
      dados.codigo_ibge,
      dados.populacao,
      dados.idh,
      dados.latitude,
      dados.longitude,
    ]);
    return rows[0].id;
  }

  static async atualizar(id, dados, client = db) {
    const query = `
      UPDATE municipios SET
        nome = $1, uf = $2, codigo_ibge = $3, populacao = $4, idh = $5,
        latitude = $6, longitude = $7, updated_at = NOW()
      WHERE id = $8
      RETURNING id;
    `;
    const { rows } = await client.query(query, [
      dados.nome,
      dados.uf,
      dados.codigo_ibge,
      dados.populacao,
      dados.idh,
      dados.latitude,
      dados.longitude,
      id,
    ]);
    return rows[0]?.id;
  }

  static async remover(id) {
    const { rowCount } = await db.query('DELETE FROM municipios WHERE id = $1;', [id]);
    return rowCount > 0;
  }

  static async buscarPorCodigoIbgeOuNome({ codigo_ibge, nome, uf }, client = db) {
    const { rows } = await client.query(
      `SELECT id FROM municipios
       WHERE ($1::int IS NOT NULL AND codigo_ibge = $1)
          OR (LOWER(nome) = LOWER($2) AND uf = $3)
       LIMIT 1;`,
      [codigo_ibge ?? null, nome, uf]
    );
    return rows[0]?.id;
  }
}

module.exports = MunicipioModel;
