INSERT INTO criterios (codigo, nome, descricao, tipo, peso, unidade, fonte)
SELECT v.codigo, v.nome, v.descricao, v.tipo, v.peso, v.unidade, v.fonte
FROM (VALUES
    ('C1', 'C1 - % sem eletricidade', 'Percentual de domicílios sem acesso à eletricidade', 'custo', 0.2000, '%', 'IBGE'),
    ('C2', 'C2 - Capacidade Solar', 'Capacidade instalada solar por habitante', 'beneficio', 0.2000, 'kW/hab', 'ANEEL'),
    ('C3', 'C3 - Renda per capita', 'Renda média mensal por habitante', 'beneficio', 0.1500, 'R$', 'IBGE'),
    ('C4', 'C4 - Tarifa de energia', 'Tarifa média de energia elétrica', 'custo', 0.2500, 'R$/kWh', 'ANEEL'),
    ('C5', 'C5 - Irradiação solar', 'Índice médio de irradiação solar diária', 'beneficio', 0.2000, 'kWh/m²/dia', 'INPE'),
    ('C6', 'C6 - % extrema pobreza', 'Percentual da população em extrema pobreza', 'custo', 0.0000, '%', 'IBGE'),
    ('C7', 'C7 - Projetos renováveis', 'Número de projetos de energia renovável ativos', 'beneficio', 0.0000, 'projetos', 'ANEEL')
) AS v(codigo, nome, descricao, tipo, peso, unidade, fonte)
WHERE NOT EXISTS (SELECT 1 FROM criterios c WHERE c.codigo = v.codigo);

INSERT INTO municipios (nome, uf, codigo_ibge, populacao, idh, latitude, longitude)
SELECT v.nome, v.uf, v.codigo_ibge, v.populacao, v.idh, v.latitude, v.longitude
FROM (VALUES
    ('Município A', 'BA', NULL::INTEGER, 45000, 0.680, -12.9714, -38.5014),
    ('Município B', 'BA', NULL, 120000, 0.745, -12.2667, -38.9667),
    ('Município C', 'BA', NULL, 28000, 0.612, -12.6800, -39.1000),
    ('Juazeiro', 'BA', 2918407, 237821, 0.677, -9.4116, -40.4986),
    ('Vitória da Conquista', 'BA', 2933307, 370868, 0.678, -14.8615, -40.8442),
    ('Barreiras', 'BA', 2903201, 159743, 0.721, -12.1439, -44.9968),
    ('Irecê', 'BA', 2914604, 68207, 0.691, -11.3033, -41.8535),
    ('Jequié', 'BA', 2918001, 158813, 0.665, -13.8575, -40.0836),
    ('Paulo Afonso', 'BA', 2924009, 112870, 0.674, -9.4062, -38.2144),
    ('Ilhéus', 'BA', 2913606, 178649, 0.690, -14.7935, -39.0464),
    ('Bom Jesus da Lapa', 'BA', 2903904, 65550, 0.633, -13.2506, -43.4108),
    ('Teixeira de Freitas', 'BA', 2931350, 145216, 0.685, -17.5399, -39.7400),
    ('Xique-Xique', 'BA', 2933604, 45536, 0.585, -10.8230, -42.7245)
) AS v(nome, uf, codigo_ibge, populacao, idh, latitude, longitude)
WHERE NOT EXISTS (SELECT 1 FROM municipios m WHERE m.nome = v.nome AND m.uf = v.uf);

