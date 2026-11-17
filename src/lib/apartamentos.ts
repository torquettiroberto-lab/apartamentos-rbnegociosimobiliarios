export type StatusApartamento = "disponivel" | "reservado" | "vendido";

/** Campos que a vitrine pública pode ver. Nunca inclui CEP, número ou complemento. */
export interface ApartamentoPublico {
  id: string;
  codigo: string;
  titulo: string;
  descricao: string | null;
  preco: number;
  cidade: string;
  bairro: string;
  rua: string | null;
  estado: string | null;
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

/** Registro completo, só para o painel administrativo (endereço exato incluído). */
export interface Apartamento extends ApartamentoPublico {
  cep: string | null;
  numero: string | null;
  complemento: string | null;
}

export type ApartamentoInput = Omit<Apartamento, "id" | "created_at" | "updated_at">;

/**
 * Colunas liberadas ao visitante (papel `anon`) no Supabase. Precisa ser
 * idêntica à lista do GRANT em supabase/migrations/0002_endereco.sql — há um
 * teste que compara as duas.
 */
export const COLUNAS_PUBLICAS = [
  "id", "codigo", "titulo", "descricao", "preco", "cidade", "bairro", "rua", "estado",
  "quartos", "banheiros", "vagas", "area_privativa", "area_construida", "status",
  "destaque", "fotos", "created_at", "updated_at",
] as const satisfies readonly (keyof ApartamentoPublico)[];

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

export function filtrarApartamentos<T extends ApartamentoPublico>(lista: T[], f: Filtros): T[] {
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

// ---------------------------------------------------------------------------
// Endereço
// ---------------------------------------------------------------------------

export const ESTADOS = [
  "AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA", "MT", "MS", "MG", "PA",
  "PB", "PR", "PE", "PI", "RJ", "RN", "RS", "RO", "RR", "SC", "SP", "SE", "TO",
] as const;

export const COMPLEMENTO_NAO_POSSUI = "Não possui";

/** Endereço público: "Rua X, Bairro, Cidade" (sem rua: "Bairro, Cidade"). */
export function enderecoPublico(ap: Pick<ApartamentoPublico, "rua" | "bairro" | "cidade">): string {
  return [ap.rua, ap.bairro, ap.cidade].map((p) => p?.trim()).filter(Boolean).join(", ");
}

export interface CamposEndereco {
  cep: string;
  rua: string;
  numero: string;
  complemento: string;
  estado: string;
}
export type ErrosEndereco = Partial<Record<keyof CamposEndereco, string>>;

export function apenasDigitos(v: string): string {
  return v.replace(/\D/g, "");
}

/** Máscara 00000-000 enquanto digita. */
export function formatarCep(v: string): string {
  const d = apenasDigitos(v).slice(0, 8);
  return d.length > 5 ? `${d.slice(0, 5)}-${d.slice(5)}` : d;
}

export function algumEnderecoPreenchido(c: CamposEndereco): boolean {
  return [c.cep, c.rua, c.numero, c.complemento, c.estado].some((v) => v.trim() !== "");
}

/**
 * Valida o endereço. CEP é sempre opcional (mas, se vier, precisa ter 8
 * dígitos). Rua, número, complemento e estado só são exigidos quando `exigir`.
 * Bairro e cidade são validados à parte (já eram obrigatórios).
 */
export function validarEndereco(c: CamposEndereco, exigir: boolean): ErrosEndereco {
  const erros: ErrosEndereco = {};
  const cep = apenasDigitos(c.cep);
  if (c.cep.trim() && cep.length !== 8) erros.cep = "O CEP deve ter 8 dígitos.";
  if (exigir && !c.rua.trim()) erros.rua = "Informe a rua.";
  if (exigir && !c.numero.trim()) erros.numero = 'Informe o número (ou "S/N").';
  if (exigir && !c.complemento.trim()) erros.complemento = `Informe o complemento ou marque "${COMPLEMENTO_NAO_POSSUI}".`;
  const uf = c.estado.trim();
  if (exigir && !uf) erros.estado = "Escolha o estado.";
  else if (uf && !(ESTADOS as readonly string[]).includes(uf)) erros.estado = "Estado inválido.";
  return erros;
}

/** Prepara os campos para gravar: vazio vira null e o CEP guarda só os dígitos. */
export function normalizarEndereco(c: CamposEndereco) {
  const t = (v: string) => v.trim() || null;
  return {
    cep: apenasDigitos(c.cep) || null,
    rua: t(c.rua),
    numero: t(c.numero),
    complemento: t(c.complemento),
    estado: t(c.estado),
  };
}
