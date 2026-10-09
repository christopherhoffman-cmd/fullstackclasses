require('dotenv').config({ quiet: true });
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const db = require('./db');

const MIGRATIONS_DIR = path.join(__dirname, '..', '..', 'migrations');

async function migrar() {
  await db.query(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      nome VARCHAR(200) PRIMARY KEY,
      aplicado_em TIMESTAMP DEFAULT NOW()
    );
  `);

  const { rows } = await db.query('SELECT nome FROM schema_migrations;');
  const aplicadas = new Set(rows.map((r) => r.nome));
  const arquivos = fs.readdirSync(MIGRATIONS_DIR).filter((f) => f.endsWith('.sql')).sort();

  for (const arquivo of arquivos) {
    if (aplicadas.has(arquivo)) continue;
    const sql = fs.readFileSync(path.join(MIGRATIONS_DIR, arquivo), 'utf8');
    await db.transaction(async (client) => {
      await client.query(sql);
      await client.query('INSERT INTO schema_migrations (nome) VALUES ($1);', [arquivo]);
    });
    console.log(`[migrate] aplicada: ${arquivo}`);
  }

  await garantirAdministrador();
}

async function garantirAdministrador() {
  const { rows } = await db.query('SELECT COUNT(*)::int AS total FROM usuarios;');
  if (rows[0].total > 0) return;
  const email = process.env.ADMIN_EMAIL || 'admin@topsis.local';
  const hash = await bcrypt.hash(process.env.ADMIN_PASSWORD || 'admin123', 10);
  await db.query(
    "INSERT INTO usuarios (nome, email, senha_hash, perfil) VALUES ($1, $2, $3, 'admin');",
    ['Administrador', email.toLowerCase(), hash]
  );
  console.log(`[migrate] usuário administrador criado: ${email}`);
}

module.exports = { migrar };
