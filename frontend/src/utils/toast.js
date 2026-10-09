// Notificações simples via alert do navegador.
export const toast = {
  sucesso: (mensagem) => alert(mensagem),
  erro: (mensagem) => alert(mensagem),
};

// Executa `fn` mostrando toast de sucesso (`msgOk`: texto ou função do resultado) ou de erro.
// `setCarregando` (opcional) recebe true/false durante a chamada.
// Retorna `{ dados }` em caso de sucesso e `null` em caso de erro.
export async function comToast(fn, msgOk, setCarregando) {
  setCarregando?.(true);
  try {
    const dados = await fn();
    if (msgOk) toast.sucesso(typeof msgOk === 'function' ? msgOk(dados) : msgOk);
    return { dados };
  } catch (e) {
    toast.erro(e.message);
    return null;
  } finally {
    setCarregando?.(false);
  }
}
