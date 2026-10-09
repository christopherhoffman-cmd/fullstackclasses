const db = require('../config/db');

const COLUNAS_PUBLICAS = 'id, nome, email, perfil, created_at';

class UsuarioModel {
  static async buscarTodos() {
    const { rows } = await db.query(`SELECT ${COLUNAS_PUBLICAS} FROM usuarios ORDER BY nome ASC;`);
    return rows;
  }

  static async buscarPorId(id) {
    const { rows } = await db.query(`SELECT ${COLUNAS_PUBLICAS} FROM usuarios WHERE id = $1;`, [id]);
    return rows[0];
  }

  static async buscarPorEmail(email) {
    const { rows } = await db.query('SELECT * FROM usuarios WHERE email = $1;', [email]);
    return rows[0];
  }

  static async criar({ nome, email, senhaHash, perfil }) {
    const { rows } = await db.query(
      `INSERT INTO usuarios (nome, email, senha_hash, perfil)
       VALUES ($1, $2, $3, $4) RETURNING ${COLUNAS_PUBLICAS};`,
      [nome, email, senhaHash, perfil]
    );
    return rows[0];
  }

  static async atualizar(id, { nome, email, perfil, senhaHash }) {
    const { rows } = await db.query(
      `UPDATE usuarios SET nome = $1, email = $2, perfil = $3,
         senha_hash = COALESCE($4, senha_hash)
       WHERE id = $5 RETURNING ${COLUNAS_PUBLICAS};`,
      [nome, email, perfil, senhaHash || null, id]
    );
    return rows[0];
  }

  static async remover(id) {
    const { rowCount } = await db.query('DELETE FROM usuarios WHERE id = $1;', [id]);
    return rowCount > 0;
  }
}

module.exports = UsuarioModel;
