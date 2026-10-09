// TOPSIS: normalizar -> ponderar -> ideais A+/A- -> distâncias -> Ci -> ranking.
const soma = (v) => v.reduce((s, x) => s + x, 0);
const coluna = (m, j) => m.map((linha) => linha[j]);

function normalizar(matriz) {
  const normas = matriz[0].map((_, j) => Math.sqrt(soma(coluna(matriz, j).map((x) => x * x))));
  return matriz.map((linha) => linha.map((x, j) => (normas[j] === 0 ? 0 : x / normas[j])));
}

function calcularDetalhado(matriz, pesos, tipos) {
  if (!matriz.length) throw new Error('A matriz de decisão deve conter ao menos uma alternativa.');
  if (pesos.length !== matriz[0].length) throw new Error('A quantidade de pesos deve ser igual à de critérios.');
  if (soma(pesos) <= 0) throw new Error('A soma dos pesos deve ser maior que zero.');

  const pesosNormalizados = pesos.map((w) => w / soma(pesos));
  const normalizada = normalizar(matriz);
  const ponderada = normalizada.map((linha) => linha.map((r, j) => r * pesosNormalizados[j]));

  // Ideal positivo: melhor valor de cada coluna (máximo p/ benefício, mínimo p/ custo); negativo é o oposto.
  const aPlus = tipos.map((t, j) => Math[t === 'beneficio' ? 'max' : 'min'](...coluna(ponderada, j)));
  const aMinus = tipos.map((t, j) => Math[t === 'beneficio' ? 'min' : 'max'](...coluna(ponderada, j)));

  const distancia = (linha, ref) => Math.sqrt(soma(linha.map((v, j) => (v - ref[j]) ** 2)));
  const ranking = ponderada
    .map((linha, indice) => {
      const dPlus = distancia(linha, aPlus);
      const dMinus = distancia(linha, aMinus);
      const ci = dPlus + dMinus === 0 ? 0 : dMinus / (dPlus + dMinus);
      return { indice, ci, dPlus, dMinus };
    })
    .sort((a, b) => b.ci - a.ci || a.indice - b.indice) // desempate estável pelo índice
    .map((item, i) => ({ ...item, posicao: i + 1 }));

  return { pesosNormalizados, normalizada, ponderada, aPlus, aMinus, ranking };
}

const topsis = (matriz, pesos, tipos) => calcularDetalhado(matriz, pesos, tipos).ranking;

module.exports = { topsis, calcularDetalhado, normalizar };
