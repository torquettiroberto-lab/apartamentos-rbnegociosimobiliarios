export type StatusApartamento = "disponivel" | "reservado" | "vendido";

export interface Apartamento {
  id: string;
  codigo: string;
  titulo: string;
  descricao: string | null;
  preco: number;
  cidade: string;
  bairro: string;
  quartos: number;
  banheiros: number;
  vagas: number;
  area_privativa: number;
  area_construida: number | null;
  status: StatusApartamento;
  destaque: boolean;
  fotos: string[];
  created_at: string;
  updated_at: string;
}

export type ApartamentoInput = Omit<Apartamento, "id" | "created_at" | "updated_at">;

export interface Filtros {
  bairro?: string;
  quartosMin?: number;
  vagasMin?: number;
  precoMax?: number;
}

export const STATUS_LABEL: Record<StatusApartamento, string> = {
  disponivel: "Disponível",
  reservado: "Reservado",
  vendido: "Vendido",
};

export const FILTRO_PRECO_OPCOES = [300000, 500000, 750000, 1000000, 2000000] as const;

const brl = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });
const num = new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 2 });

export function formatPreco(valor: number): string {
  return brl.format(valor).replace(/\s/g, " ");
}

export function formatArea(m2: number): string {
  return `${num.format(m2)} m²`;
}

/** Só disponíveis e reservados aparecem nas listagens públicas. */
export function visivelNaListagem(ap: Pick<Apartamento, "status">): boolean {
  return ap.status !== "vendido";
}

export function listarBairros(lista: Pick<Apartamento, "bairro">[]): string[] {
  return Array.from(new Set(lista.map((a) => a.bairro.trim()).filter(Boolean))).sort((a, b) =>
    a.localeCompare(b, "pt-BR"),
  );
}

export function filtrarApartamentos<T extends Apartamento>(lista: T[], f: Filtros): T[] {
  return lista.filter((a) => {
    if (f.bairro && a.bairro !== f.bairro) return false;
    if (f.quartosMin && a.quartos < f.quartosMin) return false;
    if (f.vagasMin && a.vagas < f.vagasMin) return false;
    if (f.precoMax && a.preco > f.precoMax) return false;
    return true;
  });
}

/** Lê os filtros de uma query string, ignorando valores inválidos. */
export function filtrosDeParams(params: URLSearchParams): Filtros {
  const n = (key: string) => {
    const v = Number(params.get(key));
    return Number.isFinite(v) && v > 0 ? v : undefined;
  };
  return {
    bairro: params.get("bairro") || undefined,
    quartosMin: n("quartos"),
    vagasMin: n("vagas"),
    precoMax: n("preco"),
  };
}

/** Próximo código sequencial no padrão AP0001, a partir dos já existentes. */
export function proximoCodigo(existentes: string[]): string {
  const max = existentes.reduce((acc, c) => {
    const m = /^AP(\d+)$/i.exec(c.trim());
    return m ? Math.max(acc, Number(m[1])) : acc;
  }, 0);
  return `AP${String(max + 1).padStart(4, "0")}`;
}

/** Converte "1.250.000,50" ou "1250000.5" em número; vazio vira null. */
export function paraNumero(v: string): number | null {
  const t = v.trim();
  if (!t) return null;
  const normal = t.includes(",") ? t.replace(/\./g, "").replace(",", ".") : t;
  const n = Number(normal);
  return Number.isFinite(n) ? n : NaN;
}

/** "1 vaga", "2 vagas". */
export function plural(n: number, singular: string, plural: string): string {
  return `${n} ${n === 1 ? singular : plural}`;
}
