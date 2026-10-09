import { useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { LogIn, Zap } from 'lucide-react';
import { useAuth } from '../hooks/AuthProvider';
import { Button, Input } from '../components/ui';

export default function LoginPage() {
  const { usuario, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: '', senha: '' });
  const [erro, setErro] = useState('');
  const [enviando, setEnviando] = useState(false);

  if (usuario) return <Navigate to={location.state?.de || '/'} replace />;

  const enviar = async (e) => {
    e.preventDefault();
    setErro('');
    if (!form.email || !form.senha) {
      setErro('Informe e-mail e senha.');
      return;
    }
    setEnviando(true);
    try {
      await login(form.email, form.senha);
      navigate(location.state?.de || '/', { replace: true });
    } catch (err) {
      setErro(err.message);
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(ellipse_at_top,rgba(251,191,36,0.08),transparent_60%)] px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="mb-4 rounded-2xl border border-amber-500/20 bg-amber-500/10 p-4">
            <Zap className="h-10 w-10 text-amber-400" aria-hidden />
          </div>
          <h1 className="text-2xl font-bold text-white">Plataforma de Energia Renovável</h1>
          <p className="mt-2 text-sm text-slate-400">Análise multicritério de vulnerabilidade social energética (TOPSIS)</p>
        </div>

        <form onSubmit={enviar} className="space-y-4 rounded-2xl border border-slate-800 bg-slate-900/70 p-6 shadow-2xl" noValidate>
          <Input
            rotulo="E-mail"
            type="email"
            autoComplete="username"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            placeholder="seu.email@instituicao.br"
            autoFocus
          />
          <Input
            rotulo="Senha"
            type="password"
            autoComplete="current-password"
            value={form.senha}
            onChange={(e) => setForm({ ...form, senha: e.target.value })}
          />
          {erro && (
            <p role="alert" className="rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-200">
              {erro}
            </p>
          )}
          <Button type="submit" variante="primario" icone={LogIn} carregando={enviando} className="w-full">
            Entrar
          </Button>
        </form>
      </div>
    </div>
  );
}
