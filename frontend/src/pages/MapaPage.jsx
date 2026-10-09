import { useState } from 'react';
import { Flame, CircleDot } from 'lucide-react';
import { criterioService, municipioService, simulacaoService } from '../services';
import { useApi } from '../hooks/useApi';
import { Card, EmptyState, ErrorState, LoadingState, PageHeader, Select } from '../components/ui';
import MapaVulnerabilidade from '../components/map/MapaVulnerabilidade';
import { formatarData } from '../utils/format';

const VULNERABILIDADE = 'vulnerabilidade';

export default function MapaPage() {
  const [escolhida, setEscolhida] = useState(''); // simulação escolhida (vazio = a mais recente)
  const [modo, setModo] = useState('ci');
  const [indicador, setIndicador] = useState(VULNERABILIDADE);

  const { dados, carregando, erro, recarregar } = useApi(async () => {
    const [simulacoes, municipios, criterios] = await Promise.all([
      simulacaoService.listar(100),
      municipioService.listar(),
      criterioService.listar(),
    ]);
    const id = escolhida || simulacoes[0]?.id;
    const simulacao = id ? await simulacaoService.obter(id) : null;
    return { simulacoes, municipios, criterios, simulacao };
  }, escolhida);

  if (carregando && !dados) return <LoadingState />;
  if (erro) return <ErrorState erro={erro} aoTentarNovamente={recarregar} />;

  const { simulacoes, municipios, criterios, simulacao } = dados;
  const porId = Object.fromEntries((simulacao?.ranking || []).map((r) => [r.municipio_id, r]));
  const criterio = criterios.find((c) => String(c.id) === indicador);
  const rotulo = criterio ? `${criterio.nome}${criterio.unidade ? ` (${criterio.unidade})` : ''}` : 'Vulnerabilidade (1 − Ci)';

  // Modo calor: `valor` é a intensidade do indicador escolhido; modo Ci: só municípios do ranking.
  const itens = municipios
    .filter((m) => modo === 'calor' || porId[m.id])
    .map((m) => {
      const r = porId[m.id];
      const valor = criterio ? m.valores?.[criterio.id] : r && 1 - r.ci;
      return { ...m, ci: r?.ci, posicao: r?.posicao, faixa: r?.faixa, valor: valor == null ? undefined : Number(valor) };
    });

  return (
    <>
      <PageHeader titulo="Mapa" />

      <Card semPadding>
        <div className="grid grid-cols-1 gap-3 border-b border-slate-800 p-4 md:grid-cols-3">
          <Select rotulo="Simulação" value={escolhida || simulacao?.simulacao_id || ''} onChange={(e) => setEscolhida(e.target.value)} disabled={!simulacoes.length}>
            {!simulacoes.length && <option value="">Nenhuma simulação</option>}
            {simulacoes.map((s) => (
              <option key={s.id} value={s.id}>
                #{s.id} — {formatarData(s.data_execucao)}
                {s.descricao ? ` — ${s.descricao}` : ''}
              </option>
            ))}
          </Select>
          <div>
            <span className="mb-1 block text-xs font-medium text-slate-300">Camada</span>
            <div className="flex rounded-lg border border-slate-700 p-1" role="radiogroup" aria-label="Camada do mapa">
              {[
                { id: 'ci', rotulo: 'Faixas (Ci)', icone: CircleDot },
                { id: 'calor', rotulo: 'Calor por indicador', icone: Flame },
              ].map(({ id, rotulo: r, icone: Icone }) => (
                <button
                  key={id}
                  role="radio"
                  aria-checked={modo === id}
                  onClick={() => setModo(id)}
                  className={`flex flex-1 items-center justify-center gap-2 rounded-md px-3 py-1.5 text-sm ${
                    modo === id ? 'bg-amber-400 font-semibold text-slate-950' : 'text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <Icone className="h-4 w-4" /> {r}
                </button>
              ))}
            </div>
          </div>
          <Select rotulo="Indicador" value={indicador} onChange={(e) => setIndicador(e.target.value)} disabled={modo !== 'calor'}>
            <option value={VULNERABILIDADE}>Vulnerabilidade (1 − Ci)</option>
            {criterios.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nome}
              </option>
            ))}
          </Select>
        </div>

        <div className="p-4">
          {modo === 'ci' && !simulacoes.length ? (
            <EmptyState titulo="Nenhuma simulação" descricao="Execute o TOPSIS para colorir o mapa por vulnerabilidade, ou use a camada de calor por indicador." />
          ) : (
            <MapaVulnerabilidade itens={itens} modo={modo} rotulo={rotulo} altura="h-[calc(100vh-320px)] min-h-[420px]" />
          )}
        </div>
      </Card>
    </>
  );
}
