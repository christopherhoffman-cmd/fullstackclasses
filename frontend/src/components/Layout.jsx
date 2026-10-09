import { useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import {
  LayoutDashboard, MapPin, Sliders, Play, History, Map, Upload, Users, LogOut, Menu, X, Zap,
} from 'lucide-react';
import { useAuth } from '../hooks/AuthProvider';
import { PERFIS, ehAdmin, podeEditarDados } from '../utils/perfis';

const ITENS = [
  { para: '/', rotulo: 'Dashboard', icone: LayoutDashboard, fim: true },
  { para: '/municipios', rotulo: 'Municípios', icone: MapPin },
  { para: '/criterios', rotulo: 'Configuração TOPSIS', icone: Sliders },
  { para: '/executar', rotulo: 'Executar TOPSIS', icone: Play },
  { para: '/simulacoes', rotulo: 'Histórico', icone: History },
  { para: '/mapa', rotulo: 'Mapa', icone: Map },
  { para: '/importacao', rotulo: 'Importação', icone: Upload, permitido: podeEditarDados },
  { para: '/usuarios', rotulo: 'Usuários', icone: Users, permitido: ehAdmin },
];

function Navegacao({ usuario, aoNavegar }) {
  return (
    <nav className="flex flex-1 flex-col gap-1" aria-label="Menu principal">
      {ITENS.filter((i) => !i.permitido || i.permitido(usuario)).map(({ para, rotulo, icone: Icone, fim }) => (
        <NavLink
          key={para}
          to={para}
          end={fim}
          onClick={aoNavegar}
          className={({ isActive }) =>
            `flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${
              isActive ? 'bg-amber-400/10 font-semibold text-amber-300' : 'text-slate-300 hover:bg-slate-800 hover:text-white'
            }`
          }
        >
          <Icone className="h-4 w-4" aria-hidden />
          {rotulo}
        </NavLink>
      ))}
    </nav>
  );
}

function Marca() {
  return (
    <div className="flex items-center gap-3">
      <div className="rounded-xl border border-amber-500/20 bg-amber-500/10 p-2">
        <Zap className="h-5 w-5 text-amber-400" aria-hidden />
      </div>
      <div className="leading-tight">
        <p className="text-sm font-bold text-white">Energia Renovável</p>
        <p className="text-[11px] text-slate-400">Vulnerabilidade • TOPSIS</p>
      </div>
    </div>
  );
}

export default function Layout() {
  const { usuario, logout } = useAuth();
  const [menuAberto, setMenuAberto] = useState(false);
  const fechar = () => setMenuAberto(false);

  return (
    <div className="min-h-screen lg:flex">
      <header className="sticky top-0 z-[1000] flex items-center justify-between border-b border-slate-800 bg-slate-950/95 px-4 py-3 backdrop-blur lg:hidden">
        <span className="text-sm font-bold text-white">Energia Renovável • TOPSIS</span>
        <button onClick={() => setMenuAberto(true)} className="rounded-lg p-2 text-slate-300 hover:bg-slate-800" aria-label="Abrir menu">
          <Menu className="h-5 w-5" />
        </button>
      </header>

      {menuAberto && <div className="fixed inset-0 z-[1100] bg-black/60 lg:hidden" onClick={fechar} />}

      {/* Sidebar única: drawer no mobile, fixa a partir de lg */}
      <aside
        className={`fixed inset-y-0 left-0 z-[1200] flex w-72 max-w-[85vw] flex-col gap-6 border-r border-slate-800 bg-slate-950 p-4 transition-transform lg:sticky lg:top-0 lg:z-auto lg:h-screen lg:w-64 lg:max-w-none lg:shrink-0 lg:translate-x-0 ${
          menuAberto ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between">
          <Marca />
          <button onClick={fechar} className="rounded-lg p-2 text-slate-300 hover:bg-slate-800 lg:hidden" aria-label="Fechar menu">
            <X className="h-5 w-5" />
          </button>
        </div>
        <Navegacao usuario={usuario} aoNavegar={fechar} />
        <div className="border-t border-slate-800 pt-4">
          <p className="truncate text-sm font-medium text-white">{usuario?.nome}</p>
          <p className="truncate text-xs text-slate-400">{PERFIS[usuario?.perfil]}</p>
          <button
            onClick={logout}
            className="mt-3 flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-300 hover:bg-slate-800 hover:text-white"
          >
            <LogOut className="h-4 w-4" aria-hidden /> Sair
          </button>
        </div>
      </aside>

      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 sm:px-6 lg:px-8">
        <Outlet />
      </main>
    </div>
  );
}
