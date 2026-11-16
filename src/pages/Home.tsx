import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Container } from "@/components/layout/Container";
import { SiteLayout } from "@/components/layout/SiteLayout";
import { Seo } from "@/components/Seo";
import { PropertyCard } from "@/components/PropertyCard";
import { ListaEstado } from "@/components/ListaEstado";
import { FILTRO_PRECO_OPCOES, formatPreco, listarBairros } from "@/lib/apartamentos";
import { usePublicos } from "@/lib/use-publicos";
import { whatsappGeralUrl } from "@/lib/whatsapp";

const campo =
  "h-12 w-full rounded-[4px] border border-rb-line-dark bg-rb-ink-800 px-3 text-sm text-rb-cream focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rb-teal-on-dark";

export default function Home() {
  const { lista, carregando, erro, configurado } = usePublicos();
  const navigate = useNavigate();
  const [bairro, setBairro] = useState("");
  const [quartos, setQuartos] = useState("");
  const [preco, setPreco] = useState("");
  const destaques = lista.filter((a) => a.destaque).slice(0, 6);
  const exibidos = destaques.length > 0 ? destaques : lista.slice(0, 6);

  const buscar = (e: React.FormEvent) => {
    e.preventDefault();
    const p = new URLSearchParams();
    if (bairro) p.set("bairro", bairro);
    if (quartos) p.set("quartos", quartos);
    if (preco) p.set("preco", preco);
    const q = p.toString();
    navigate(`/apartamentos${q ? `?${q}` : ""}`);
  };

  return (
    <SiteLayout>
      <Seo
        title="Apartamentos à venda | RB Negócios Imobiliários"
        description="Apartamentos à venda selecionados pela RB Negócios Imobiliários. Veja fotos, valores e fale direto pelo WhatsApp."
      />
      <section className="bg-rb-ink-900 py-14 text-rb-cream md:py-24">
        <Container>
          <p className="mb-4 text-xs font-medium uppercase tracking-[0.28em] text-rb-teal-on-dark">Apartamentos à venda</p>
          <h1 className="max-w-3xl font-rb-serif text-[2rem] leading-[1.12] sm:text-4xl md:text-5xl">
            Encontre o apartamento certo, com quem conhece o mercado.
          </h1>
          <form onSubmit={buscar} className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4" aria-label="Buscar apartamentos">
            <label className="block text-xs font-medium uppercase tracking-wide text-rb-cream-muted">
              Bairro
              <select className={campo + " mt-1.5"} value={bairro} onChange={(e) => setBairro(e.target.value)}>
                <option value="">Todos</option>
                {listarBairros(lista).map((b) => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>
            </label>
            <label className="block text-xs font-medium uppercase tracking-wide text-rb-cream-muted">
              Quartos
              <select className={campo + " mt-1.5"} value={quartos} onChange={(e) => setQuartos(e.target.value)}>
                <option value="">Qualquer</option>
                {[1, 2, 3, 4].map((n) => (
                  <option key={n} value={n}>{n}+</option>
                ))}
              </select>
            </label>
            <label className="block text-xs font-medium uppercase tracking-wide text-rb-cream-muted">
              Preço até
              <select className={campo + " mt-1.5"} value={preco} onChange={(e) => setPreco(e.target.value)}>
                <option value="">Qualquer</option>
                {FILTRO_PRECO_OPCOES.map((p) => (
                  <option key={p} value={p}>{formatPreco(p)}</option>
                ))}
              </select>
            </label>
            <button type="submit" className="h-12 self-end rounded-[4px] bg-rb-teal-strong px-6 text-sm font-medium text-rb-cream hover:bg-rb-teal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rb-cream">
              Buscar apartamentos
            </button>
          </form>
        </Container>
      </section>

      <section className="py-14 md:py-20">
        <Container>
          <div className="mb-8 flex items-end justify-between gap-4">
            <h2 className="font-rb-serif text-3xl md:text-4xl">{destaques.length > 0 ? "Em destaque" : "Apartamentos"}</h2>
            <Link to="/apartamentos" className="text-sm font-medium text-rb-teal-strong underline underline-offset-4">
              Ver todos →
            </Link>
          </div>
          <ListaEstado configurado={configurado} carregando={carregando} erro={erro} />
          {configurado && !carregando && !erro && exibidos.length === 0 && (
            <p className="text-rb-stone">Nenhum apartamento disponível no momento. Fale com a gente pelo WhatsApp.</p>
          )}
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {exibidos.map((a) => (
              <PropertyCard key={a.id} ap={a} />
            ))}
          </div>
        </Container>
      </section>

      <section className="bg-rb-canvas-alt py-14 md:py-20">
        <Container className="flex flex-col items-start gap-6 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="font-rb-serif text-3xl md:text-4xl">Não achou o que procura?</h2>
            <p className="mt-3 max-w-xl text-rb-stone">Conte o que você busca e a RB procura as melhores opções para você.</p>
          </div>
          <a
            href={whatsappGeralUrl()}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-12 items-center rounded-[4px] bg-rb-teal-strong px-7 text-base font-medium text-rb-cream hover:bg-rb-ink-900"
          >
            Falar no WhatsApp
          </a>
        </Container>
      </section>
    </SiteLayout>
  );
}
