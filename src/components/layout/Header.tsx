import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { Menu, X } from "lucide-react";
import logoRb from "@/assets/logo-rb.png";
import { Container } from "@/components/layout/Container";
import { siteConfig } from "@/config/site";
import { whatsappGeralUrl } from "@/lib/whatsapp";

const nav = [
  { label: "Início", to: "/" },
  { label: "Apartamentos", to: "/apartamentos" },
  { label: "Contato", to: "/contato" },
] as const;

const linkClass = ({ isActive }: { isActive: boolean }) =>
  "rounded-[4px] px-3 py-2 text-sm font-medium transition-colors hover:text-rb-teal-strong " +
  (isActive ? "text-rb-teal-strong" : "text-rb-graphite");

export function Header() {
  const [aberto, setAberto] = useState(false);

  return (
    <header className="sticky top-0 z-30 border-b border-rb-stone-line bg-rb-canvas/95 backdrop-blur-sm">
      <Container className="flex h-16 items-center justify-between md:h-20">
        <Link to="/" className="flex items-center gap-2.5" aria-label={`${siteConfig.brand.name} — vitrine de apartamentos`}>
          <img src={logoRb} alt="" aria-hidden="true" width={32} height={32} className="h-8 w-8 object-contain" />
          <span className="leading-tight">
            <span className="block text-sm font-semibold md:text-base">{siteConfig.brand.name}</span>
            <span className="block text-xs text-rb-stone">{siteConfig.brand.section}</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-2 md:flex" aria-label="Navegação principal">
          {nav.map((i) => (
            <NavLink key={i.to} to={i.to} end={i.to === "/"} className={linkClass}>
              {i.label}
            </NavLink>
          ))}
          <a
            href={whatsappGeralUrl()}
            target="_blank"
            rel="noopener noreferrer"
            className="ml-3 inline-flex h-10 items-center rounded-[4px] bg-rb-teal-strong px-5 text-sm font-medium text-rb-cream hover:bg-rb-ink-900"
          >
            Falar no WhatsApp
          </a>
        </nav>

        <button
          type="button"
          className="flex h-11 w-11 items-center justify-center rounded-[4px] md:hidden"
          aria-label={aberto ? "Fechar menu" : "Abrir menu"}
          aria-expanded={aberto}
          aria-controls="menu-mobile"
          onClick={() => setAberto((v) => !v)}
        >
          {aberto ? <X className="h-6 w-6" aria-hidden="true" /> : <Menu className="h-6 w-6" aria-hidden="true" />}
        </button>
      </Container>

      {aberto && (
        <nav id="menu-mobile" aria-label="Navegação do menu mobile" className="border-t border-rb-stone-line bg-rb-canvas md:hidden">
          <Container className="flex flex-col gap-1 py-4">
            {nav.map((i) => (
              <NavLink key={i.to} to={i.to} end={i.to === "/"} className={linkClass} onClick={() => setAberto(false)}>
                <span className="block py-1.5 text-base">{i.label}</span>
              </NavLink>
            ))}
            <a
              href={whatsappGeralUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 inline-flex h-12 items-center justify-center rounded-[4px] bg-rb-teal-strong px-5 text-base font-medium text-rb-cream"
            >
              Falar no WhatsApp
            </a>
          </Container>
        </nav>
      )}
    </header>
  );
}
