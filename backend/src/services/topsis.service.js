const SimulacaoModel = require('../models/simulacao.model');
const CriterioModel = require('../models/criterio.model');
const MunicipioModel = require('../models/municipio.model');
const MatrizModel = require('../models/matriz.model');
const SimulacaoService = require('./simulacao.service');
const engine = require('./topsis/topsis.engine');
const AppError = require('../utils/AppError');
const { numeroOuNulo, idValido } = require('../utils/validacao');

function selecionarCriterios(todos, criteriosReq) {
  let selecionados;
  if (Array.isArray(criteriosReq) && criteriosReq.length) {
    selecionados = criteriosReq.map((c) => {
      const id = idValido(c.id);
      const base = todos.find((t) => t.id === id);
      if (!base) throw new AppError(`Critério ${id} não encontrado.`, 422);
      const peso = c.peso === undefined ? base.peso : numeroOuNulo(c.peso, 'peso');
      if (peso === null || peso < 0) throw new AppError('Os pesos devem ser números não negativos.', 422);
      return { ...base, tipo: c.tipo === 'custo' || c.tipo === 'beneficio' ? c.tipo : base.tipo, peso };
    });
  } else {
    selecionados = todos.map((c) => ({ ...c }));
  }
  selecionados = selecionados.filter((c) => c.peso > 0);
  if (selecionados.length === 0) throw new AppError('Selecione ao menos um critério com peso maior que zero.', 422);
  return selecionados;
}

class TopsisService {
  static async executarAnalise(entrada = {}, usuario) {
    const municipioIds = Array.isArray(entrada.municipios) ? entrada.municipios.map(idValido) : null;

    const [todosCriterios, todosMunicipios, valores] = await Promise.all([
      CriterioModel.buscarTodos(),
      MunicipioModel.buscarTodos(),
      MatrizModel.buscarValores(),
    ]);
    const criterios = selecionarCriterios(todosCriterios, entrada.criterios);

    const valoresPorMunicipio = {};
    valores.forEach((v) => {
      (valoresPorMunicipio[v.municipio_id] ||= {})[v.criterio_id] = v.valor;
    });

    const candidatos = municipioIds
      ? todosMunicipios.filter((m) => municipioIds.includes(m.id))
      : todosMunicipios;

    const alternativas = [];
    candidatos.forEach((m) => {
      const vals = valoresPorMunicipio[m.id] || {};
      const completo = criterios.every((c) => vals[c.id] !== undefined && vals[c.id] !== null);
      if (completo) alternativas.push({ ...m, valores: vals });
    });

    if (alternativas.length < 2) {
      throw new AppError('São necessários ao menos 2 municípios com todos os valores dos critérios selecionados.', 422);
    }

    const matriz = alternativas.map((a) => criterios.map((c) => a.valores[c.id]));
    if (!matriz.flat().every(Number.isFinite)) throw new AppError('A matriz contém valores não numéricos.', 422);
    let resultado;
    try {
      resultado = engine.calcularDetalhado(
        matriz,
        criterios.map((c) => c.peso),
        criterios.map((c) => c.tipo)
      );
    } catch (error) {
      throw new AppError(error.message, 422);
    }

    const ranking = resultado.ranking.map((r) => ({
      municipio_id: alternativas[r.indice].id,
      ci: r.ci,
      dPlus: r.dPlus,
      dMinus: r.dMinus,
      posicao: r.posicao,
    }));

    const porCriterio = (vetor) => Object.fromEntries(criterios.map((c, j) => [c.id, vetor[j]]));
    const parametros = {
      criterios: criterios.map((c, j) => ({
        id: c.id,
        codigo: c.codigo,
        nome: c.nome,
        tipo: c.tipo,
        unidade: c.unidade,
        peso: c.peso,
        peso_normalizado: resultado.pesosNormalizados[j],
      })),
      municipios: alternativas.map((a) => a.id),
      valores: Object.fromEntries(
        alternativas.map((a) => [a.id, Object.fromEntries(criterios.map((c) => [c.id, a.valores[c.id]]))])
      ),
      solucao_ideal_positiva: porCriterio(resultado.aPlus),
      solucao_ideal_negativa: porCriterio(resultado.aMinus),
    };

    const salva = await SimulacaoModel.salvarSimulacao(
      { parametros, descricao: entrada.descricao?.toString().slice(0, 200), usuarioId: usuario?.id },
      ranking
    );

    return SimulacaoService.obter(salva.id);
  }
}

module.exports = TopsisService;
