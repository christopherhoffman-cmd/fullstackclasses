const db = require('../config/db');

class SimulacaoModel {
  static async salvarSimulacao({ parametros, descricao, usuarioId }, resultados) {
    return db.transaction(async (client) => {
      const resSimulacao = await client.query(
        `INSERT INTO simulacoes (parametros, usuario_id, descricao)
         VALUES ($1, $2, $3)
         RETURNING id, data_execucao;`,
        [JSON.stringify(parametros), usuarioId || null, descricao || null]
      );
      const { id, data_execucao } = resSimulacao.rows[0];

      if (resultados.length) {
        const valores = [];
        const placeholders = resultados.map((item, i) => {
          const b = i * 6;
          valores.push(id, item.municipio_id, item.ci, item.dPlus, item.dMinus, item.posicao);
          return `($${b + 1}, $${b + 2}, $${b + 3}, $${b + 4}, $${b + 5}, $${b + 6})`;
        });
        await client.query(
          `INSERT INTO resultados_ranking
             (simulacao_id, municipio_id, coeficiente_ci, distancia_positiva, distancia_negativa, posicao)
           VALUES ${placeholders.join(', ')};`,
          valores
        );
      }

      return { id, data_execucao, total_avaliados: resultados.length };
    });
  }

  static async listar({ limite = 50 } = {}) {
    const query = `
      SELECT s.id, s.data_execucao, s.descricao,
        u.nome AS usuario_nome,
        (SELECT COUNT(*) FROM resultados_ranking r WHERE r.simulacao_id = s.id) AS total_municipios,
        jsonb_array_length(COALESCE(s.parametros->'criterios', '[]'::jsonb)) AS total_criterios,
        (SELECT m.nome FROM resultados_ranking r JOIN municipios m ON m.id = r.municipio_id
          WHERE r.simulacao_id = s.id ORDER BY r.posicao ASC LIMIT 1) AS melhor_municipio,
        (SELECT m.nome FROM resultados_ranking r JOIN municipios m ON m.id = r.municipio_id
          WHERE r.simulacao_id = s.id ORDER BY r.posicao DESC LIMIT 1) AS mais_vulneravel
      FROM simulacoes s
      LEFT JOIN usuarios u ON u.id = s.usuario_id
      ORDER BY s.data_execucao DESC, s.id DESC
      LIMIT $1;
    `;
    const { rows } = await db.query(query, [limite]);
    return rows;
  }

  static async buscarPorId(id) {
    const { rows } = await db.query(
      `SELECT s.*, u.nome AS usuario_nome
       FROM simulacoes s LEFT JOIN usuarios u ON u.id = s.usuario_id
       WHERE s.id = $1;`,
      [id]
    );
    if (!rows[0]) return null;
    const resultados = await db.query(
      `SELECT r.municipio_id, m.nome, m.uf, m.latitude, m.longitude, m.populacao, m.idh,
         r.coeficiente_ci AS ci, r.distancia_positiva AS "dPlus",
         r.distancia_negativa AS "dMinus", r.posicao
       FROM resultados_ranking r
       JOIN municipios m ON m.id = r.municipio_id
       WHERE r.simulacao_id = $1
       ORDER BY r.posicao ASC;`,
      [id]
    );
    return { ...rows[0], ranking: resultados.rows };
  }

  static async buscarUltimaId() {
    const { rows } = await db.query('SELECT id FROM simulacoes ORDER BY data_execucao DESC, id DESC LIMIT 1;');
    return rows[0]?.id;
  }

  static async remover(id) {
    const { rowCount } = await db.query('DELETE FROM simulacoes WHERE id = $1;', [id]);
    return rowCount > 0;
  }
}

module.exports = SimulacaoModel;
