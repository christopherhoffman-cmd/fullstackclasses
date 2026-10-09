export const API_URL = import.meta.env.VITE_API_URL || '/api';

export const tokenStorage = {
  obter: () => localStorage.getItem('topsis_token'),
  usuario: () => JSON.parse(localStorage.getItem('topsis_usuario')),
  salvar: (token, usuario) => {
    localStorage.setItem('topsis_token', token);
    localStorage.setItem('topsis_usuario', JSON.stringify(usuario));
  },
  limpar: () => {
    localStorage.removeItem('topsis_token');
    localStorage.removeItem('topsis_usuario');
  },
};

export class ApiError extends Error {
  constructor(mensagem, status) {
    super(mensagem);
    this.name = 'ApiError';
    this.status = status;
  }
}

async function requisicao(caminho, { metodo = 'GET', corpo, bruto = false, headers = {} } = {}) {
  const token = tokenStorage.obter();
  const opcoes = {
    method: metodo,
    headers: {
      ...(corpo !== undefined && typeof corpo !== 'string' ? { 'Content-Type': 'application/json' } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
  };
  if (corpo !== undefined) opcoes.body = typeof corpo === 'string' ? corpo : JSON.stringify(corpo);

  let resposta;
  try {
    resposta = await fetch(`${API_URL}${caminho}`, opcoes);
  } catch {
    throw new ApiError('Não foi possível conectar à API. Verifique se o backend está em execução.', 0);
  }

  if (resposta.status === 401 && token) {
    tokenStorage.limpar();
    window.location.assign('/login');
  }

  if (!resposta.ok) {
    const json = await resposta.json().catch(() => null);
    throw new ApiError(json?.erro || `Erro ${resposta.status}`, resposta.status);
  }

  if (bruto) return resposta;
  if (resposta.status === 204) return null;
  const json = await resposta.json();
  return json.dados;
}

export const api = {
  get: (caminho) => requisicao(caminho),
  post: (caminho, corpo, opcoes) => requisicao(caminho, { metodo: 'POST', corpo, ...opcoes }),
  put: (caminho, corpo) => requisicao(caminho, { metodo: 'PUT', corpo }),
  delete: (caminho) => requisicao(caminho, { metodo: 'DELETE' }),

  async baixar(caminho, nomePadrao) {
    const resposta = await requisicao(caminho, { bruto: true });
    const blob = await resposta.blob();
    const disposicao = resposta.headers.get('Content-Disposition') || '';
    const nome = /filename="?([^"]+)"?/.exec(disposicao)?.[1] || nomePadrao;
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = nome;
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    return nome;
  },
};
