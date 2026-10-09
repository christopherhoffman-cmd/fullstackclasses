const AppError = require('../../src/utils/AppError');
const { numeroOuNulo, idValido } = require('../../src/utils/validacao');
const { validarDados: validarMunicipio } = require('../../src/services/municipio.service');
const { parseCsv } = require('../../src/services/importacao.service');
const { campoCsv } = require('../../src/services/relatorio.service');
const { formatar, faixaVulnerabilidade } = require('../../src/services/simulacao.service');

describe('utils/validacao', () => {
  test('numeroOuNulo aceita vírgula decimal e vazios', () => {
    expect(numeroOuNulo('0,75', 'x')).toBe(0.75);
    expect(numeroOuNulo(3, 'x')).toBe(3);
    expect(numeroOuNulo('', 'x')).toBeNull();
    expect(numeroOuNulo(undefined, 'x')).toBeNull();
    expect(() => numeroOuNulo('abc', 'campo')).toThrow(/campo/);
  });

  test('idValido exige inteiro positivo', () => {
    expect(idValido('7')).toBe(7);
    expect(() => idValido('0')).toThrow(AppError);
    expect(() => idValido('x')).toThrow(AppError);
  });

  test('faixaVulnerabilidade usa os limites 0,33 e 0,66', () => {
    expect(faixaVulnerabilidade(0.1)).toBe('Alta');
    expect(faixaVulnerabilidade(0.33)).toBe('Média');
    expect(faixaVulnerabilidade(0.659)).toBe('Média');
    expect(faixaVulnerabilidade(0.66)).toBe('Baixa');
  });
});

describe('validação de município (UC01)', () => {
  const base = { nome: ' Salvador ', uf: 'ba', populacao: '2417678', idh: '0,759', latitude: -12.97, longitude: -38.5, codigo_ibge: '2927408' };

  test('normaliza os dados válidos', () => {
    expect(validarMunicipio(base)).toEqual({
      nome: 'Salvador', uf: 'BA', populacao: 2417678, idh: 0.759, latitude: -12.97, longitude: -38.5, codigo_ibge: 2927408,
    });
  });

  test.each([
    [{ nome: '' }, /obrigatórios/],
    [{ uf: 'XX' }, /UF inválida/],
    [{ nome: 'a'.repeat(201) }, /200 caracteres/],
    [{ populacao: -1 }, /população/],
    [{ populacao: 1.5 }, /população/],
    [{ idh: 1.2 }, /IDH/],
    [{ latitude: 91 }, /latitude/],
    [{ longitude: -181 }, /longitude/],
    [{ codigo_ibge: 123 }, /7 dígitos/],
  ])('rejeita %o', (alteracao, erro) => {
    expect(() => validarMunicipio({ ...base, ...alteracao })).toThrow(erro);
  });
});

describe('importação CSV', () => {
  test('usa separador ; e trata aspas, BOM e linhas vazias', () => {
    const linhas = parseCsv('﻿nome;uf\r\n"Santa ""Cruz""; BA";BA\r\n\r\nX;SP');
    expect(linhas).toEqual([['nome', 'uf'], ['Santa "Cruz"; BA', 'BA'], ['X', 'SP']]);
  });
});

describe('relatórios', () => {
  test('campoCsv escapa separador, aspas e quebras de linha', () => {
    expect(campoCsv('simples')).toBe('simples');
    expect(campoCsv('a;b')).toBe('"a;b"');
    expect(campoCsv('diz "oi"')).toBe('"diz ""oi"""');
    expect(campoCsv(null)).toBe('');
  });

  test('formatar simulação adiciona faixa, valores e média do Ci', () => {
    const r = formatar({
      id: 9,
      data_execucao: '2026-01-01',
      parametros: { criterios: [{ id: 1 }], valores: { 5: { 1: 10 } } },
      ranking: [
        { municipio_id: 5, ci: 0.8 },
        { municipio_id: 6, ci: 0.2 },
      ],
    });
    expect(r.simulacao_id).toBe(9);
    expect(r.ranking[0]).toMatchObject({ faixa: 'Baixa', valores: { 1: 10 } });
    expect(r.ranking[1]).toMatchObject({ faixa: 'Alta', valores: {} });
    expect(r.metadata.media_ci).toBeCloseTo(0.5);
  });
});
