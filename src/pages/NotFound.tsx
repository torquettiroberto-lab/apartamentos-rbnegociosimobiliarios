import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Container } from "@/components/layout/Container";
import { SiteLayout } from "@/components/layout/SiteLayout";

export default function NotFound() {
  return (
    <SiteLayout>
      <Helmet>
        <title>Página não encontrada | RB Negócios Imobiliários</title>
        <meta name="robots" content="noindex, follow" />
      </Helmet>
      <Container className="py-20 text-center">
        <p className="text-xs font-medium uppercase tracking-[0.28em] text-rb-teal-strong">Erro 404</p>
        <h1 className="mt-3 font-rb-serif text-4xl md:text-5xl">Página não encontrada</h1>
        <p className="mx-auto mt-4 max-w-md text-rb-stone">O endereço que você tentou acessar não existe ou foi movido.</p>
        <Link to="/apartamentos" className="mt-8 inline-block text-sm font-medium underline underline-offset-4 hover:text-rb-teal-strong">
          Ver apartamentos
        </Link>
      </Container>
    </SiteLayout>
  );
}
