import { STATUS_LABEL, type StatusApartamento } from "@/lib/apartamentos";
import { cn } from "@/lib/utils";

const estilos: Record<StatusApartamento, string> = {
  disponivel: "bg-rb-teal-strong text-rb-cream",
  reservado: "bg-rb-graphite text-rb-cream",
  vendido: "bg-rb-stone text-rb-cream",
};

export function StatusBadge({ status, className }: { status: StatusApartamento; className?: string }) {
  return (
    <span className={cn("inline-block rounded-[4px] px-2.5 py-1 text-xs font-medium uppercase tracking-wide", estilos[status], className)}>
      {STATUS_LABEL[status]}
    </span>
  );
}
