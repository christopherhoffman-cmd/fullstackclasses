import { useState } from 'react';
import { Plus, Pencil, Trash2, Save } from 'lucide-react';
import { usuarioService } from '../services';
import { useApi } from '../hooks/useApi';
import { useAuth } from '../hooks/AuthProvider';
import { comToast } from '../utils/toast';
import { Button, Card, ConfirmarExclusao, ErrorState, IconButton, Input, LoadingState, Modal, PageHeader, Select, Tabela } from '../components/ui';
import { PERFIS } from '../utils/perfis';
import { formatarData } from '../utils/format';

const VAZIO = { nome: '', email: '', perfil: 'pesquisador', senha: '' };

export default function UsuariosPage() {
  const { usuario: logado } = useAuth();
  const { dados, carregando, erro, recarregar } = useApi(() => usuarioService.listar());
  const [edicao, setEdicao] = useState(null); // { usuario } com o modal aberto
  const [form, setForm] = useState(VAZIO);
  const [salvando, setSalvando] = useState(false);
  const [exclusao, setExclusao] = useState(null);

  const abrir = (u) => {
    setEdicao({ usuario: u });
    setForm(u ? { nome: u.nome, email: u.email, perfil: u.perfil, senha: '' } : VAZIO);
  };

  const salvar = async (e) => {
    e.preventDefault();
    const novo = !edicao.usuario;
    const dadosForm = { ...form, senha: form.senha || undefined };
    const ok = await comToast(
      () => (novo ? usuarioService.criar(dadosForm) : usuarioService.atualizar(edicao.usuario.id, dadosForm)),
      novo ? 'Usuário criado.' : 'Usuário atualizado.',
      setSalvando
    );
    if (ok) {
      setEdicao(null);
      recarregar();
    }
  };

  if (carregando && !dados) return <LoadingState />;
  if (erro) return <ErrorState erro={erro} aoTentarNovamente={recarregar} />;

  const set = (campo) => (e) => setForm((f) => ({ ...f, [campo]: e.target.value }));

  return (
    <>
      <PageHeader
        titulo="Usuários"
        acoes={
          <Button variante="primario" icone={Plus} onClick={() => abrir(null)}>
            Novo usuário
          </Button>
        }
      />
      <Card semPadding>
        <Tabela largura="min-w-[640px]" colunas={['Nome', 'E-mail', 'Perfil', 'Criado em', { rotulo: 'Ações', className: 'text-right' }]}>
          {dados.map((u) => (
            <tr key={u.id} className="hover:bg-slate-800/30">
              <td className="px-4 py-2.5 font-medium text-white">
                {u.nome} {u.id === logado.id && <span className="text-xs text-amber-400">(você)</span>}
              </td>
              <td className="px-4 py-2.5 text-slate-300">{u.email}</td>
              <td className="px-4 py-2.5 text-slate-300">{PERFIS[u.perfil]}</td>
              <td className="px-4 py-2.5 text-slate-400">{formatarData(u.created_at)}</td>
              <td className="whitespace-nowrap px-4 py-1.5 text-right">
                <IconButton icone={Pencil} rotulo={`Editar ${u.nome}`} onClick={() => abrir(u)} />
                <IconButton icone={Trash2} rotulo={`Excluir ${u.nome}`} variante="perigo" disabled={u.id === logado.id} onClick={() => setExclusao(u)} />
              </td>
            </tr>
          ))}
        </Tabela>
      </Card>

      <Modal
        aberto={Boolean(edicao)}
        titulo={edicao?.usuario ? `Editar ${edicao.usuario.nome}` : 'Novo usuário'}
        aoFechar={() => setEdicao(null)}
        largura="max-w-lg"
        rodape={
          <>
            <Button onClick={() => setEdicao(null)}>Cancelar</Button>
            <Button variante="primario" icone={Save} type="submit" form="form-usuario" carregando={salvando}>
              Salvar
            </Button>
          </>
        }
      >
        <form id="form-usuario" onSubmit={salvar} className="space-y-4">
          <Input rotulo="Nome *" value={form.nome} onChange={set('nome')} required />
          <Input rotulo="E-mail *" type="email" value={form.email} onChange={set('email')} autoComplete="off" required />
          <Select rotulo="Perfil *" value={form.perfil} onChange={set('perfil')} required>
            {Object.entries(PERFIS).map(([valor, rotulo]) => (
              <option key={valor} value={valor}>
                {rotulo}
              </option>
            ))}
          </Select>
          <Input
            rotulo={edicao?.usuario ? 'Nova senha (deixe em branco para manter)' : 'Senha * (mínimo 6 caracteres)'}
            type="password"
            value={form.senha}
            onChange={set('senha')}
            autoComplete="new-password"
            minLength={6}
            required={!edicao?.usuario}
          />
        </form>
      </Modal>
      {exclusao && (
        <ConfirmarExclusao
          titulo="Excluir usuário"
          mensagem={`Excluir o usuário "${exclusao.nome}"? As simulações dele serão mantidas sem responsável.`}
          msgOk="Usuário excluído."
          aoExcluir={() => usuarioService.remover(exclusao.id)}
          aoConcluir={recarregar}
          aoCancelar={() => setExclusao(null)}
        />
      )}
    </>
  );
}
