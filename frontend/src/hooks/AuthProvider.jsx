/* eslint-disable react-refresh/only-export-components -- contexto, provider e hook ficam juntos de propósito */
import { createContext, useContext, useState } from 'react';
import { tokenStorage } from '../services/api';
import { authService } from '../services';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(tokenStorage.usuario);

  const login = async (email, senha) => {
    const { token, usuario: u } = await authService.login(email, senha);
    tokenStorage.salvar(token, u);
    setUsuario(u);
    return u;
  };

  const logout = () => {
    tokenStorage.limpar();
    setUsuario(null);
  };

  return <AuthContext.Provider value={{ usuario, login, logout }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth deve ser usado dentro de <AuthProvider>.');
  return ctx;
}
