import { useEffect, useId, useState } from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, Inbox, Loader2, X } from 'lucide-react';
import { FAIXAS } from '../../utils/vulnerabilidade';
import { comToast } from '../../utils/toast';

export function PageHeader({ titulo, descricao, acoes }) {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-white sm:text-2xl">{titulo}</h1>
        {descricao && <p className="mt-1 text-sm text-slate-400">{descricao}</p>}
      </div>
      {acoes && <div className="flex flex-wrap gap-2">{acoes}</div>}
    </div>
  );
}

// `semPadding`: corpo sem padding (para tabelas e listas).
export function Card({ titulo, acoes, children, className = '', semPadding }) {
  return (
    <section className={`rounded-2xl border border-slate-800 bg-slate-900/60 ${className}`}>
      {(titulo || acoes) && (
        <header className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 px-5 py-4">
          <h2 className="font-semibold text-white">{titulo}</h2>
          {acoes && <div className="flex flex-wrap items-center gap-2">{acoes}</div>}
        </header>
      )}
      <div className={semPadding ? '' : 'p-5'}>{children}</div>
    </section>
  );
}

export function KpiCard({ rotulo, valor, detalhe }) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
      <span className="text-xs font-medium uppercase tracking-wider text-slate-400">{rotulo}</span>
      <p className="mt-3 truncate text-2xl font-bold text-white" title={typeof valor === 'string' ? valor : undefined}>
        {valor}
      </p>
      {detalhe && <p className="mt-1 truncate text-xs text-slate-400">{detalhe}</p>}
    </div>
  );
}

