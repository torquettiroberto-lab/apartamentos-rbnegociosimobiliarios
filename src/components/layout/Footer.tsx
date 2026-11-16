import { Link } from "react-router-dom";
import { Container } from "@/components/layout/Container";
import { siteConfig } from "@/config/site";
import { whatsappGeralUrl } from "@/lib/whatsapp";

export function Footer() {
  return (
    <footer className="bg-rb-ink-900 text-rb-cream">
      <Container className="grid gap-10 py-14 md:grid-cols-3">
        <div>
          <p className="font-rb-serif text-xl">{siteConfig.brand.name}</p>
          <p className="mt-3 max-w-xs text-sm text-rb-cream-muted">Apartamentos à venda selecionados pela RB.</p>
          <p className="mt-4 text-xs uppercase tracking-[0.2em] text-rb-cream-muted">CRECI {siteConfig.creci}</p>
        </div>
        <nav aria-label="Navegação do rodapé">
          <p className="mb-3 text-xs font-medium uppercase tracking-[0.24em] text-rb-teal-on-dark">Navegação</p>
          <ul className="space-y-2 text-sm text-rb-cream-muted">
            <li><Link to="/" className="hover:text-rb-cream">Início</Link></li>
            <li><Link to="/apartamentos" className="hover:text-rb-cream">Apartamentos</Link></li>
            <li><Link to="/contato" className="hover:text-rb-cream">Contato</Link></li>
            <li>
              <a href={siteConfig.brand.institutionalUrl} className="hover:text-rb-cream">Site institucional da RB</a>
            </li>
          </ul>
        </nav>
        <div>
          <p className="mb-3 text-xs font-medium uppercase tracking-[0.24em] text-rb-teal-on-dark">Contato</p>
          <ul className="space-y-2 text-sm text-rb-cream-muted">
            <li>
              <a href={whatsappGeralUrl()} target="_blank" rel="noopener noreferrer" className="hover:text-rb-cream">
                WhatsApp: {siteConfig.contact.display}
              </a>
            </li>
            <li><a href={siteConfig.contact.phoneHref} className="hover:text-rb-cream">{siteConfig.contact.display}</a></li>
            <li><a href={`mailto:${siteConfig.contact.email}`} className="break-words hover:text-rb-cream">{siteConfig.contact.email}</a></li>
          </ul>
        </div>
      </Container>
      <div className="border-t border-rb-line-dark">
        <Container className="py-6 text-xs text-rb-cream-muted">
          © {new Date().getFullYear()} {siteConfig.brand.name}. Todos os direitos reservados.
        </Container>
      </div>
    </footer>
  );
}
