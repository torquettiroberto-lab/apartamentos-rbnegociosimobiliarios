import type { ReactNode } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Container } from "@/components/layout/Container";
import { Notice } from "@/components/Notice";
import { useAuth } from "@/lib/auth-context";
import { supabaseConfigurado } from "@/lib/supabase";

/** Moldura do painel: exige login, avisa se o Supabase não está configurado. */
export function AdminLayout({ title, children }: { title: string; children: ReactNode }) {
  const { session, carregando, sair } = useAuth();
  const navigate = useNavigate();

  if (!supabaseConfigurado) {
    return (
      <Container className="py-12">
        <Notice title="Supabase não configurado">
          Defina VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY (veja o README) para usar o painel.
        </Notice>
      </Container>
    );
  }
  if (carregando) return <Container className="py-12"><p role="status">Carregando…</p></Container>;
  if (!session) return <Navigate to="/admin/login" replace />;

  return (
    <div className="min-h-screen bg-rb-canvas-alt">
      <Helmet>
        <title>{title} | Painel RB</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>
      <header className="border-b border-rb-stone-line bg-white">
        <Container className="flex h-16 items-center justify-between">
          <Link to="/admin" className="font-medium">Painel — Apartamentos</Link>
          <div className="flex items-center gap-4 text-sm">
            <Link to="/" className="underline underline-offset-4 hover:text-rb-teal-strong">Ver vitrine</Link>
            <button
              type="button"
              className="rounded-[4px] border border-rb-graphite px-3 py-1.5 font-medium hover:bg-rb-graphite hover:text-rb-canvas"
              onClick={async () => {
                await sair();
                navigate("/admin/login");
              }}
            >
              Sair
            </button>
          </div>
        </Container>
      </header>
      <Container className="py-8">{children}</Container>
    </div>
  );
}
