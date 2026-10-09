const { topsis, calcularDetalhado, normalizar } = require('../../src/services/topsis/topsis.engine');

const MATRIZ_7_3 = [
  [15, 0.8, 980, 0.75, 5.2],
  [5, 2.1, 1850, 0.62, 5.8],
  [22, 0.3, 650, 0.89, 4.9],
];
const PESOS_7_3 = [0.2, 0.2, 0.15, 0.25, 0.2];
const TIPOS_7_3 = ['custo', 'beneficio', 'beneficio', 'custo', 'beneficio'];

describe('TOPSIS Service (exemplos do roteiro)', () => {
  test('Ci deve estar entre 0 e 1', () => {
    const resultado = topsis(MATRIZ_7_3, PESOS_7_3, TIPOS_7_3);
    resultado.forEach((r) => {
      expect(r.ci).toBeGreaterThanOrEqual(0);
      expect(r.ci).toBeLessThanOrEqual(1);
    });
  });

  test('exemplo 7.3: ranking esperado B > A > C', () => {
    const ranking = topsis(MATRIZ_7_3, PESOS_7_3, TIPOS_7_3);
    expect(ranking.map((r) => r.indice)).toEqual([1, 0, 2]);
    expect(ranking.map((r) => r.posicao)).toEqual([1, 2, 3]);
  });

  test('exemplo 7.3: valores conferem com o cálculo manual (planilha)', () => {
    const { ranking, aPlus, aMinus } = calcularDetalhado(MATRIZ_7_3, PESOS_7_3, TIPOS_7_3);
    const porIndice = Object.fromEntries(ranking.map((r) => [r.indice, r]));
    expect(porIndice[1].ci).toBeCloseTo(1, 10);
    expect(porIndice[1].dPlus).toBeCloseTo(0, 10);
    expect(porIndice[2].ci).toBeCloseTo(0, 10);
    expect(porIndice[0].ci).toBeCloseTo(0.336058, 5);
    expect(porIndice[0].dPlus).toBeCloseTo(0.151403, 5);
    expect(porIndice[0].dMinus).toBeCloseTo(0.076633, 5);
    expect(aPlus[0]).toBeLessThan(aMinus[0]);
    expect(aPlus[1]).toBeGreaterThan(aMinus[1]);
  });
});

describe('Passos do algoritmo', () => {
  test('normalizar matriz: cada coluna tem norma euclidiana 1', () => {
    const r = normalizar(MATRIZ_7_3);
    for (let j = 0; j < 5; j++) {
      const norma = Math.sqrt(r.reduce((s, linha) => s + linha[j] ** 2, 0));
      expect(norma).toBeCloseTo(1);
    }
    r.flat().forEach((v) => {
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThanOrEqual(1);
    });
  });

  test('normalizar trata coluna de zeros sem dividir por zero', () => {
    const r = normalizar([[0, 1], [0, 1]]);
    expect(r.map((l) => l[0])).toEqual([0, 0]);
    r.forEach((l) => expect(l[1]).toBeCloseTo(Math.SQRT1_2, 12));
  });

  test('pesos são normalizados e as soluções ideais respeitam o tipo do critério', () => {
    const r = calcularDetalhado([[1, 10], [3, 5]], [2, 2], ['beneficio', 'custo']);
    expect(r.pesosNormalizados).toEqual([0.5, 0.5]);
    expect(r.aPlus[0]).toBeGreaterThan(r.aMinus[0]);
    expect(r.aPlus[1]).toBeLessThan(r.aMinus[1]);
  });

  test('alternativas idênticas recebem Ci = 0 e ordem estável', () => {
    const ranking = topsis([[1, 1], [1, 1]], [0.5, 0.5], ['beneficio', 'custo']);
    expect(ranking.map((r) => r.ci)).toEqual([0, 0]);
    expect(ranking.map((r) => r.indice)).toEqual([0, 1]);
  });

  test('escalar os pesos não altera o resultado', () => {
    const a = topsis(MATRIZ_7_3, PESOS_7_3, TIPOS_7_3);
    const b = topsis(MATRIZ_7_3, PESOS_7_3.map((w) => w * 4), TIPOS_7_3);
    a.forEach((r, i) => expect(b[i].ci).toBeCloseTo(r.ci, 12));
  });
});

describe('Validação de entrada', () => {
  test.each([
    ['matriz vazia', [], [1], ['beneficio'], /ao menos uma alternativa/],
    ['pesos diferentes das colunas', [[1, 2]], [0.5], ['beneficio'], /quantidade de pesos/],
    ['soma zero', [[1, 2]], [0, 0], ['beneficio', 'custo'], /maior que zero/],
  ])('%s', (_, matriz, pesos, tipos, erro) => {
    expect(() => topsis(matriz, pesos, tipos)).toThrow(erro);
  });
});
