import { useState } from 'react';
import { Upload, Download, CheckCircle2, AlertTriangle } from 'lucide-react';
import { importacaoService } from '../services';
import { comToast } from '../utils/toast';
import { Button, Card, PageHeader } from '../components/ui';

export default function ImportacaoPage() {
  const [arquivo, setArquivo] = useState(null);
  const [enviando, setEnviando] = useState(false);
  const [resultado, setResultado] = useState(null);

  const importar = async () => {
    const r = await comToast(
      async () => importacaoService.importarCsv(await arquivo.text()),
      (dados) => `Importação concluída: ${dados.criados} criados, ${dados.atualizados} atualizados.`,
      setEnviando
    );
    if (r) setResultado(r.dados);
  };

  return (
    <>
      <PageHeader titulo="Importação de dados" />

      <Card titulo="Importar CSV" className="max-w-3xl">
        <div className="space-y-4">
          <p className="text-sm text-slate-300">
            Separador <code className="text-amber-300">;</code>. Obrigatórias: <code className="text-amber-300">nome</code> e{' '}
            <code className="text-amber-300">uf</code>; opcionais: codigo_ibge, populacao, idh, latitude, longitude.
            <br />
            Indicadores: uma coluna por código do critério (C1, C2…). Municípios existentes (código IBGE ou nome + UF) são atualizados.
          </p>
          <input
            type="file"
            accept=".csv,text/csv,text/plain"
            aria-label="Arquivo CSV"
            onChange={(e) => {
              setArquivo(e.target.files[0] || null);
              setResultado(null);
            }}
            className="block w-full text-sm text-slate-300 file:mr-3 file:rounded-lg file:border-0 file:bg-slate-800 file:px-3 file:py-2 file:text-slate-200"
          />
          <div className="flex flex-wrap gap-2">
            <Button variante="primario" icone={Upload} carregando={enviando} disabled={!arquivo} onClick={importar}>
              Importar
            </Button>
            <Button icone={Download} onClick={() => comToast(importacaoService.modeloCsv)}>
              Baixar modelo CSV
            </Button>
          </div>
        </div>
      </Card>

      {resultado && (
        <Card titulo="Resultado" className="mt-6 max-w-3xl">
          <div className="space-y-2 text-sm">
            <p className="flex items-center gap-2 text-emerald-300">
              <CheckCircle2 className="h-4 w-4" /> {resultado.criados} criados • {resultado.atualizados} atualizados • {resultado.valores} valores
            </p>
            <p className="text-xs text-slate-400">Colunas de critérios reconhecidas: {resultado.colunas_criterios.join(', ') || 'nenhuma'}</p>
            {resultado.erros.length > 0 && (
              <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-3">
                <p className="mb-1 flex items-center gap-2 font-semibold text-amber-200">
                  <AlertTriangle className="h-4 w-4" /> {resultado.erros.length} linha(s) com erro
                </p>
                <ul className="max-h-40 space-y-0.5 overflow-y-auto text-xs text-amber-100">
                  {resultado.erros.map((e) => (
                    <li key={e.linha}>
                      Linha {e.linha}: {e.erro}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </Card>
      )}
    </>
  );
}
