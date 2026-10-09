import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, Search, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { criterioService, municipioService, topsisService } from '../services';
import { useApi } from '../hooks/useApi';
import { comToast } from '../utils/toast';
import { Button, Card, ErrorState, Input, LoadingState, PageHeader, TipoBadge } from '../components/ui';
import { somaPesos, somaValida } from '../utils/pesos';
import { formatarNumero } from '../utils/format';

export default function ExecutarPage() {
  const { dados, carregando, erro, recarregar } = useApi(async () => {
    const [municipios, criterios] = await Promise.all([municipioService.listar(), criterioService.listar()]);
    return { municipios, criterios };
  });

  if (carregando && !dados) return <LoadingState />;
  if (erro) return <ErrorState erro={erro} aoTentarNovamente={recarregar} />;
  return <FormularioExecucao dados={dados} />;
}

function FormularioExecucao({ dados }) {
  const navigate = useNavigate();
  const [selecionados, setSelecionados] = useState(() => new Set(dados.municipios.map((m) => m.id)));
  const [criterios, setCriterios] = useState(() => dados.criterios.map((c) => ({ ...c, incluido: Number(c.peso) > 0 })));
  const [busca, setBusca] = useState('');
  const [descricao, setDescricao] = useState('');
  const [executando, setExecutando] = useState(false);

  const ativos = criterios.filter((c) => c.incluido && Number(c.peso) > 0);
  const soma = somaPesos(ativos);

  const incompletos = dados.municipios.filter(
    (m) => selecionados.has(m.id) && ativos.some((c) => m.valores?.[c.id] === undefined || m.valores?.[c.id] === null)
  );
  const termo = busca.trim().toLowerCase();
  const filtrados = dados.municipios.filter((m) => !termo || `${m.nome} ${m.uf}`.toLowerCase().includes(termo));

  const alternar = (id) =>
    setSelecionados((s) => {
      const n = new Set(s);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });

  const alterarCriterio = (id, campo, valor) => setCriterios((l) => l.map((c) => (c.id === id ? { ...c, [campo]: valor } : c)));

  const validos = selecionados.size - incompletos.length;
  const podeExecutar = validos >= 2 && ativos.length > 0 && soma > 0;

  const executar = async () => {
    const resultado = await comToast(
      () =>
        topsisService.executar({
          descricao: descricao.trim() || undefined,
          municipios: [...selecionados],
          criterios: ativos.map((c) => ({ id: c.id, peso: Number(c.peso), tipo: c.tipo })),
        }),
      (r) => `Ranking gerado com ${r.ranking.length} municípios.`,
      setExecutando
    );
    if (resultado) navigate(`/simulacoes/${resultado.dados.simulacao_id}`);
  };

  return (
    <>
      <PageHeader titulo="Executar TOPSIS" />

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-5">
        <Card
          titulo={`1. Municípios (${selecionados.size}/${dados.municipios.length})`}
          className="xl:col-span-2"
          semPadding
          acoes={
            <>
              <Button tamanho="sm" onClick={() => setSelecionados(new Set(dados.municipios.map((m) => m.id)))}>
                Todos
              </Button>
              <Button tamanho="sm" onClick={() => setSelecionados(new Set())}>
                Nenhum
              </Button>
            </>
          }
        >
          <div className="relative border-b border-slate-800 p-3">
            <Search className="pointer-events-none absolute left-6 top-5.5 h-4 w-4 text-slate-500" aria-hidden />
            <Input placeholder="Filtrar…" value={busca} onChange={(e) => setBusca(e.target.value)} aria-label="Filtrar municípios" className="[&_input]:pl-9" />
          </div>
          <ul className="max-h-[440px] divide-y divide-slate-800/70 overflow-y-auto">
            {filtrados.map((m) => {
              const faltando = incompletos.some((i) => i.id === m.id);
              return (
                <li key={m.id}>
                  <label className="flex cursor-pointer items-center gap-3 px-4 py-2 text-sm hover:bg-slate-800/40">
                    <input type="checkbox" checked={selecionados.has(m.id)} onChange={() => alternar(m.id)} className="h-4 w-4 accent-amber-400" />
                    <span className="flex-1 truncate text-slate-200">
                      {m.nome} <span className="text-slate-500">— {m.uf}</span>
                    </span>
                    {faltando && (
                      <span className="text-[10px] font-semibold uppercase text-amber-400" title="Sem valores para algum critério ativo">
                        incompleto
                      </span>
                    )}
                  </label>
                </li>
              );
            })}
          </ul>
        </Card>

        <div className="flex flex-col gap-6 xl:col-span-3">
          <Card titulo="2. Critérios e pesos desta simulação" semPadding>
            <ul className="divide-y divide-slate-800/70">
              {criterios.map((c) => (
                <li key={c.id} className={`flex flex-col gap-2 px-4 py-3 sm:flex-row sm:items-center ${c.incluido ? '' : 'opacity-50'}`}>
                  <label className="flex flex-1 cursor-pointer items-center gap-3 text-sm">
                    <input type="checkbox" checked={c.incluido} onChange={(e) => alterarCriterio(c.id, 'incluido', e.target.checked)} className="h-4 w-4 accent-amber-400" />
                    <span className="text-slate-200">{c.nome}</span>
                    <TipoBadge tipo={c.tipo} />
                  </label>
                  <div className="flex items-center gap-3 sm:w-64">
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.01"
                      value={c.peso}
                      disabled={!c.incluido}
                      onChange={(e) => alterarCriterio(c.id, 'peso', Number(e.target.value))}
                      className="w-full accent-amber-400"
                      aria-label={`Peso de ${c.nome}`}
                    />
                    <span className="w-12 text-right font-mono text-sm text-amber-300">{formatarNumero(c.peso, 2, { fixo: true })}</span>
                  </div>
                </li>
              ))}
            </ul>
            <div className="flex items-center justify-between border-t border-slate-800 px-4 py-3 text-sm">
              <span className="flex items-center gap-2 text-slate-300">
                {somaValida(ativos) ? <CheckCircle2 className="h-4 w-4 text-emerald-400" /> : <AlertTriangle className="h-4 w-4 text-amber-400" />}
                Soma dos pesos ativos
              </span>
              <span className={`font-mono font-bold ${somaValida(ativos) ? 'text-emerald-400' : 'text-amber-400'}`}>{formatarNumero(soma, 3, { fixo: true })}</span>
            </div>
            {!somaValida(ativos) && soma > 0 && (
              <p className="px-4 pb-3 text-xs text-slate-400">
                Os pesos serão normalizados automaticamente no cálculo (o ranking não muda com a escala dos pesos).
              </p>
            )}
          </Card>

          <Card titulo="3. Executar">
            <div className="space-y-4">
              <Input rotulo="Descrição (opcional)" placeholder="Ex.: Cenário com ênfase em tarifa" value={descricao} onChange={(e) => setDescricao(e.target.value)} maxLength={200} />
              {incompletos.length > 0 && (
                <p className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs text-amber-200">
                  {incompletos.length} município(s) sem todos os valores dos critérios ativos ficarão fora do cálculo:{' '}
                  {incompletos.map((m) => m.nome).join(', ')}.
                </p>
              )}
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-slate-400">
                  <strong className="text-white">{validos}</strong> alternativas × <strong className="text-white">{ativos.length}</strong> critérios
                </p>
                <Button variante="primario" icone={Play} carregando={executando} disabled={!podeExecutar} onClick={executar}>
                  Executar cálculo TOPSIS
                </Button>
              </div>
              {!podeExecutar && <p className="text-xs text-rose-300">Selecione ao menos 2 municípios com dados completos e 1 critério com peso &gt; 0.</p>}
            </div>
          </Card>
        </div>
      </div>
    </>
  );
}