// Tabela com cabeçalho padrão. `colunas`: strings ou { rotulo, className }; valores falsos são ignorados.
export function Tabela({ colunas, largura = '', children }) {
  return (
    <div className="overflow-x-auto">
      <table className={`w-full text-left text-sm ${largura}`}>
        <thead className="text-xs uppercase tracking-wider text-slate-400">
          <tr className="border-b border-slate-800">
            {colunas.filter(Boolean).map((c) => {
              const { rotulo, className = '' } = typeof c === 'string' ? { rotulo: c } : c;
              return (
                <th key={rotulo} className={`px-4 py-3 ${className}`}>
                  {rotulo}
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-800">{children}</tbody>
      </table>
    </div>
  );
}

const VARIANTES = {
  primario: 'bg-amber-400 text-slate-950 hover:bg-amber-300 font-semibold',
  secundario: 'border border-slate-700 bg-slate-800/60 text-slate-200 hover:bg-slate-700/60',
  perigo: 'border border-rose-500/40 bg-rose-500/10 text-rose-300 hover:bg-rose-500/20',
};

const estiloBotao = (variante, tamanho) =>
  `inline-flex items-center justify-center gap-2 rounded-lg transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
    tamanho === 'sm' ? 'px-2.5 py-1.5 text-xs' : 'px-4 py-2 text-sm'
  } ${VARIANTES[variante]}`;

export function LinkButton({ para, variante = 'secundario', icone: Icone, children }) {
  return (
    <Link to={para} className={estiloBotao(variante, 'md')}>
      {Icone && <Icone className="h-4 w-4" aria-hidden />}
      {children}
    </Link>
  );
}

export function Button({ variante = 'secundario', icone: Icone, carregando, children, className = '', tamanho = 'md', ...props }) {
  return (
    <button
      type="button"
      className={`${estiloBotao(variante, tamanho)} ${className}`}
      disabled={carregando || props.disabled}
      {...props}
    >
      {carregando ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : Icone && <Icone className="h-4 w-4" aria-hidden />}
      {children}
    </button>
  );
}

export function IconButton({ icone: Icone, rotulo, variante, ...props }) {
  return (
    <button
      type="button"
      title={rotulo}
      aria-label={rotulo}
      className={`rounded-lg p-2 transition-colors disabled:opacity-40 ${
        variante === 'perigo' ? 'text-rose-300 hover:bg-rose-500/15' : 'text-slate-300 hover:bg-slate-800 hover:text-white'
      }`}
      {...props}
    >
      <Icone className="h-4 w-4" aria-hidden />
    </button>
  );
}

export function FaixaBadge({ faixa }) {
  return <span className={`inline-flex rounded-md border px-2 py-0.5 text-xs font-semibold ${FAIXAS[faixa]?.classe}`}>{faixa}</span>;
}

export function TipoBadge({ tipo }) {
  const custo = tipo === 'custo';
  return (
    <span
      className={`inline-flex rounded px-2 py-0.5 text-[10px] font-bold uppercase ${
        custo ? 'bg-rose-500/10 text-rose-300' : 'bg-emerald-500/10 text-emerald-300'
      }`}
    >
      {custo ? 'Custo' : 'Benefício'}
    </span>
  );
}

export function Spinner() {
  return <Loader2 className="h-5 w-5 animate-spin text-amber-400" aria-label="Carregando" />;
}

export function LoadingState({ texto = 'Carregando…' }) {
  return (
    <div className="flex items-center justify-center gap-3 py-16 text-slate-400">
      <Spinner /> <span className="text-sm">{texto}</span>
    </div>
  );
}

export function ErrorState({ erro, aoTentarNovamente }) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-2xl border border-rose-500/30 bg-rose-500/5 px-6 py-10 text-center">
      <AlertTriangle className="h-8 w-8 text-rose-400" aria-hidden />
      <p className="text-sm text-rose-200">{erro?.message || 'Ocorreu um erro inesperado.'}</p>
      {aoTentarNovamente && (
        <Button onClick={aoTentarNovamente} tamanho="sm">
          Tentar novamente
        </Button>
      )}
    </div>
  );
}

export function EmptyState({ titulo, descricao, acao }) {
  return (
    <div className="flex flex-col items-center gap-2 px-6 py-12 text-center">
      <Inbox className="h-10 w-10 text-slate-600" aria-hidden />
      <p className="font-medium text-slate-200">{titulo}</p>
      {descricao && <p className="max-w-md text-sm text-slate-400">{descricao}</p>}
      {acao && <div className="mt-3">{acao}</div>}
    </div>
  );
}

const CAMPO = 'w-full rounded-lg border border-slate-700 bg-slate-950/60 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-400/50 disabled:opacity-60';

function Field({ rotulo, children, className = '' }) {
  const id = useId();
  return (
    <div className={className}>
      {rotulo && (
        <label htmlFor={id} className="mb-1 block text-xs font-medium text-slate-300">
          {rotulo}
        </label>
      )}
      {children(id)}
    </div>
  );
}

export function Input({ rotulo, className, ...props }) {
  return (
    <Field rotulo={rotulo} className={className}>
      {(id) => <input id={id} className={CAMPO} {...props} />}
    </Field>
  );
}

export function Select({ rotulo, className, children, ...props }) {
  return (
    <Field rotulo={rotulo} className={className}>
      {(id) => (
        <select id={id} className={CAMPO} {...props}>
          {children}
        </select>
      )}
    </Field>
  );
}

export function Modal({ aberto, titulo, aoFechar, children, rodape, largura = 'max-w-2xl' }) {
  useEffect(() => {
    if (!aberto) return undefined;
    const fechar = (e) => e.key === 'Escape' && aoFechar();
    document.addEventListener('keydown', fechar);
    return () => document.removeEventListener('keydown', fechar);
  }, [aberto, aoFechar]);

  if (!aberto) return null;
  return (
    <div className="fixed inset-0 z-[1500] flex items-end justify-center bg-black/60 p-0 backdrop-blur-sm sm:items-center sm:p-4" onMouseDown={aoFechar}>
      <div
        role="dialog"
        aria-modal="true"
        aria-label={titulo}
        className={`flex max-h-[92vh] w-full flex-col rounded-t-2xl border border-slate-700 bg-slate-900 shadow-2xl sm:rounded-2xl ${largura}`}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <header className="flex items-center justify-between border-b border-slate-800 px-5 py-4">
          <h2 className="font-semibold text-white">{titulo}</h2>
          <IconButton icone={X} rotulo="Fechar" onClick={aoFechar} />
        </header>
        <div className="overflow-y-auto px-5 py-4">{children}</div>
        {rodape && <footer className="flex justify-end gap-2 border-t border-slate-800 px-5 py-4">{rodape}</footer>}
      </div>
    </div>
  );
}

// Diálogo de exclusão: monte-o somente quando houver item a excluir.
// `aoExcluir` faz a chamada; `aoConcluir` roda após o sucesso; `aoCancelar` fecha o diálogo.
export function ConfirmarExclusao({ titulo, mensagem, msgOk, aoExcluir, aoConcluir, aoCancelar }) {
  const [excluindo, setExcluindo] = useState(false);

  const confirmar = async () => {
    if (await comToast(aoExcluir, msgOk, setExcluindo)) {
      aoCancelar();
      aoConcluir();
    }
  };

  return (
    <Modal
      aberto
      titulo={titulo}
      aoFechar={aoCancelar}
      largura="max-w-md"
      rodape={
        <>
          <Button onClick={aoCancelar}>Cancelar</Button>
          <Button variante="perigo" carregando={excluindo} onClick={confirmar}>
            Excluir
          </Button>
        </>
      }
    >
      <p className="text-sm text-slate-300">{mensagem}</p>
    </Modal>
  );
}
