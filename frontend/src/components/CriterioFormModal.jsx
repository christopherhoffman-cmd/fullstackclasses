import { useState } from 'react';
import { Save } from 'lucide-react';
import { criterioService } from '../services';
import { comToast } from '../utils/toast';
import { Button, Input, Modal, Select } from './ui';

const VAZIO = { codigo: '', nome: '', descricao: '', tipo: 'beneficio', peso: '0', unidade: '', fonte: '' };

export default function CriterioFormModal({ criterio, aoFechar, aoSalvar }) {
  const [form, setForm] = useState(() =>
    criterio
      ? {
          codigo: criterio.codigo || '',
          nome: criterio.nome,
          descricao: criterio.descricao || '',
          tipo: criterio.tipo,
          peso: String(criterio.peso ?? 0),
          unidade: criterio.unidade || '',
          fonte: criterio.fonte || '',
        }
      : VAZIO
  );
  const [salvando, setSalvando] = useState(false);

  const set = (campo) => (e) => setForm((f) => ({ ...f, [campo]: e.target.value }));

  const salvar = async (e) => {
    e.preventDefault();
    const dados = { ...form, peso: Number(form.peso) };
    const salvo = await comToast(
      () => (criterio ? criterioService.atualizar(criterio.id, dados) : criterioService.criar(dados)),
      criterio ? 'Critério atualizado.' : 'Critério cadastrado.',
      setSalvando
    );
    if (salvo) aoSalvar();
  };

  return (
    <Modal
      aberto
      titulo={criterio ? `Editar ${criterio.codigo || criterio.nome}` : 'Novo critério'}
      aoFechar={aoFechar}
      rodape={
        <>
          <Button onClick={aoFechar}>Cancelar</Button>
          <Button variante="primario" icone={Save} carregando={salvando} type="submit" form="form-criterio">
            Salvar
          </Button>
        </>
      }
    >
      <form id="form-criterio" onSubmit={salvar} className="grid grid-cols-1 gap-4 sm:grid-cols-6">
        <Input rotulo="Código" placeholder="C8" value={form.codigo} onChange={set('codigo')} className="sm:col-span-2" maxLength={10} />
        <Input rotulo="Nome *" value={form.nome} onChange={set('nome')} className="sm:col-span-4" maxLength={150} required />
        <Input rotulo="Descrição / indicador" value={form.descricao} onChange={set('descricao')} className="sm:col-span-6" />
        <Select rotulo="Tipo * (benefício: maior é melhor; custo: menor é melhor)" value={form.tipo} onChange={set('tipo')} className="sm:col-span-6" required>
          <option value="beneficio">Benefício</option>
          <option value="custo">Custo</option>
        </Select>
        <Input rotulo="Peso (0–1) *" type="number" min="0" max="1" step="any" value={form.peso} onChange={set('peso')} className="sm:col-span-2" required />
        <Input rotulo="Unidade" placeholder="%" value={form.unidade} onChange={set('unidade')} className="sm:col-span-2" maxLength={50} />
        <Input rotulo="Fonte" placeholder="IBGE, ANEEL, INPE…" value={form.fonte} onChange={set('fonte')} className="sm:col-span-2" maxLength={50} />
      </form>
    </Modal>
  );
}
