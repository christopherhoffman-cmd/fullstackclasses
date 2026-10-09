import { useCallback, useEffect, useState } from 'react';

// Executa `carregar` ao montar (e quando `chave` mudar); `recarregar` repete a chamada.
export function useApi(carregar, chave) {
  const [estado, setEstado] = useState({ dados: null, carregando: true, erro: null });

  const executar = useCallback(() => {
    let ativo = true;
    carregar().then(
      (dados) => ativo && setEstado({ dados, carregando: false, erro: null }),
      (erro) => ativo && setEstado((s) => ({ ...s, carregando: false, erro }))
    );
    return () => {
      ativo = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chave]);

  useEffect(() => executar(), [executar]);

  const recarregar = () => {
    setEstado((s) => ({ ...s, carregando: true, erro: null }));
    executar();
  };

  return { ...estado, recarregar };
}
