import React, { useState } from 'react';
import { Zap, Activity, Award, BarChart3, Sliders, ShieldAlert } from 'lucide-react';

// 1. Dados Iniciais de Exemplo (Capítulo 7.3 do Roteiro)
const CRITERIOS_INICIAIS = [
  { id: 'c1', nome: 'C1 - % Sem Energia', tipo: 'custo', peso: 0.20, unidade: '%' },
  { id: 'c2', nome: 'C2 - Solar (kW/hab)', tipo: 'beneficio', peso: 0.20, unidade: 'kW' },
  { id: 'c3', nome: 'C3 - Renda per Capita', tipo: 'beneficio', peso: 0.15, unidade: 'R$' },
  { id: 'c4', nome: 'C4 - Tarifa Média', tipo: 'custo', peso: 0.25, unidade: 'R$/kWh' },
  { id: 'c5', nome: 'C5 - Irradiação Solar', tipo: 'beneficio', peso: 0.20, unidade: 'kWh/m²' },
];

const MUNICIPIOS_INICIAIS = [
  { id: 1, nome: 'Município A', c1: 15, c2: 0.8, c3: 980, c4: 0.75, c5: 5.2 },
  { id: 2, nome: 'Município B', c1: 5, c2: 2.1, c3: 1850, c4: 0.62, c5: 5.8 },
  { id: 3, nome: 'Município C', c1: 22, c2: 0.3, c3: 650, c4: 0.89, c5: 4.9 },
];

