const PDFDocument = require('pdfkit');
const SimulacaoService = require('./simulacao.service');

const fmt = (n, casas = 4) => (n === null || n === undefined ? '' : Number(n).toFixed(casas));
const dataBR = (d) => new Date(d).toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' });

function campoCsv(valor) {
  const s = valor === null || valor === undefined ? '' : String(valor);
  return /[;"\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

class RelatorioService {
  static async gerarCsv(id) {
    const sim = await SimulacaoService.obter(id);
    const criterios = sim.metadata.criterios;
    const cabecalho = [
      'posicao', 'municipio', 'uf', 'ci', 'distancia_positiva', 'distancia_negativa', 'vulnerabilidade',
      ...criterios.map((c) => `${c.codigo || c.nome}${c.unidade ? ` (${c.unidade})` : ''}`),
    ];
    const linhas = sim.ranking.map((r) => [
      r.posicao, r.nome, r.uf, fmt(r.ci, 6), fmt(r.dPlus, 6), fmt(r.dMinus, 6), r.faixa,
      ...criterios.map((c) => r.valores[c.id]),
    ]);
    const conteudo = [cabecalho, ...linhas].map((l) => l.map(campoCsv).join(';')).join('\r\n');
    return { nomeArquivo: `simulacao-${sim.simulacao_id}.csv`, conteudo: `﻿${conteudo}\r\n` };
  }

  static async gerarPdf(id) {
    const sim = await SimulacaoService.obter(id);
    const doc = new PDFDocument({ size: 'A4', margin: 40, info: { Title: `Simulação TOPSIS #${sim.simulacao_id}` } });
    const partes = [];
    doc.on('data', (p) => partes.push(p));
    const fim = new Promise((resolve) => doc.on('end', resolve));

    doc.fontSize(16).text('Relatório TOPSIS - Energia Renovável');
    doc.moveDown().fontSize(10);
    doc.text(`Simulação #${sim.simulacao_id} - ${dataBR(sim.data_execucao)}`);
    doc.text(`Responsável: ${sim.usuario_nome || '-'}`);
    if (sim.descricao) doc.text(`Descrição: ${sim.descricao}`);
    doc.text(`Alternativas: ${sim.metadata.total_alternativas} - Média Ci: ${fmt(sim.metadata.media_ci)}`);

    doc.moveDown().fontSize(12).text('Critérios e pesos');
    doc.fontSize(10);
    sim.metadata.criterios.forEach((c) => {
      doc.text(`${c.codigo || ''} ${c.nome} (${c.tipo === 'custo' ? 'custo' : 'benefício'}) - peso ${fmt(c.peso, 3)}`);
    });

    doc.moveDown().fontSize(12).text('Ranking (maior Ci = menor vulnerabilidade)');
    doc.fontSize(10);
    sim.ranking.forEach((r) => {
      doc.text(`${r.posicao}. ${r.nome}/${r.uf} - Ci ${fmt(r.ci)} - D+ ${fmt(r.dPlus)} - D- ${fmt(r.dMinus)} - ${r.faixa}`);
    });

    doc.end();
    await fim;
    return { nomeArquivo: `simulacao-${sim.simulacao_id}.pdf`, conteudo: Buffer.concat(partes) };
  }
}

module.exports = RelatorioService;
module.exports.campoCsv = campoCsv;
