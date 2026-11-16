import type { ReactNode } from "react";

export function Notice({ title, children, tone = "info" }: { title: string; children?: ReactNode; tone?: "info" | "erro" }) {
  return (
    <div
      role={tone === "erro" ? "alert" : "status"}
      className={
        "rounded-[4px] border p-5 " +
        (tone === "erro" ? "border-red-700 bg-red-50 text-red-900" : "border-rb-stone-line bg-rb-canvas-alt text-rb-graphite")
      }
    >
      <p className="font-medium">{title}</p>
      {children && <div className="mt-1 text-sm">{children}</div>}
    </div>
  );
}
