-- Criação das tabelas
CREATE TABLE IF NOT EXISTS municipios (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(200) NOT NULL,
    uf CHAR(2) NOT NULL,
    populacao INTEGER,
    idh DECIMAL(4,3),
    latitude DECIMAL(10,8),
    longitude DECIMAL(11,8),
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS criterios (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(150) NOT NULL,
    descricao TEXT,
    tipo VARCHAR(10) CHECK (tipo IN ('beneficio','custo')),
    peso DECIMAL(5,4) DEFAULT 0.0,
    unidade VARCHAR(50)
);

CREATE TABLE IF NOT EXISTS matriz_decisao (
    id SERIAL PRIMARY KEY,
    municipio_id INTEGER REFERENCES municipios(id) ON DELETE CASCADE,
    criterio_id INTEGER REFERENCES criterios(id) ON DELETE CASCADE,
    valor DECIMAL(15,4) NOT NULL,
    ano_referencia INTEGER DEFAULT 2026,
    UNIQUE(municipio_id, criterio_id, ano_referencia)
);

CREATE TABLE IF NOT EXISTS simulacoes (
    id SERIAL PRIMARY KEY,
    data_execucao TIMESTAMP DEFAULT NOW(),
    parametros JSONB,
    status VARCHAR(20) DEFAULT 'concluida'
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

-- Carga inicial de dados de exemplo (Capítulo 7.3 do Roteiro)
INSERT INTO criterios (nome, descricao, tipo, peso, unidade) VALUES
('C1 - % sem eletricidade', 'Percentual de domicílios sem eletricidade', 'custo', 0.2000, '%'),
('C2 - Capacidade Solar', 'Capacidade instalada solar por habitante', 'beneficio', 0.2000, 'kW/hab'),
('C3 - Renda per capita', 'Renda média mensal por habitante', 'beneficio', 0.1500, 'R$'),
('C4 - Tarifa de energia', 'Tarifa média de energia elétrica', 'custo', 0.2500, 'R$/kWh'),
('C5 - Irradiação solar', 'Índice médio de irradiação solar diária', 'beneficio', 0.2000, 'kWh/m²')
ON CONFLICT DO NOTHING;

INSERT INTO municipios (nome, uf, populacao, idh, latitude, longitude) VALUES
('Município A', 'BA', 45000, 0.680, -12.9714, -38.5014),
('Município B', 'BA', 120000, 0.745, -12.2667, -38.9667),
('Município C', 'BA', 28000, 0.612, -13.0167, -38.5167)
ON CONFLICT DO NOTHING;

-- Matriz de Decisão Inicial
INSERT INTO matriz_decisao (municipio_id, criterio_id, valor, ano_referencia) VALUES
(1, 1, 15.0, 2026), (1, 2, 0.8, 2026), (1, 3, 980.0, 2026), (1, 4, 0.75, 2026), (1, 5, 5.2, 2026),
(2, 1, 5.0, 2026),  (2, 2, 2.1, 2026), (2, 3, 1850.0, 2026),(2, 4, 0.62, 2026), (2, 5, 5.8, 2026),
(3, 1, 22.0, 2026), (3, 2, 0.3, 2026), (3, 3, 650.0, 2026), (3, 4, 0.89, 2026), (3, 5, 4.9, 2026)
ON CONFLICT DO NOTHING;