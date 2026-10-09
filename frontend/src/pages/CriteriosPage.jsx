import { useState } from 'react';
import { Plus, Pencil, Trash2, Save, RotateCcw, Play, CheckCircle2, AlertTriangle } from 'lucide-react';
import { criterioService } from '../services';
import { useApi } from '../hooks/useApi';
import { useAuth } from '../hooks/AuthProvider';
import { toast, comToast } from '../utils/toast';
import {
  Button, Card, ConfirmarExclusao, EmptyState, ErrorState, IconButton, LinkButton, LoadingState, PageHeader, Tabela, TipoBadge,
} from '../components/ui';
import CriterioFormModal from '../components/CriterioFormModal';
import { somaPesos, somaValida } from '../utils/pesos';
import { formatarNumero } from '../utils/format';
import { podeEditarDados } from '../utils/perfis';

export default function CriteriosPage() {
  const { usuario } = useAuth();
  const editavel = podeEditarDados(usuario);
  const { dados: originais, carregando, erro, recarregar } = useApi(() => criterioService.listar());
  const [pesos, setPesos] = useState({}); // pesos editados, por id do critério
  const [salvando, setSalvando] = useState(false);
  const [edicao, setEdicao] = useState(null); // { criterio } com o modal aberto
  const [exclusao, setExclusao] = useState(null);

  if (carregando && !originais) return <LoadingState />;
  if (erro) return <ErrorState erro={erro} aoTentarNovamente={recarregar} />;

  const criterios = originais.map((o) => ({ ...o, peso: pesos[o.id] ?? o.peso }));
  const soma = somaPesos(criterios);
  const valida = somaValida(criterios);
  const alterado = criterios.some((c, i) => Number(c.peso) !== Number(originais[i].peso));

  const recarregarTudo = () => {
    setPesos({});
    recarregar();
  };

  const salvar = async () => {
    if (!valida) {
      toast.erro(`A soma dos pesos deve ser 1,00 (atual: ${formatarNumero(soma, 3, { fixo: true })}).`);
      return;
    }
    const ok = await comToast(
      () => criterioService.salvarPesos(criterios.map((c) => ({ id: c.id, peso: Number(c.peso) }))),
      'Configuração TOPSIS salva.',
      setSalvando
    );
    if (ok) recarregarTudo();
  };

  return (
    <>
      <PageHeader
        titulo="Configuração TOPSIS"
        descricao="Pesos dos critérios: a soma deve ser 1,0"
        acoes={
          <>
            {editavel && (
              <Button icone={Plus} onClick={() => setEdicao({ criterio: null })}>
                Novo critério
              </Button>
            )}
            <LinkButton para="/executar" variante="primario" icone={Play}>
              Executar TOPSIS
            </LinkButton>
          </>
        }
      />

      <Card semPadding>
        <div className="flex flex-col gap-3 border-b border-slate-800 p-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex-1">
            <div className="mb-1.5 flex items-center justify-between text-sm">
              <span className="flex items-center gap-2 font-medium text-slate-200">
                {valida ? <CheckCircle2 className="h-4 w-4 text-emerald-400" /> : <AlertTriangle className="h-4 w-4 text-amber-400" />}
                Soma dos pesos
              </span>
              <span className={`font-mono font-bold ${valida ? 'text-emerald-400' : 'text-amber-400'}`}>
                {formatarNumero(soma, 3, { fixo: true })} / 1,000
              </span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-slate-800" role="progressbar" aria-valuenow={soma} aria-valuemin={0} aria-valuemax={1}>
              <div className={`h-full transition-all ${valida ? 'bg-emerald-500' : soma > 1 ? 'bg-rose-500' : 'bg-amber-400'}`} style={{ width: `${Math.min(soma, 1) * 100}%` }} />
            </div>
          </div>
          {editavel && (
            <div className="flex flex-wrap gap-2">
              <Button tamanho="sm" icone={RotateCcw} disabled={!alterado} onClick={() => setPesos({})}>
                Desfazer
              </Button>
              <Button tamanho="sm" variante="primario" icone={Save} carregando={salvando} disabled={!alterado} onClick={salvar}>
                Salvar
              </Button>
            </div>
          )}
        </div>

        {criterios.length === 0 ? (
          <EmptyState titulo="Nenhum critério cadastrado" />
        ) : (
          <Tabela
            largura="min-w-[720px]"
            colunas={['Critério', 'Tipo', 'Unidade / Fonte', { rotulo: 'Peso', className: 'w-[34%]' }, editavel && { rotulo: 'Ações', className: 'text-right' }]}
          >
            {criterios.map((c) => (
              <tr key={c.id} className={Number(c.peso) === 0 ? 'opacity-60' : ''}>
                <td className="px-4 py-3">
                  <p className="font-medium text-white">{c.nome}</p>
                  {c.descricao && <p className="text-xs text-slate-500">{c.descricao}</p>}
                </td>
                <td className="px-4 py-3">
                  <TipoBadge tipo={c.tipo} />
                </td>
                <td className="px-4 py-3 text-xs text-slate-400">
                  {c.unidade || '—'}
                  {c.fonte && <span className="block text-slate-500">{c.fonte}</span>}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.01"
                      value={c.peso}
                      disabled={!editavel}
                      onChange={(e) => setPesos((p) => ({ ...p, [c.id]: Number(e.target.value) }))}
                      className="w-full cursor-pointer accent-amber-400 disabled:cursor-default"
                      aria-label={`Peso de ${c.nome}`}
                    />
                    <span className="w-12 text-right font-mono text-sm text-amber-300">{formatarNumero(c.peso, 2, { fixo: true })}</span>
                  </div>
                </td>
                {editavel && (
                  <td className="px-4 py-2 text-right">
                    <IconButton icone={Pencil} rotulo={`Editar ${c.nome}`} onClick={() => setEdicao({ criterio: c })} />
                    <IconButton icone={Trash2} rotulo={`Excluir ${c.nome}`} variante="perigo" onClick={() => setExclusao(c)} />
                  </td>
                )}
              </tr>
            ))}
          </Tabela>
        )}
        <p className="border-t border-slate-800 px-4 py-3 text-xs text-slate-500">
          Critérios com peso 0 não entram no cálculo. Benefício: quanto maior o valor, menor a vulnerabilidade. Custo: quanto maior, maior a vulnerabilidade.
        </p>
      </Card>

      {edicao && (
        <CriterioFormModal
          criterio={edicao.criterio}
          aoFechar={() => setEdicao(null)}
          aoSalvar={() => {
            setEdicao(null);
            recarregarTudo();
          }}
        />
      )}
      {exclusao && (
        <ConfirmarExclusao
          titulo="Excluir critério"
          mensagem={`Excluir "${exclusao.nome}"? Todos os valores deste critério na matriz de decisão serão removidos.`}
          msgOk="Critério excluído."
          aoExcluir={() => criterioService.remover(exclusao.id)}
          aoConcluir={recarregarTudo}
          aoCancelar={() => setExclusao(null)}
        />
      )}
    </>
  );
}
