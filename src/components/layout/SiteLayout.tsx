import type { ReactNode } from "react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

export function SiteLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <a
        href="#conteudo"
        className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-50 focus:rounded-[4px] focus:bg-rb-ink-900 focus:px-4 focus:py-2 focus:text-rb-cream"
      >
        Pular para o conteúdo
      </a>
      <Header />
      <main id="conteudo" className="flex-1">
        {children}
      </main>
      <Footer />
    </div>
  );
}
