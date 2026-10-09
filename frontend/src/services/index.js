import { api } from './api';
import { comToast } from '../utils/toast';

export const authService = {
  login: (email, senha) => api.post('/auth/login', { email, senha }),
};

export const municipioService = {
  listar: () => api.get('/municipios'),
  criar: (dados) => api.post('/municipios', dados),
  atualizar: (id, dados) => api.put(`/municipios/${id}`, dados),
  remover: (id) => api.delete(`/municipios/${id}`),
};

export const criterioService = {
  listar: () => api.get('/criterios'),
  criar: (dados) => api.post('/criterios', dados),
  atualizar: (id, dados) => api.put(`/criterios/${id}`, dados),
  salvarPesos: (pesos) => api.put('/criterios/pesos', { pesos }),
  remover: (id) => api.delete(`/criterios/${id}`),
};

export const topsisService = {
  executar: (parametros) => api.post('/topsis/executar', parametros),
};

export const simulacaoService = {
  listar: (limite = 100) => api.get(`/simulacoes?limite=${limite}`),
  ultima: () => api.get('/simulacoes/ultima'),
  obter: (id) => api.get(`/simulacoes/${id}`),
  remover: (id) => api.delete(`/simulacoes/${id}`),
};

export const relatorioService = {
  pdf: (id) => api.baixar(`/relatorios/${id}/pdf`, `simulacao-${id}.pdf`),
  csv: (id) => api.baixar(`/relatorios/${id}/csv`, `simulacao-${id}.csv`),
  exportar: (formato, id) => comToast(() => relatorioService[formato](id), (nome) => `Relatório ${nome} gerado.`),
};

export const importacaoService = {
  modeloCsv: () => api.baixar('/importacao/modelo-csv', 'modelo-importacao.csv'),
  importarCsv: (conteudo) => api.post('/importacao/csv', { conteudo }),
};

export const usuarioService = {
  listar: () => api.get('/usuarios'),
  criar: (dados) => api.post('/usuarios', dados),
  atualizar: (id, dados) => api.put(`/usuarios/${id}`, dados),
  remover: (id) => api.delete(`/usuarios/${id}`),
};
