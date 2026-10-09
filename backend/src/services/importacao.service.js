const db = require('../config/db');
const CriterioModel = require('../models/criterio.model');
const MunicipioModel = require('../models/municipio.model');
const MatrizModel = require('../models/matriz.model');
const { validarDados } = require('./municipio.service');
const AppError = require('../utils/AppError');
const { numeroOuNulo } = require('../utils/validacao');

const COLUNAS_MUNICIPIO = ['nome', 'uf', 'codigo_ibge', 'populacao', 'idh', 'latitude', 'longitude'];
const SEPARADOR = ';';

function parseCsv(texto) {
  const conteudo = String(texto || '').replace(/^﻿/, '');
  const linhas = [];
  let campo = '';
  let linha = [];
  let aspas = false;
  for (let i = 0; i < conteudo.length; i++) {
    const ch = conteudo[i];
    if (aspas) {
      if (ch === '"' && conteudo[i + 1] === '"') { campo += '"'; i++; }
      else if (ch === '"') aspas = false;
      else campo += ch;
    } else if (ch === '"') aspas = true;
    else if (ch === SEPARADOR) { linha.push(campo); campo = ''; }
    else if (ch === '\n' || ch === '\r') {
      if (ch === '\r' && conteudo[i + 1] === '\n') i++;
      linha.push(campo); campo = '';
      if (linha.some((c) => c.trim() !== '')) linhas.push(linha);
      linha = [];
    } else campo += ch;
  }
  linha.push(campo);
  if (linha.some((c) => c.trim() !== '')) linhas.push(linha);
  return linhas;
}

class ImportacaoService {
  static async modeloCsv() {
    const criterios = await CriterioModel.buscarTodos();
    const cabecalho = [...COLUNAS_MUNICIPIO, ...criterios.map((c) => c.codigo || `criterio_${c.id}`)];
    const exemplo = ['Exemplo', 'BA', '', '10000', '0,650', '-12,5', '-39,5', ...criterios.map(() => '')];
    return `﻿${cabecalho.join(';')}\r\n${exemplo.join(';')}\r\n`;
  }

  static async importarCsv(texto) {
    const linhas = parseCsv(texto);
    if (linhas.length < 2) throw new AppError('O CSV deve conter cabeçalho e ao menos uma linha de dados.', 422);

    const cabecalho = linhas[0].map((c) => c.trim());
    const indice = Object.fromEntries(cabecalho.map((c, i) => [c.toLowerCase(), i]));
    if (indice.nome === undefined || indice.uf === undefined) {
      throw new AppError('O cabeçalho deve conter ao menos as colunas "nome" e "uf".', 422);
    }

    const criterios = await CriterioModel.buscarTodos();
    const colunasCriterio = criterios
      .map((c) => {
        const chave = (c.codigo || `criterio_${c.id}`).toLowerCase();
        return indice[chave] === undefined ? null : { criterio: c, coluna: indice[chave] };
      })
      .filter(Boolean);

    const num = (v, campo) => numeroOuNulo(String(v ?? '').trim(), campo);

    const erros = [];
    const resumo = { criados: 0, atualizados: 0, valores: 0 };

    await db.transaction(async (client) => {
      for (let i = 1; i < linhas.length; i++) {
        const linha = linhas[i];
        const celula = (nome) => (indice[nome] === undefined ? '' : (linha[indice[nome]] || '').trim());
        try {
          const dados = validarDados({
            nome: celula('nome'),
            uf: celula('uf'),
            codigo_ibge: celula('codigo_ibge'),
            populacao: num(celula('populacao'), 'populacao'),
            idh: num(celula('idh'), 'idh'),
            latitude: num(celula('latitude'), 'latitude'),
            longitude: num(celula('longitude'), 'longitude'),
          });
          let id = await MunicipioModel.buscarPorCodigoIbgeOuNome(dados, client);
          if (id) {
            await MunicipioModel.atualizar(id, dados, client);
            resumo.atualizados++;
          } else {
            id = await MunicipioModel.criar(dados, client);
            resumo.criados++;
          }
          const itens = colunasCriterio
            .map(({ criterio, coluna }) => ({
              municipio_id: id,
              criterio_id: criterio.id,
              valor: num((linha[coluna] || '').trim(), criterio.codigo || criterio.nome),
            }))
            .filter((item) => item.valor !== null);
          await MatrizModel.salvarValores(itens, client);
          resumo.valores += itens.length;
        } catch (error) {
          if (!(error instanceof AppError)) throw error;
          erros.push({ linha: i + 1, erro: error.message });
        }
      }
    });

    return { ...resumo, erros, colunas_criterios: colunasCriterio.map((c) => c.criterio.codigo || c.criterio.nome) };
  }
}

module.exports = ImportacaoService;
module.exports.parseCsv = parseCsv;
