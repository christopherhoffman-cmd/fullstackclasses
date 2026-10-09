import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { FileText, FileSpreadsheet } from 'lucide-react';
import { relatorioService, simulacaoService } from '../services';
import { useApi } from '../hooks/useApi';
import { Button, Card, ErrorState, FaixaBadge, KpiCard, LinkButton, LoadingState, PageHeader, Tabela } from '../components/ui';
import { RadarDesempenho, RankingBarChart } from '../components/charts/Charts';
import { formatarCi, formatarData, formatarNumero } from '../utils/format';
import { FAIXAS } from '../utils/vulnerabilidade';

const TOP_RADAR = 5;

// Valor do município no critério, escalonado entre os avaliados (1 = melhor, 0 = pior).
function desempenho(r, c, ranking) {
  const todos = ranking.map((x) => Number(x.valores?.[c.id]));
  const min = Math.min(...todos);
  const max = Math.max(...todos);
  if (max === min) return 1;
  const t = (Number(r.valores?.[c.id]) - min) / (max - min);
  return c.tipo === 'custo' ? 1 - t : t;
}

export default function ResultadoPage() {
  const { id } = useParams();
  const { dados: sim, carregando, erro, recarregar } = useApi(() => simulacaoService.obter(id), id);
  const [exportando, setExportando] = useState('');

  if (carregando && !sim) return <LoadingState />;
  if (erro) return <ErrorState erro={erro} aoTentarNovamente={recarregar} />;

  const { ranking, metadata } = sim;
  const criterios = metadata.criterios;
  const menosVulneravel = ranking[0];
  const maisVulneravel = ranking[ranking.length - 1];

  const exportar = async (formato) => {
    setExportando(formato);
    await relatorioService.exportar(formato, sim.simulacao_id);
    setExportando('');
  };

  return (
    <>
      <PageHeader
        titulo={`Resultado da simulação #${sim.simulacao_id}`}
        descricao={`${sim.descricao ? `${sim.descricao} • ` : ''}${formatarData(sim.data_execucao)}${sim.usuario_nome ? ` • ${sim.usuario_nome}` : ''}`}
        acoes={
          <>
            <Button icone={FileText} carregando={exportando === 'pdf'} onClick={() => exportar('pdf')}>
              Exportar PDF
            </Button>
            <Button icone={FileSpreadsheet} carregando={exportando === 'csv'} onClick={() => exportar('csv')}>
              Exportar CSV
            </Button>
            <LinkButton para="/executar" variante="primario">
              Nova simulação
            </LinkButton>
          </>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <KpiCard rotulo="Menos vulnerável" valor={menosVulneravel?.nome} detalhe={`Ci ${formatarCi(menosVulneravel?.ci)}`} />
        <KpiCard rotulo="Mais vulnerável" valor={maisVulneravel?.nome} detalhe={`Ci ${formatarCi(maisVulneravel?.ci)}`} />
        <KpiCard rotulo="Média do Ci" valor={formatarCi(metadata.media_ci)} detalhe={`${metadata.total_alternativas} municípios • ${criterios.length} critérios`} />
      </div>

      <Card titulo="Ranking de vulnerabilidade" className="mt-6" semPadding acoes={<span className="text-xs text-slate-400">Maior Ci = menor vulnerabilidade</span>}>
        <Tabela
          largura="min-w-[680px]"
          colunas={['#', 'Município', { rotulo: 'Ci', className: 'w-[28%]' }, { rotulo: 'D+', className: 'text-right' }, { rotulo: 'D-', className: 'text-right' }, 'Vulnerabilidade']}
        >
          {ranking.map((r) => (
            <tr key={r.municipio_id} className="hover:bg-slate-800/30">
              <td className="px-4 py-2.5">
                <span
                  className={`inline-flex h-7 w-7 items-center justify-center rounded-lg text-xs font-bold ${
                    r.posicao === 1 ? 'bg-amber-400 text-slate-950' : 'bg-slate-800 text-slate-300'
                  }`}
                >
                  {r.posicao}
                </span>
              </td>
              <td className="px-4 py-2.5 font-medium text-white">
                {r.nome} <span className="text-slate-500">— {r.uf}</span>
              </td>
              <td className="px-4 py-2.5">
                <div className="flex items-center gap-3">
                  <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-800">
                    <div className="h-full rounded-full" style={{ width: `${r.ci * 100}%`, background: FAIXAS[r.faixa]?.cor }} />
                  </div>
                  <span className="w-14 text-right font-mono font-bold text-amber-300">{formatarCi(r.ci)}</span>
                </div>
              </td>
              <td className="px-4 py-2.5 text-right font-mono text-xs text-slate-400">{formatarNumero(r.dPlus, 4, { fixo: true })}</td>
              <td className="px-4 py-2.5 text-right font-mono text-xs text-slate-400">{formatarNumero(r.dMinus, 4, { fixo: true })}</td>
              <td className="px-4 py-2.5">
                <FaixaBadge faixa={r.faixa} />
              </td>
            </tr>
          ))}
        </Tabela>
      </Card>

      <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-2">
        <Card titulo="Coeficiente de proximidade (Ci)">
          <RankingBarChart ranking={ranking} />
        </Card>
        <Card titulo="Radar por município">
          <p className="mb-2 text-xs text-slate-400">
            Top {TOP_RADAR} do ranking. Desempenho relativo em cada critério (1 = melhor valor entre os avaliados, 0 = pior).
          </p>
          <RadarDesempenho
            criterios={criterios}
            series={ranking.slice(0, TOP_RADAR).map((r) => ({ nome: r.nome, valores: criterios.map((c) => desempenho(r, c, ranking)) }))}
          />
        </Card>
      </div>
    </>
  );
}
