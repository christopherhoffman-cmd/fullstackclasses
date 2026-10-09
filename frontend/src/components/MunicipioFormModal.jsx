import { useState } from 'react';
import { Save } from 'lucide-react';
import { municipioService } from '../services';
import { comToast } from '../utils/toast';
import { Button, Input, Modal, Select, TipoBadge } from './ui';
import { paraNumero } from '../utils/format';

const UFS = 'AC AL AP AM BA CE DF ES GO MA MT MS MG PA PB PR PE PI RJ RN RS RO RR SC SP SE TO'.split(' ');

const VAZIO = { nome: '', uf: 'BA', codigo_ibge: '', populacao: '', idh: '', latitude: '', longitude: '', valores: {} };

const paraTexto = (v) => (v === null || v === undefined ? '' : String(v));

function formDoMunicipio(m) {
  if (!m) return VAZIO;
  return {
    nome: m.nome,
    uf: m.uf,
    codigo_ibge: paraTexto(m.codigo_ibge),
    populacao: paraTexto(m.populacao),
    idh: paraTexto(m.idh),
    latitude: paraTexto(m.latitude),
    longitude: paraTexto(m.longitude),
    valores: Object.fromEntries(Object.entries(m.valores || {}).map(([k, v]) => [k, paraTexto(v)])),
  };
}

export default function MunicipioFormModal({ municipio, criterios, aoFechar, aoSalvar }) {
  const [form, setForm] = useState(() => formDoMunicipio(municipio));
  const [salvando, setSalvando] = useState(false);

  const set = (campo) => (e) => setForm((f) => ({ ...f, [campo]: e.target.value }));
  const setValor = (id) => (e) => setForm((f) => ({ ...f, valores: { ...f.valores, [id]: e.target.value } }));

  const salvar = async (e) => {
    e.preventDefault();
    const dados = {
      nome: form.nome.trim(),
      uf: form.uf,
      codigo_ibge: form.codigo_ibge ? Number(form.codigo_ibge) : null,
      populacao: paraNumero(form.populacao),
      idh: paraNumero(form.idh),
      latitude: paraNumero(form.latitude),
      longitude: paraNumero(form.longitude),
      valores: Object.fromEntries(criterios.map((c) => [c.id, paraNumero(form.valores[c.id])])),
    };
    const salvo = await comToast(
      () => (municipio ? municipioService.atualizar(municipio.id, dados) : municipioService.criar(dados)),
      municipio ? 'Município atualizado.' : 'Município cadastrado.',
      setSalvando
    );
    if (salvo) aoSalvar();
  };

  return (
    <Modal
      aberto
      titulo={municipio ? `Editar ${municipio.nome}` : 'Novo município'}
      aoFechar={aoFechar}
      largura="max-w-3xl"
      rodape={
        <>
          <Button onClick={aoFechar}>Cancelar</Button>
          <Button variante="primario" icone={Save} carregando={salvando} type="submit" form="form-municipio">
            Salvar
          </Button>
        </>
      }
    >
      <form id="form-municipio" onSubmit={salvar} className="space-y-5">
        <fieldset className="grid grid-cols-1 gap-4 sm:grid-cols-6">
          <legend className="mb-2 text-sm font-semibold text-slate-200">Dados socioeconômicos</legend>
          <Input rotulo="Nome *" value={form.nome} onChange={set('nome')} className="sm:col-span-4" maxLength={200} required />
          <Select rotulo="UF *" value={form.uf} onChange={set('uf')} className="sm:col-span-2" required>
            {UFS.map((uf) => (
              <option key={uf}>{uf}</option>
            ))}
          </Select>
          <Input rotulo="Código IBGE (7 dígitos)" inputMode="numeric" pattern="\d{7}" value={form.codigo_ibge} onChange={set('codigo_ibge')} className="sm:col-span-2" />
          <Input rotulo="População" type="number" min="0" step="1" value={form.populacao} onChange={set('populacao')} className="sm:col-span-2" />
          <Input rotulo="IDH (0–1)" type="number" min="0" max="1" step="any" value={form.idh} onChange={set('idh')} className="sm:col-span-2" />
          <Input rotulo="Latitude" type="number" min="-90" max="90" step="any" value={form.latitude} onChange={set('latitude')} className="sm:col-span-3" />
          <Input rotulo="Longitude" type="number" min="-180" max="180" step="any" value={form.longitude} onChange={set('longitude')} className="sm:col-span-3" />
        </fieldset>

        <fieldset>
          <legend className="mb-1 text-sm font-semibold text-slate-200">Indicadores (matriz de decisão)</legend>
          <p className="mb-3 text-xs text-slate-400">
            Municípios sem valor em algum critério com peso &gt; 0 ficam fora do cálculo TOPSIS.
          </p>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {criterios.map((c) => (
              <Input
                key={c.id}
                rotulo={
                  <span className="flex items-center gap-2">
                    {c.nome} {c.unidade && <span className="text-slate-500">({c.unidade})</span>} <TipoBadge tipo={c.tipo} />
                  </span>
                }
                type="number"
                step="any"
                value={form.valores[c.id] ?? ''}
                onChange={setValor(c.id)}
              />
            ))}
          </div>
        </fieldset>
      </form>
    </Modal>
  );
}
