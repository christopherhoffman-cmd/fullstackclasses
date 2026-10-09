const SimulacaoModel = require('../models/simulacao.model');
const AppError = require('../utils/AppError');
const { idValido } = require('../utils/validacao');

function faixaVulnerabilidade(ci) {
  if (ci >= 0.66) return 'Baixa';
  if (ci >= 0.33) return 'Média';
  return 'Alta';
}

function formatar(simulacao) {
  const parametros = simulacao.parametros || {};
  const valores = parametros.valores || {};
  const ranking = simulacao.ranking.map((r) => ({
    ...r,
    faixa: faixaVulnerabilidade(r.ci),
    valores: valores[r.municipio_id] || {},
  }));
  const somaCi = ranking.reduce((s, r) => s + r.ci, 0);

  return {
    simulacao_id: simulacao.id,
    data_execucao: simulacao.data_execucao,
    descricao: simulacao.descricao,
    usuario_nome: simulacao.usuario_nome,
    ranking,
    metadata: {
      criterios: parametros.criterios || [],
      total_alternativas: ranking.length,
      media_ci: ranking.length ? somaCi / ranking.length : 0,
      solucao_ideal_positiva: parametros.solucao_ideal_positiva || {},
      solucao_ideal_negativa: parametros.solucao_ideal_negativa || {},
    },
  };
}

class SimulacaoService {
  static async listar(limite) {
    const n = Math.min(Math.max(Number(limite) || 50, 1), 500);
    return SimulacaoModel.listar({ limite: n });
  }

  static async obter(id) {
    const simulacao = await SimulacaoModel.buscarPorId(idValido(id));
    if (!simulacao) throw new AppError('Simulação não encontrada.', 404);
    return formatar(simulacao);
  }

  static async obterUltima() {
    const id = await SimulacaoModel.buscarUltimaId();
    return id ? SimulacaoService.obter(id) : null;
  }

  static async remover(id) {
    const removida = await SimulacaoModel.remover(idValido(id));
    if (!removida) throw new AppError('Simulação não encontrada.', 404);
  }
}

module.exports = SimulacaoService;
module.exports.formatar = formatar;
module.exports.faixaVulnerabilidade = faixaVulnerabilidade;
