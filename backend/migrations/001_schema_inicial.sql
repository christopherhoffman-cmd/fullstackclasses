CREATE TABLE IF NOT EXISTS usuarios (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(150) NOT NULL,
    email VARCHAR(200) NOT NULL UNIQUE,
    senha_hash VARCHAR(100) NOT NULL,
    perfil VARCHAR(20) NOT NULL DEFAULT 'pesquisador'
        CHECK (perfil IN ('admin', 'pesquisador', 'gestor')),
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS municipios (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(200) NOT NULL,
    uf CHAR(2) NOT NULL,
    populacao INTEGER,
    idh DECIMAL(4,3),
    latitude DECIMAL(10,8),
    longitude DECIMAL(11,8),
    codigo_ibge INTEGER UNIQUE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS criterios (
    id SERIAL PRIMARY KEY,
    codigo VARCHAR(10),
    nome VARCHAR(150) NOT NULL,
    descricao TEXT,
    tipo VARCHAR(10) CHECK (tipo IN ('beneficio', 'custo')),
    peso DECIMAL(5,4) DEFAULT 0.0,
    unidade VARCHAR(50),
    fonte VARCHAR(50)
);

CREATE TABLE IF NOT EXISTS matriz_decisao (
    id SERIAL PRIMARY KEY,
    municipio_id INTEGER REFERENCES municipios(id) ON DELETE CASCADE,
    criterio_id INTEGER REFERENCES criterios(id) ON DELETE CASCADE,
    valor DECIMAL(15,4) NOT NULL,
    UNIQUE (municipio_id, criterio_id)
);

CREATE TABLE IF NOT EXISTS simulacoes (
    id SERIAL PRIMARY KEY,
    data_execucao TIMESTAMP DEFAULT NOW(),
    parametros JSONB,
    usuario_id INTEGER REFERENCES usuarios(id) ON DELETE SET NULL,
    descricao VARCHAR(200)
);

CREATE TABLE IF NOT EXISTS resultados_ranking (
    id SERIAL PRIMARY KEY,
    simulacao_id INTEGER REFERENCES simulacoes(id) ON DELETE CASCADE,
    municipio_id INTEGER REFERENCES municipios(id) ON DELETE CASCADE,
    coeficiente_ci DECIMAL(10,8),
    distancia_positiva DECIMAL(10,8),
    distancia_negativa DECIMAL(10,8),
    posicao INTEGER
);

CREATE INDEX IF NOT EXISTS idx_matriz_municipio ON matriz_decisao (municipio_id);
CREATE INDEX IF NOT EXISTS idx_resultados_simulacao ON resultados_ranking (simulacao_id);
