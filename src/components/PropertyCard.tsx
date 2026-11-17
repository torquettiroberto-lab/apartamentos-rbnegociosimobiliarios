import { Link } from "react-router-dom";
import { BedDouble, Bath, Car, Ruler } from "lucide-react";
import { StatusBadge } from "@/components/StatusBadge";
import { enderecoPublico, formatArea, formatPreco, type ApartamentoPublico } from "@/lib/apartamentos";

export function PropertyCard({ ap }: { ap: ApartamentoPublico }) {
  const capa = ap.fotos[0];
  return (
    <article className="group flex flex-col overflow-hidden rounded-[4px] border border-rb-stone-line bg-white">
      <Link
        to={`/apartamentos/${encodeURIComponent(ap.codigo)}`}
        className="flex flex-1 flex-col focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rb-teal-strong"
        aria-label={`${ap.titulo}, ${formatPreco(ap.preco)}`}
      >
        <div className="relative aspect-[4/3] overflow-hidden bg-rb-canvas-alt">
          {capa ? (
            <img
              src={capa}
              alt={`Foto de ${ap.titulo}`}
              width={800}
              height={600}
              loading="lazy"
              decoding="async"
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-rb-stone">Sem foto</div>
          )}
          <StatusBadge status={ap.status} className="absolute left-3 top-3" />
        </div>
        <div className="flex flex-1 flex-col gap-3 p-5">
          <p className="font-rb-serif text-2xl text-rb-graphite">{formatPreco(ap.preco)}</p>
          <h3 className="text-base font-medium leading-snug text-rb-graphite">{ap.titulo}</h3>
          <p className="text-sm text-rb-stone">
            {enderecoPublico(ap)}
          </p>
          <ul className="mt-auto flex flex-wrap gap-x-4 gap-y-1 pt-2 text-sm text-rb-graphite">
            <li className="flex items-center gap-1.5"><BedDouble className="h-4 w-4" aria-hidden="true" />{ap.quartos} <span className="sr-only">quartos</span></li>
            <li className="flex items-center gap-1.5"><Bath className="h-4 w-4" aria-hidden="true" />{ap.banheiros} <span className="sr-only">banheiros</span></li>
            <li className="flex items-center gap-1.5"><Car className="h-4 w-4" aria-hidden="true" />{ap.vagas} <span className="sr-only">vagas</span></li>
            <li className="flex items-center gap-1.5"><Ruler className="h-4 w-4" aria-hidden="true" />{formatArea(ap.area_privativa)}</li>
          </ul>
          <p className="text-xs uppercase tracking-[0.16em] text-rb-stone">Código {ap.codigo}</p>
        </div>
      </Link>
    </article>
  );
}
