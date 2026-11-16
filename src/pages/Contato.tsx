import { Container } from "@/components/layout/Container";
import { SiteLayout } from "@/components/layout/SiteLayout";
import { Seo } from "@/components/Seo";
import { siteConfig } from "@/config/site";
import { whatsappGeralUrl } from "@/lib/whatsapp";

export default function Contato() {
  return (
    <SiteLayout>
      <Seo title="Contato | RB Negócios Imobiliários" description="Fale com a RB Negócios Imobiliários pelo WhatsApp, telefone ou e-mail." path="/contato" />
      <section className="bg-rb-ink-900 py-12 text-rb-cream md:py-16">
        <Container>
          <h1 className="font-rb-serif text-4xl md:text-5xl">Contato</h1>
          <p className="mt-4 max-w-xl text-rb-cream-muted">O WhatsApp é o principal canal de atendimento da RB.</p>
        </Container>
      </section>
      <section className="py-12 md:py-16">
        <Container className="grid gap-8 sm:grid-cols-3">
          <div>
            <h2 className="text-xs font-medium uppercase tracking-[0.2em] text-rb-teal-strong">WhatsApp</h2>
            <a href={whatsappGeralUrl()} target="_blank" rel="noopener noreferrer" className="mt-2 block text-lg font-medium hover:text-rb-teal-strong">
              {siteConfig.contact.display}
            </a>
          </div>
          <div>
            <h2 className="text-xs font-medium uppercase tracking-[0.2em] text-rb-teal-strong">Telefone</h2>
            <a href={siteConfig.contact.phoneHref} className="mt-2 block text-lg font-medium hover:text-rb-teal-strong">{siteConfig.contact.display}</a>
          </div>
          <div>
            <h2 className="text-xs font-medium uppercase tracking-[0.2em] text-rb-teal-strong">E-mail</h2>
            <a href={`mailto:${siteConfig.contact.email}`} className="mt-2 block break-words text-lg font-medium hover:text-rb-teal-strong">{siteConfig.contact.email}</a>
          </div>
        </Container>
      </section>
    </SiteLayout>
  );
}
