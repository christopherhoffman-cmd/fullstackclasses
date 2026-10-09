import {
  Chart as ChartJS, CategoryScale, LinearScale, BarElement, RadialLinearScale, PointElement,
  LineElement, Filler, Tooltip, Legend,
} from 'chart.js';
import { Bar, Radar } from 'react-chartjs-2';
import { FAIXAS } from '../../utils/vulnerabilidade';

ChartJS.register(CategoryScale, LinearScale, BarElement, RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend);

// Tema escuro: texto e linhas legíveis sobre o fundo.
ChartJS.defaults.color = '#94a3b8';
ChartJS.defaults.borderColor = 'rgba(71, 85, 105, 0.5)';

export function RankingBarChart({ ranking, limite }) {
  const itens = limite ? ranking.slice(0, limite) : ranking;
  const data = {
    labels: itens.map((r) => `${r.posicao}º ${r.nome}`),
    datasets: [
      {
        label: 'Coeficiente Ci',
        data: itens.map((r) => r.ci),
        backgroundColor: itens.map((r) => FAIXAS[r.faixa]?.cor),
        maxBarThickness: 22,
      },
    ],
  };
  const options = {
    indexAxis: 'y',
    maintainAspectRatio: false,
    scales: {
      x: { min: 0, max: 1, title: { display: true, text: 'Ci (maior = menos vulnerável)' } },
      y: { grid: { display: false }, ticks: { autoSkip: false } },
    },
    plugins: { legend: { display: false } },
  };
  return (
    <div style={{ height: Math.max(220, itens.length * 28 + 40) }} role="img" aria-label="Gráfico de barras do ranking TOPSIS">
      <Bar data={data} options={options} />
    </div>
  );
}

const PALETA_RADAR = ['#fbbf24', '#38bdf8', '#a78bfa', '#f472b6', '#34d399'];

export function RadarDesempenho({ criterios, series }) {
  const data = {
    labels: criterios.map((c) => c.codigo || c.nome),
    datasets: series.map((s, i) => {
      const cor = PALETA_RADAR[i % PALETA_RADAR.length];
      return { label: s.nome, data: s.valores, borderColor: cor, backgroundColor: `${cor}33` };
    }),
  };
  const options = {
    maintainAspectRatio: false,
    scales: { r: { min: 0, max: 1, ticks: { backdropColor: 'transparent' } } },
    plugins: { legend: { position: 'bottom' } },
  };
  return (
    <div className="h-80 sm:h-96" role="img" aria-label="Gráfico radar de desempenho por critério">
      <Radar data={data} options={options} />
    </div>
  );
}
