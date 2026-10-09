export const PERFIS = {
  admin: 'Administrador',
  pesquisador: 'Pesquisador',
  gestor: 'Gestor Público',
};

export const podeEditarDados = (usuario) => ['admin', 'pesquisador'].includes(usuario?.perfil);
export const ehAdmin = (usuario) => usuario?.perfil === 'admin';
