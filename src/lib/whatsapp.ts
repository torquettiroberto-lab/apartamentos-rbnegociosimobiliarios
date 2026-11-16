import { siteConfig } from "@/config/site";

const BASE = `https://wa.me/${siteConfig.contact.whatsappInternational}`;

/** Link genérico de contato (sem imóvel específico). */
export function whatsappGeralUrl(): string {
  const text = "Olá! Vi a vitrine de apartamentos da RB Negócios Imobiliários e gostaria de mais informações.";
  return `${BASE}?text=${encodeURIComponent(text)}`;
}

/** Link de interesse em um apartamento, com o código no texto. */
export function whatsappApartamentoUrl(ap: { codigo: string; titulo: string }): string {
  const text = `Olá! Tenho interesse no apartamento ${ap.codigo} — ${ap.titulo}. Poderia me passar mais informações?`;
  return `${BASE}?text=${encodeURIComponent(text)}`;
}
