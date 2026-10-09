const SimulacaoModel = require('../models/simulacao.model.js');
const CriterioModel = require('../models/criterio.model.js');

class TopsisService {
  /**
   * Executa o algoritmo TOPSIS
   * @param {Array} dadosEntrada - Matriz contendo alternativas e critérios
   * @param {Array} pesosCustomizados - Pesos informados na requisição (opcional)
   */
  static async executarAnalise(pesosCustomizados = null) {
    // 1. Obter critérios e matriz de decisão do banco de dados
    const criterios = await CriterioModel.buscarTodos();
    const matrizBruta = await SimulacaoModel.buscarMatrizDecisao();

    // Sobrescrever pesos se fornecidos pelo frontend
    if (pesosCustomizados && Array.isArray(pesosCustomizados)) {
      pesosCustomizados.forEach((pc) => {
        const crit = criterios.find((c) => c.id === pc.id);
        if (crit) crit.peso = parseFloat(pc.peso);
      });
    }

    // Estruturar dados por município
    const municipiosMap = {};
    matrizBruta.forEach((row) => {
      if (!municipiosMap[row.municipio_id]) {
        municipiosMap[row.municipio_id] = {
          municipio_id: row.municipio_id,
          nome: row.municipio_nome,
          valores: {},
        };
      }
      municipiosMap[row.municipio_id].valores[row.criterio_id] = parseFloat(row.valor);
    });

    const municipios = Object.values(municipiosMap);
    const criterioIds = criterios.map((c) => c.id);

    // Passo A: Normalização Vetorial -> r_ij = x_ij / sqrt(sum(x_ij^2))
    const normas = {};
    criterioIds.forEach((cId) => {
      const somaQuadrados = municipios.reduce(
        (sum, m) => sum + Math.pow(m.valores[cId] || 0, 2),
        0
      );
      normas[cId] = Math.sqrt(somaQuadrados) || 1;
    });

    // Passo B: Matriz Ponderada -> v_ij = w_j * r_ij
    const ponderada = municipios.map((m) => {
      const v = {};
      criterioIds.forEach((cId) => {
        const crit = criterios.find((c) => c.id === cId);
        v[cId] = ((m.valores[cId] || 0) / normas[cId]) * crit.peso;
      });
      return { ...m, ponderada: v };
    });

    // Passo C: Solução Ideal Positiva (A+) e Negativa (A-)
    const aPlus = {};
    const aMinus = {};
    criterios.forEach((crit) => {
      const valoresCol = ponderada.map((p) => p.ponderada[crit.id]);
      if (crit.tipo === 'beneficio') {
        aPlus[crit.id] = Math.max(...valoresCol);
        aMinus[crit.id] = Math.min(...valoresCol);
      } else {
        aPlus[crit.id] = Math.min(...valoresCol);
        aMinus[crit.id] = Math.max(...valoresCol);
      }
    });

    // Passo D: Distâncias Euclidianas e Coeficiente de Proximidade (Ci)
    const resultados = ponderada.map((p) => {
      const dPlus = Math.sqrt(
        criterioIds.reduce((sum, cId) => sum + Math.pow(p.ponderada[cId] - aPlus[cId], 2), 0)
      );

      const dMinus = Math.sqrt(
        criterioIds.reduce((sum, cId) => sum + Math.pow(p.ponderada[cId] - aMinus[cId], 2), 0)
      );

      const ci = dPlus + dMinus === 0 ? 0 : dMinus / (dPlus + dMinus);

      return {
        municipio_id: p.municipio_id,
        nome: p.nome,
        dPlus,
        dMinus,
        ci,
      };
    });

    // Ordenação do Ranking (Maior Ci = Menos Vulnerável / Melhor Posição)
    resultados.sort((a, b) => b.ci - a.ci);
    resultados.forEach((item, index) => {
      item.posicao = index + 1;
    });

    // Persistir resultado da simulação no banco
    const simulacaoSalva = await SimulacaoModel.salvarSimulacao(
      { pesos: criterios.map((c) => ({ id: c.id, peso: c.peso })) },
      resultados
    );

    return {
      simulacao_id: simulacaoSalva.id,
      ranking: resultados,
    };
  }
}

module.exports = TopsisService;