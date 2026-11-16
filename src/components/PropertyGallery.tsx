import { useState } from "react";
import { StatusBadge } from "@/components/StatusBadge";
import type { StatusApartamento } from "@/lib/apartamentos";

export function PropertyGallery({ fotos, titulo, status }: { fotos: string[]; titulo: string; status: StatusApartamento }) {
  const [atual, setAtual] = useState(0);

  if (fotos.length === 0) {
    return (
      <div className="relative flex aspect-[4/3] items-center justify-center bg-rb-canvas-alt text-rb-stone">
        Sem fotos
        <StatusBadge status={status} className="absolute left-3 top-3" />
      </div>
    );
  }

  const indice = Math.min(atual, fotos.length - 1);

  return (
    <div>
      <div className="relative aspect-[4/3] overflow-hidden bg-rb-canvas-alt">
        <img
          src={fotos[indice]}
          alt={`${titulo} — foto ${indice + 1} de ${fotos.length}`}
          width={1200}
          height={900}
          className="h-full w-full object-cover"
        />
        <StatusBadge status={status} className="absolute left-3 top-3" />
      </div>
      {fotos.length > 1 && (
        <ul className="mt-3 grid grid-cols-4 gap-2 sm:grid-cols-6">
          {fotos.map((url, i) => (
            <li key={url}>
              <button
                type="button"
                onClick={() => setAtual(i)}
                aria-label={`Ver foto ${i + 1}`}
                aria-current={i === indice}
                className={
                  "block aspect-[4/3] w-full overflow-hidden border-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rb-teal-strong " +
                  (i === indice ? "border-rb-teal-strong" : "border-transparent opacity-75 hover:opacity-100")
                }
              >
                <img src={url} alt="" width={200} height={150} loading="lazy" className="h-full w-full object-cover" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
