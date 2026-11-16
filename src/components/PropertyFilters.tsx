import { FILTRO_PRECO_OPCOES, formatPreco, type Filtros } from "@/lib/apartamentos";

const campo =
  "h-11 w-full rounded-[4px] border border-rb-stone-line bg-white px-3 text-sm text-rb-graphite focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rb-teal-strong";

export function PropertyFilters({
  bairros,
  valor,
  onChange,
  onLimpar,
}: {
  bairros: string[];
  valor: Filtros;
  onChange: (proximo: Filtros) => void;
  onLimpar: () => void;
}) {
  const num = (v: string) => (v ? Number(v) : undefined);
  const ativo = Boolean(valor.bairro || valor.quartosMin || valor.vagasMin || valor.precoMax);

  return (
    <form
      className="grid gap-4 rounded-[4px] border border-rb-stone-line bg-white p-4 sm:grid-cols-2 lg:grid-cols-5 lg:items-end"
      role="search"
      aria-label="Filtrar apartamentos"
      onSubmit={(e) => e.preventDefault()}
    >
      <label className="block text-sm font-medium">
        Bairro
        <select className={campo + " mt-1.5"} value={valor.bairro ?? ""} onChange={(e) => onChange({ ...valor, bairro: e.target.value || undefined })}>
          <option value="">Todos</option>
          {bairros.map((b) => (
            <option key={b} value={b}>{b}</option>
          ))}
        </select>
      </label>
      <label className="block text-sm font-medium">
        Quartos
        <select className={campo + " mt-1.5"} value={valor.quartosMin ?? ""} onChange={(e) => onChange({ ...valor, quartosMin: num(e.target.value) })}>
          <option value="">Qualquer</option>
          {[1, 2, 3, 4].map((n) => (
            <option key={n} value={n}>{n}+</option>
          ))}
        </select>
      </label>
      <label className="block text-sm font-medium">
        Vagas
        <select className={campo + " mt-1.5"} value={valor.vagasMin ?? ""} onChange={(e) => onChange({ ...valor, vagasMin: num(e.target.value) })}>
          <option value="">Qualquer</option>
          {[1, 2, 3].map((n) => (
            <option key={n} value={n}>{n}+</option>
          ))}
        </select>
      </label>
      <label className="block text-sm font-medium">
        Preço até
        <select className={campo + " mt-1.5"} value={valor.precoMax ?? ""} onChange={(e) => onChange({ ...valor, precoMax: num(e.target.value) })}>
          <option value="">Qualquer</option>
          {FILTRO_PRECO_OPCOES.map((p) => (
            <option key={p} value={p}>{formatPreco(p)}</option>
          ))}
        </select>
      </label>
      <button
        type="button"
        onClick={onLimpar}
        disabled={!ativo}
        className="h-11 rounded-[4px] border border-rb-graphite px-4 text-sm font-medium text-rb-graphite hover:bg-rb-graphite hover:text-rb-canvas disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-rb-graphite"
      >
        Limpar filtros
      </button>
    </form>
  );
}
