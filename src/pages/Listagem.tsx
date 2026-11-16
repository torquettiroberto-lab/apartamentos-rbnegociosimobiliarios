import { useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { Container } from "@/components/layout/Container";
import { SiteLayout } from "@/components/layout/SiteLayout";
import { Seo } from "@/components/Seo";
import { PropertyCard } from "@/components/PropertyCard";
import { PropertyFilters } from "@/components/PropertyFilters";
import { ListaEstado } from "@/components/ListaEstado";
import { filtrarApartamentos, filtrosDeParams, listarBairros, type Filtros } from "@/lib/apartamentos";
import { usePublicos } from "@/lib/use-publicos";

function paraParams(f: Filtros): URLSearchParams {
  const p = new URLSearchParams();
  if (f.bairro) p.set("bairro", f.bairro);
  if (f.quartosMin) p.set("quartos", String(f.quartosMin));
  if (f.vagasMin) p.set("vagas", String(f.vagasMin));
  if (f.precoMax) p.set("preco", String(f.precoMax));
  return p;
}

export default function Listagem() {
  const { lista, carregando, erro, configurado } = usePublicos();
  const [params, setParams] = useSearchParams();
  const filtros = useMemo(() => filtrosDeParams(params), [params]);
  const bairros = useMemo(() => listarBairros(lista), [lista]);
  const filtrados = useMemo(() => filtrarApartamentos(lista, filtros), [lista, filtros]);

  return (
    <SiteLayout>
      <Seo
        title="Apartamentos à venda | RB Negócios Imobiliários"
        description="Lista de apartamentos à venda com fotos, valores e detalhes. Filtre por bairro, quartos, vagas e preço."
        path="/apartamentos"
      />
      <section className="bg-rb-ink-900 py-12 text-rb-cream md:py-16">
        <Container>
          <h1 className="font-rb-serif text-4xl md:text-5xl">Apartamentos à venda</h1>
        </Container>
      </section>
      <section className="py-10 md:py-14">
        <Container className="space-y-8">
          <PropertyFilters bairros={bairros} valor={filtros} onChange={(f) => setParams(paraParams(f))} onLimpar={() => setParams({})} />
          <ListaEstado configurado={configurado} carregando={carregando} erro={erro} />
          {configurado && !carregando && !erro && (
            <p className="text-sm text-rb-stone" role="status" aria-live="polite">
              {filtrados.length === 1 ? "1 apartamento encontrado" : `${filtrados.length} apartamentos encontrados`}
            </p>
          )}
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filtrados.map((a) => (
              <PropertyCard key={a.id} ap={a} />
            ))}
          </div>
        </Container>
      </section>
    </SiteLayout>
  );
}
