import { ArrowRight } from 'lucide-react';
import { municipioService, simulacaoService } from '../services';
import { useApi } from '../hooks/useApi';
import { Card, EmptyState, ErrorState, KpiCard, LinkButton, LoadingState, PageHeader } from '../components/ui';
import { RankingBarChart } from '../components/charts/Charts';
import { formatarCi, formatarData, formatarInteiro } from '../utils/format';

export default function DashboardPage() {
  const { dados, carregando, erro, recarregar } = useApi(async () => {
    const [ultima, municipios] = await Promise.all([simulacaoService.ultima(), municipioService.listar()]);
    return { ultima, municipios };
  });

  if (carregando) return <LoadingState />;
  if (erro) return <ErrorState erro={erro} aoTentarNovamente={recarregar} />;

  const { ultima, municipios } = dados;
  const ranking = ultima?.ranking || [];
  const maisVulneravel = ranking[ranking.length - 1];

  return (
    <>
      <PageHeader
        titulo="Dashboard"
        descricao={
          ultima
            ? `Última simulação #${ultima.simulacao_id} em ${formatarData(ultima.data_execucao)}${ultima.usuario_nome ? ` por ${ultima.usuario_nome}` : ''}`
            : undefined
        }
        acoes={
          <>
            <LinkButton para="/mapa">Abrir mapa</LinkButton>
            {ultima && (
              <LinkButton para={`/simulacoes/${ultima.simulacao_id}`} icone={ArrowRight}>
                Ver resultado completo
              </LinkButton>
            )}
          </>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <KpiCard rotulo="Municípios cadastrados" valor={formatarInteiro(municipios.length)} detalhe={`${ranking.length} avaliados na última simulação`} />
        <KpiCard rotulo="Média do Ci" valor={ultima ? formatarCi(ultima.metadata.media_ci) : '—'} detalhe="0 = mais vulnerável • 1 = menos vulnerável" />
        <KpiCard
          rotulo="Mais vulnerável"
          valor={maisVulneravel?.nome || '—'}
          detalhe={maisVulneravel ? `Ci ${formatarCi(maisVulneravel.ci)} • ${maisVulneravel.uf}` : 'Execute uma simulação'}
        />
      </div>

      <Card titulo="Ranking de vulnerabilidade (Ci)" className="mt-6">
        {ultima ? (
          <>
            <RankingBarChart ranking={ranking} limite={15} />
            {ranking.length > 15 && <p className="mt-2 text-xs text-slate-500">Exibindo os 15 primeiros de {ranking.length}.</p>}
          </>
        ) : (
          <EmptyState
            titulo="Nenhuma simulação executada"
            descricao="Execute o cálculo TOPSIS para gerar o ranking de vulnerabilidade."
            acao={
              <LinkButton para="/executar" variante="primario">
                Executar TOPSIS
              </LinkButton>
            }
          />
        )}
      </Card>
    </>
  );
}