export default function App() {
  const [criterios, setCriterios] = useState(CRITERIOS_INICIAIS);
  const [municipios] = useState(MUNICIPIOS_INICIAIS);

  // 2. Função de Cálculo Matemático do TOPSIS
  const calcularTOPSIS = () => {
    const keys = ['c1', 'c2', 'c3', 'c4', 'c5'];

    // Passo 2.1: Norma Vetorial para cada coluna
    const normas = {};
    keys.forEach((key) => {
      const somaQuadrados = municipios.reduce((sum, m) => sum + Math.pow(m[key], 2), 0);
      normas[key] = Math.sqrt(somaQuadrados);
    });

    // Passo 2.2: Matriz Normalizada e Ponderada
    const ponderada = municipios.map((m) => {
      const p = { ...m };
      keys.forEach((key, idx) => {
        const norm = normas[key] || 1;
        const peso = criterios[idx].peso;
        p[key] = (m[key] / norm) * peso;
      });
      return p;
    });

    // Passo 2.3: Soluções Ideais Positiva (A+) e Negativa (A-)
    const aPlus = {};
    const aMinus = {};
    keys.forEach((key, idx) => {
      const valores = ponderada.map((p) => p[key]);
      const tipo = criterios[idx].tipo;

      if (tipo === 'beneficio') {
        aPlus[key] = Math.max(...valores);
        aMinus[key] = Math.min(...valores);
      } else {
        aPlus[key] = Math.min(...valores);
        aMinus[key] = Math.max(...valores);
      }
    });

    // Passo 2.4: Distâncias Euclidianas e Coeficiente Ci
    const resultados = ponderada.map((mOriginal, idx) => {
      const p = ponderada[idx];

      const dPlus = Math.sqrt(
        keys.reduce((sum, key) => sum + Math.pow(p[key] - aPlus[key], 2), 0)
      );

      const dMinus = Math.sqrt(
        keys.reduce((sum, key) => sum + Math.pow(p[key] - aMinus[key], 2), 0)
      );

      const ci = dMinus / (dPlus + dMinus);

      return {
        ...municipios[idx],
        dPlus,
        dMinus,
        ci,
      };
    });

    // Ordenar do maior Ci para o menor (Mais prioritário / Mais vulnerável)
    return resultados.sort((a, b) => b.ci - a.ci);
  };

  const ranking = calcularTOPSIS();

  // Atualizar peso dos critérios via slider
  const handlePesoChange = (index, novoPeso) => {
    const novosCriterios = [...criterios];
    novosCriterios[index].peso = parseFloat(novoPeso);
    setCriterios(novosCriterios);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 p-6 font-sans">
      {/* Cabeçalho */}
      <header className="max-w-6xl mx-auto mb-8 border-b border-slate-800 pb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl">
            <Zap className="w-8 h-8 text-amber-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white">
              Plataforma de Energia Renovável
            </h1>
            <p className="text-sm text-slate-400">
              Análise Multicritério de Vulnerabilidade Social Energética (TOPSIS)
            </p>
          </div>
        </div>
        <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full text-xs font-semibold">
          ODS 7 — Energia Limpa
        </span>
      </header>

      <main className="max-w-6xl mx-auto space-y-8">
        {/* Painel Superior: Ajuste de Pesos */}
        <section className="bg-slate-800/60 border border-slate-700/60 rounded-2xl p-6 backdrop-blur">
          <div className="flex items-center gap-2 mb-4">
            <Sliders className="w-5 h-5 text-amber-400" />
            <h2 className="text-lg font-semibold text-white">
              Configuração de Pesos dos Critérios
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {criterios.map((crit, idx) => (
              <div key={crit.id} className="bg-slate-900/60 p-4 rounded-xl border border-slate-800">
                <div className="flex justify-between text-xs mb-2">
                  <span className="font-medium text-slate-300">{crit.nome}</span>
                  <span className="text-amber-400 font-bold">{crit.peso.toFixed(2)}</span>
                </div>
                <input
                  type="range"
                  min="0.05"
                  max="0.50"
                  step="0.05"
                  value={crit.peso}
                  onChange={(e) => handlePesoChange(idx, e.target.value)}
                  className="w-full accent-amber-400 cursor-pointer"
                />
                <span className={`text-[10px] uppercase font-bold mt-2 inline-block px-2 py-0.5 rounded ${
                  crit.tipo === 'custo' ? 'bg-rose-500/10 text-rose-400' : 'bg-emerald-500/10 text-emerald-400'
                }`}>
                  {crit.tipo}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* Tabela de Resultados / Ranking TOPSIS */}
        <section className="bg-slate-800/60 border border-slate-700/60 rounded-2xl p-6 backdrop-blur">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5 text-amber-400" />
              <h2 className="text-lg font-semibold text-white">
                Ranking de Vulnerabilidade (TOPSIS)
              </h2>
            </div>
            <span className="text-xs text-slate-400">
              Maior C<sub>i</sub> = Menor Vulnerabilidade
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-700 text-xs text-slate-400 uppercase tracking-wider">
                  <th className="p-3">Posição</th>
                  <th className="p-3">Município</th>
                  <th className="p-3">C1 (% Sem Energia)</th>
                  <th className="p-3">C2 (Solar kW/h)</th>
                  <th className="p-3">C3 (Renda)</th>
                  <th className="p-3">C4 (Tarifa)</th>
                  <th className="p-3">C5 (Irradiação)</th>
                  <th className="p-3 text-right">Índice C<sub>i</sub></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-sm">
                {ranking.map((m, index) => (
                  <tr key={m.id} className="hover:bg-slate-700/30 transition-colors">
                    <td className="p-3 font-bold">
                      <span className={`inline-flex items-center justify-center w-7 h-7 rounded-lg text-xs ${
                        index === 0
                          ? 'bg-amber-400 text-slate-900 font-extrabold'
                          : 'bg-slate-800 text-slate-300'
                      }`}>
                        #{index + 1}
                      </span>
                    </td>
                    <td className="p-3 font-semibold text-white">{m.nome}</td>
                    <td className="p-3 text-slate-300">{m.c1}%</td>
                    <td className="p-3 text-slate-300">{m.c2} kW</td>
                    <td className="p-3 text-slate-300">R$ {m.c3}</td>
                    <td className="p-3 text-slate-300">R$ {m.c4}</td>
                    <td className="p-3 text-slate-300">{m.c5}</td>
                    <td className="p-3 text-right font-mono font-bold text-amber-400 text-base">
                      {m.ci.toFixed(4)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
}