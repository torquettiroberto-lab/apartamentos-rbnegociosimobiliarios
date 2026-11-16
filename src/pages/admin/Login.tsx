import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Container } from "@/components/layout/Container";
import { Notice } from "@/components/Notice";
import { useAuth } from "@/lib/auth-context";
import { supabaseConfigurado } from "@/lib/supabase";

const campo =
  "mt-1.5 h-11 w-full rounded-[4px] border border-rb-stone-line bg-white px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rb-teal-strong";

export default function Login() {
  const { session, entrar } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  if (session) return <Navigate to="/admin" replace />;

  const enviar = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro(null);
    setEnviando(true);
    try {
      await entrar(email.trim(), senha);
      navigate("/admin");
    } catch {
      setErro("E-mail ou senha inválidos.");
    } finally {
      setEnviando(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center bg-rb-canvas-alt py-12">
      <Helmet>
        <title>Entrar | Painel RB</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>
      <Container className="max-w-md">
        <h1 className="font-rb-serif text-3xl">Painel de apartamentos</h1>
        {!supabaseConfigurado ? (
          <div className="mt-6"><Notice title="Supabase não configurado">Configure as variáveis de ambiente (veja o README).</Notice></div>
        ) : (
          <form onSubmit={enviar} className="mt-6 space-y-4 rounded-[4px] border border-rb-stone-line bg-white p-6">
            <label className="block text-sm font-medium">
              E-mail
              <input type="email" required autoComplete="username" className={campo} value={email} onChange={(e) => setEmail(e.target.value)} />
            </label>
            <label className="block text-sm font-medium">
              Senha
              <input type="password" required autoComplete="current-password" className={campo} value={senha} onChange={(e) => setSenha(e.target.value)} />
            </label>
            {erro && <p role="alert" className="text-sm text-red-800">{erro}</p>}
            <button type="submit" disabled={enviando} className="h-11 w-full rounded-[4px] bg-rb-teal-strong text-sm font-medium text-rb-cream hover:bg-rb-ink-900 disabled:opacity-60">
              {enviando ? "Entrando…" : "Entrar"}
            </button>
          </form>
        )}
      </Container>
    </main>
  );
}
