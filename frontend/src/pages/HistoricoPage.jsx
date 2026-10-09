import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FileText, FileSpreadsheet, Trash2, Play } from 'lucide-react';
import { relatorioService, simulacaoService } from '../services';
import { useApi } from '../hooks/useApi';
import { useAuth } from '../hooks/AuthProvider';
import { Card, ConfirmarExclusao, EmptyState, ErrorState, IconButton, LinkButton, LoadingState, PageHeader, Tabela } from '../components/ui';
import { formatarData } from '../utils/format';
import { ehAdmin } from '../utils/perfis';

export default function HistoricoPage() {
  const { usuario } = useAuth();
  const { dados, carregando, erro, recarregar } = useApi(() => simulacaoService.listar(200));
  const [exclusao, setExclusao] = useState(null);

  if (carregando && !dados) return <LoadingState />;
  if (erro) return <ErrorState erro={erro} aoTentarNovamente={recarregar} />;

  return (
    <>
      <PageHeader
        titulo="Histórico de simulações"
        acoes={
          <LinkButton para="/executar" variante="primario" icone={Play}>
            Nova simulação
          </LinkButton>
        }
      />
      <Card semPadding>
        {dados.length === 0 ? (
          <EmptyState titulo="Nenhuma simulação registrada" descricao="Execute o TOPSIS para gerar o primeiro ranking." />
        ) : (
          <Tabela
            largura="min-w-[860px]"
            colunas={[
              '#',
              'Data',
              'Descrição',
              'Responsável',
              { rotulo: 'Mun. × Crit.', className: 'text-center' },
              '1º (menos vulnerável)',
              'Mais vulnerável',
              { rotulo: 'Ações', className: 'text-right' },
            ]}
          >
            {dados.map((s) => (
              <tr key={s.id} className="hover:bg-slate-800/30">
                <td className="px-4 py-2.5 font-mono">
                  <Link to={`/simulacoes/${s.id}`} className="text-amber-400 hover:underline">
                    #{s.id}
                  </Link>
                </td>
                <td className="whitespace-nowrap px-4 py-2.5 text-slate-300">{formatarData(s.data_execucao)}</td>
                <td className="max-w-56 truncate px-4 py-2.5 text-slate-200" title={s.descricao || ''}>
                  {s.descricao || <span className="text-slate-500">—</span>}
                </td>
                <td className="px-4 py-2.5 text-slate-400">{s.usuario_nome || '—'}</td>
                <td className="px-4 py-2.5 text-center text-slate-300">
                  {s.total_municipios} × {s.total_criterios}
                </td>
                <td className="px-4 py-2.5 text-emerald-300">{s.melhor_municipio || '—'}</td>
                <td className="px-4 py-2.5 text-rose-300">{s.mais_vulneravel || '—'}</td>
                <td className="whitespace-nowrap px-4 py-1.5 text-right">
                  <IconButton icone={FileText} rotulo={`PDF da simulação ${s.id}`} onClick={() => relatorioService.exportar('pdf', s.id)} />
                  <IconButton icone={FileSpreadsheet} rotulo={`CSV da simulação ${s.id}`} onClick={() => relatorioService.exportar('csv', s.id)} />
                  {ehAdmin(usuario) && <IconButton icone={Trash2} rotulo={`Excluir simulação ${s.id}`} variante="perigo" onClick={() => setExclusao(s)} />}
                </td>
              </tr>
            ))}
          </Tabela>
        )}
      </Card>
      {exclusao && (
        <ConfirmarExclusao
          titulo="Excluir simulação"
          mensagem={`Excluir a simulação #${exclusao.id} e seus resultados?`}
          msgOk={`Simulação #${exclusao.id} excluída.`}
          aoExcluir={() => simulacaoService.remover(exclusao.id)}
          aoConcluir={recarregar}
          aoCancelar={() => setExclusao(null)}
        />
      )}
    </>
  );
}