INSERT INTO matriz_decisao (municipio_id, criterio_id, valor)
SELECT m.id, c.id, v.valor
FROM (VALUES
    ('Município A', 'C1', 15.0), ('Município A', 'C2', 0.8), ('Município A', 'C3', 980.0),
    ('Município A', 'C4', 0.75), ('Município A', 'C5', 5.2), ('Município A', 'C6', 12.5), ('Município A', 'C7', 4),
    ('Município B', 'C1', 5.0), ('Município B', 'C2', 2.1), ('Município B', 'C3', 1850.0),
    ('Município B', 'C4', 0.62), ('Município B', 'C5', 5.8), ('Município B', 'C6', 6.8), ('Município B', 'C7', 11),
    ('Município C', 'C1', 22.0), ('Município C', 'C2', 0.3), ('Município C', 'C3', 650.0),
    ('Município C', 'C4', 0.89), ('Município C', 'C5', 4.9), ('Município C', 'C6', 18.2), ('Município C', 'C7', 1),
    ('Juazeiro', 'C1', 4.2), ('Juazeiro', 'C2', 1.9), ('Juazeiro', 'C3', 1120), ('Juazeiro', 'C4', 0.71),
    ('Juazeiro', 'C5', 6.1), ('Juazeiro', 'C6', 10.4), ('Juazeiro', 'C7', 14),
    ('Vitória da Conquista', 'C1', 3.1), ('Vitória da Conquista', 'C2', 1.2), ('Vitória da Conquista', 'C3', 1340),
    ('Vitória da Conquista', 'C4', 0.69), ('Vitória da Conquista', 'C5', 5.3), ('Vitória da Conquista', 'C6', 8.9),
    ('Vitória da Conquista', 'C7', 9),
    ('Barreiras', 'C1', 3.8), ('Barreiras', 'C2', 2.4), ('Barreiras', 'C3', 1480), ('Barreiras', 'C4', 0.66),
    ('Barreiras', 'C5', 5.9), ('Barreiras', 'C6', 7.5), ('Barreiras', 'C7', 12),
    ('Irecê', 'C1', 8.5), ('Irecê', 'C2', 1.1), ('Irecê', 'C3', 890), ('Irecê', 'C4', 0.78),
    ('Irecê', 'C5', 6.0), ('Irecê', 'C6', 14.3), ('Irecê', 'C7', 6),
    ('Jequié', 'C1', 7.2), ('Jequié', 'C2', 0.6), ('Jequié', 'C3', 910), ('Jequié', 'C4', 0.80),
    ('Jequié', 'C5', 5.4), ('Jequié', 'C6', 13.8), ('Jequié', 'C7', 3),
    ('Paulo Afonso', 'C1', 5.5), ('Paulo Afonso', 'C2', 1.4), ('Paulo Afonso', 'C3', 1210), ('Paulo Afonso', 'C4', 0.70),
    ('Paulo Afonso', 'C5', 5.9), ('Paulo Afonso', 'C6', 9.7), ('Paulo Afonso', 'C7', 8),
    ('Ilhéus', 'C1', 9.8), ('Ilhéus', 'C2', 0.5), ('Ilhéus', 'C3', 1050), ('Ilhéus', 'C4', 0.82),
    ('Ilhéus', 'C5', 5.0), ('Ilhéus', 'C6', 15.1), ('Ilhéus', 'C7', 2),
    ('Bom Jesus da Lapa', 'C1', 12.4), ('Bom Jesus da Lapa', 'C2', 1.6), ('Bom Jesus da Lapa', 'C3', 760),
    ('Bom Jesus da Lapa', 'C4', 0.84), ('Bom Jesus da Lapa', 'C5', 6.0), ('Bom Jesus da Lapa', 'C6', 17.6),
    ('Bom Jesus da Lapa', 'C7', 7),
    ('Teixeira de Freitas', 'C1', 6.3), ('Teixeira de Freitas', 'C2', 0.7), ('Teixeira de Freitas', 'C3', 1180),
    ('Teixeira de Freitas', 'C4', 0.77), ('Teixeira de Freitas', 'C5', 5.1), ('Teixeira de Freitas', 'C6', 11.2),
    ('Teixeira de Freitas', 'C7', 3),
    ('Xique-Xique', 'C1', 18.6), ('Xique-Xique', 'C2', 0.9), ('Xique-Xique', 'C3', 640), ('Xique-Xique', 'C4', 0.88),
    ('Xique-Xique', 'C5', 6.1), ('Xique-Xique', 'C6', 21.4), ('Xique-Xique', 'C7', 2)
) AS v(municipio, codigo, valor)
JOIN municipios m ON m.nome = v.municipio AND m.uf = 'BA'
JOIN criterios c ON c.codigo = v.codigo
ON CONFLICT (municipio_id, criterio_id) DO NOTHING;
