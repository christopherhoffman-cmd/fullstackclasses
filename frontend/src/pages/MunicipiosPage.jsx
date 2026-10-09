import { useState } from 'react';
import { Plus, Pencil, Trash2, Search } from 'lucide-react';
import { criterioService, municipioService } from '../services';
import { useApi } from '../hooks/useApi';
import { useAuth } from '../hooks/AuthProvider';
import {
  Button, Card, ConfirmarExclusao, EmptyState, ErrorState, IconButton, Input, LoadingState, PageHeader, Tabela,
} from '../components/ui';
import MunicipioFormModal from '../components/MunicipioFormModal';
import { formatarInteiro, formatarNumero } from '../utils/format';
import { podeEditarDados } from '../utils/perfis';

export default function MunicipiosPage() {
  const { usuario } = useAuth();
  const editavel = podeEditarDados(usuario);
  const [busca, setBusca] = useState('');
  const [edicao, setEdicao] = useState(null); // { municipio } com o modal aberto
  const [exclusao, setExclusao] = useState(null);

  const { dados, carregando, erro, recarregar } = useApi(async () => {
    const [municipios, criterios] = await Promise.all([municipioService.listar(), criterioService.listar()]);
    return { municipios, criterios };
  });

  if (carregando && !dados) return <LoadingState />;
  if (erro) return <ErrorState erro={erro} aoTentarNovamente={recarregar} />;

  const { criterios } = dados;
  const filtrados = dados.municipios.filter((m) => m.nome.toLowerCase().includes(busca.trim().toLowerCase()));

  return (
    <>
      <PageHeader
        titulo="Municípios"
        acoes={
          editavel && (
            <Button variante="primario" icone={Plus} onClick={() => setEdicao({ municipio: null })}>
              Novo município
            </Button>
          )
        }
      />

      <Card semPadding>
        <div className="relative border-b border-slate-800 p-4">
          <Search className="pointer-events-none absolute left-7 top-7 h-4 w-4 text-slate-500" aria-hidden />
          <Input placeholder="Buscar por nome…" value={busca} onChange={(e) => setBusca(e.target.value)} aria-label="Buscar município" className="[&_input]:pl-9" />
        </div>

        {filtrados.length === 0 ? (
          <EmptyState titulo="Nenhum município encontrado" descricao={busca ? 'Ajuste a busca.' : 'Cadastre o primeiro município.'} />
        ) : (
          <Tabela
            largura="min-w-[640px]"
            colunas={[
              'Município',
              'Código IBGE',
              { rotulo: 'População', className: 'text-right' },
              { rotulo: 'IDH', className: 'text-right' },
              'Coordenadas',
              editavel && { rotulo: 'Ações', className: 'text-right' },
            ]}
          >
            {filtrados.map((m) => (
              <tr key={m.id} className="hover:bg-slate-800/30">
                <td className="px-4 py-3 font-medium text-white">
                  {m.nome} <span className="text-slate-500">— {m.uf}</span>
                </td>
                <td className="px-4 py-3 font-mono text-xs text-slate-400">{m.codigo_ibge || '—'}</td>
                <td className="px-4 py-3 text-right text-slate-300">{formatarInteiro(m.populacao)}</td>
                <td className="px-4 py-3 text-right text-slate-300">{formatarNumero(m.idh, 3, { fixo: true })}</td>
                <td className="px-4 py-3 font-mono text-xs text-slate-400">
                  {m.latitude !== null && m.longitude !== null ? `${formatarNumero(m.latitude, 4)}, ${formatarNumero(m.longitude, 4)}` : '—'}
                </td>
                {editavel && (
                  <td className="whitespace-nowrap px-4 py-2 text-right">
                    <IconButton icone={Pencil} rotulo={`Editar ${m.nome}`} onClick={() => setEdicao({ municipio: m })} />
                    <IconButton icone={Trash2} rotulo={`Excluir ${m.nome}`} variante="perigo" onClick={() => setExclusao(m)} />
                  </td>
                )}
              </tr>
            ))}
          </Tabela>
        )}
      </Card>

      {edicao && (
        <MunicipioFormModal
          municipio={edicao.municipio}
          criterios={criterios}
          aoFechar={() => setEdicao(null)}
          aoSalvar={() => {
            setEdicao(null);
            recarregar();
          }}
        />
      )}
      {exclusao && (
        <ConfirmarExclusao
          titulo="Excluir município"
          mensagem={`Excluir "${exclusao.nome}"? Os valores da matriz e os resultados de simulações deste município também serão removidos.`}
          msgOk={`${exclusao.nome} excluído.`}
          aoExcluir={() => municipioService.remover(exclusao.id)}
          aoConcluir={recarregar}
          aoCancelar={() => setExclusao(null)}
        />
      )}
    </>
  );
}
