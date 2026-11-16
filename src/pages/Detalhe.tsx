import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { BedDouble, Bath, Car, Ruler } from "lucide-react";
import { Container } from "@/components/layout/Container";
import { SiteLayout } from "@/components/layout/SiteLayout";
import { Seo } from "@/components/Seo";
import { Notice } from "@/components/Notice";
import { PropertyGallery } from "@/components/PropertyGallery";
import { formatArea, formatPreco, plural, type Apartamento } from "@/lib/apartamentos";
import { obterPorCodigo } from "@/lib/repositorio";
import { supabaseConfigurado } from "@/lib/supabase";
import { whatsappApartamentoUrl } from "@/lib/whatsapp";
import NotFound from "@/pages/NotFound";

export default function Detalhe() {
  const { codigo = "" } = useParams();
  const [ap, setAp] = useState<Apartamento | null>(null);
  const [carregando, setCarregando] = useState(supabaseConfigurado);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    if (!supabaseConfigurado) return;
    let ativo = true;
    setCarregando(true);
    obterPorCodigo(codigo)
      .then((d) => ativo && setAp(d))
      .catch((e: Error) => ativo && setErro(e.message))
      .finally(() => ativo && setCarregando(false));
    return () => {
      ativo = false;
    };
  }, [codigo]);

  if (supabaseConfigurado && !carregando && !erro && !ap) return <NotFound />;

  return (
    <SiteLayout>
      <Container className="py-8 md:py-12">
        <Link to="/apartamentos" className="text-sm font-medium text-rb-teal-strong underline underline-offset-4">
          ← Voltar para os apartamentos
        </Link>
        {!supabaseConfigurado && <div className="mt-6"><Notice title="Vitrine em configuração" /></div>}
        {carregando && <p className="mt-6 text-rb-stone" role="status">Carregando…</p>}
        {erro && <div className="mt-6"><Notice title="Não foi possível carregar este apartamento" tone="erro" /></div>}
        {ap && (
          <>
            <Seo
              title={`${ap.titulo} | RB Negócios Imobiliários`}
              description={`${ap.titulo} em ${ap.bairro}, ${ap.cidade}. ${ap.quartos} quartos, ${formatArea(ap.area_privativa)}, ${formatPreco(ap.preco)}.`}
              path={`/apartamentos/${encodeURIComponent(ap.codigo)}`}
            />
            <div className="mt-6 grid gap-10 lg:grid-cols-[1.4fr_1fr]">
              <PropertyGallery fotos={ap.fotos} titulo={ap.titulo} status={ap.status} />
              <div>
                <p className="text-xs uppercase tracking-[0.16em] text-rb-stone">Código {ap.codigo}</p>
                <h1 className="mt-2 font-rb-serif text-3xl leading-tight md:text-4xl">{ap.titulo}</h1>
                <p className="mt-2 text-rb-stone">{ap.bairro}, {ap.cidade}</p>
                <p className="mt-6 font-rb-serif text-4xl">{formatPreco(ap.preco)}</p>
                <ul className="mt-6 grid grid-cols-2 gap-4 border-y border-rb-stone-line py-5 text-sm">
                  <li className="flex items-center gap-2"><BedDouble className="h-5 w-5" aria-hidden="true" />{plural(ap.quartos, "quarto", "quartos")}</li>
                  <li className="flex items-center gap-2"><Bath className="h-5 w-5" aria-hidden="true" />{plural(ap.banheiros, "banheiro", "banheiros")}</li>
                  <li className="flex items-center gap-2"><Car className="h-5 w-5" aria-hidden="true" />{plural(ap.vagas, "vaga", "vagas")}</li>
                  <li className="flex items-center gap-2"><Ruler className="h-5 w-5" aria-hidden="true" />{formatArea(ap.area_privativa)}</li>
                  {ap.area_construida ? <li className="col-span-2 text-rb-stone">Área construída: {formatArea(ap.area_construida)}</li> : null}
                </ul>
                {ap.status === "vendido" ? (
                  <p className="mt-6 rounded-[4px] bg-rb-canvas-alt p-4 text-sm">Este apartamento já foi vendido. Veja outras opções na vitrine.</p>
                ) : (
                  <a
                    href={whatsappApartamentoUrl(ap)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-6 inline-flex h-12 w-full items-center justify-center rounded-[4px] bg-rb-teal-strong px-7 text-base font-medium text-rb-cream hover:bg-rb-ink-900"
                  >
                    Tenho interesse — falar no WhatsApp
                  </a>
                )}
              </div>
            </div>
            {ap.descricao && (
              <div className="mt-12 max-w-3xl">
                <h2 className="font-rb-serif text-2xl">Sobre o imóvel</h2>
                <p className="mt-4 whitespace-pre-line leading-relaxed text-rb-stone">{ap.descricao}</p>
              </div>
            )}
          </>
        )}
      </Container>
    </SiteLayout>
  );
}
