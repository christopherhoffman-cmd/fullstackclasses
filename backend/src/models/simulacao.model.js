const db = require('../config/db');

class SimulacaoModel {
  static async salvarSimulacao(parametros, resultados) {
    const client = await db.pool.connect();
    try {
      await client.query('BEGIN');

      // 1. Registra a simulação
      const simulacaoQuery = `
        INSERT INTO simulacoes (parametros, status)
        VALUES ($1, 'concluida')
        RETURNING id, data_execucao;
      `;
      const resSimulacao = await client.query(simulacaoQuery, [JSON.stringify(parametros)]);
      const simulacaoId = resSimulacao.rows[0].id;

      // 2. Registra os resultados ordenados do ranking
      for (const item of resultados) {
        const rankingQuery = `
          INSERT INTO resultados_ranking 
            (simulacao_id, municipio_id, coeficiente_ci, distancia_positiva, distancia_negativa, posicao)
          VALUES ($1, $2, $3, $4, $5, $6);
        `;
        await client.query(rankingQuery, [
          simulacaoId,
          item.municipio_id,
          item.ci,
          item.dPlus,
          item.dMinus,
          item.posicao,
        ]);
      }

      await client.query('COMMIT');
      return { id: simulacaoId, total_avaliados: resultados.length };
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  static async buscarMatrizDecisao() {
    const query = `
      SELECT 
        m.id AS municipio_id,
        m.nome AS municipio_nome,
        c.id AS criterio_id,
        c.nome AS criterio_nome,
        c.tipo AS criterio_tipo,
        c.peso AS criterio_peso,
        md.valor
      FROM matriz_decisao md
      JOIN municipios m ON md.municipio_id = m.id
      JOIN criterios c ON md.criterio_id = c.id
      ORDER BY m.id, c.id;
    `;
    const { rows } = await db.query(query);
    return rows;
  }
}

module.exports = SimulacaoModel;