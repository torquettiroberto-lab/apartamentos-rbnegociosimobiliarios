import { useEffect, useState } from "react";
import type { Apartamento } from "@/lib/apartamentos";
import { listarPublicos } from "@/lib/repositorio";
import { supabaseConfigurado } from "@/lib/supabase";

/** Carrega os apartamentos visíveis ao público (disponíveis e reservados). */
export function usePublicos() {
  const [lista, setLista] = useState<Apartamento[]>([]);
  const [carregando, setCarregando] = useState(supabaseConfigurado);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    if (!supabaseConfigurado) return;
    let ativo = true;
    listarPublicos()
      .then((dados) => ativo && setLista(dados))
      .catch((e: Error) => ativo && setErro(e.message))
      .finally(() => ativo && setCarregando(false));
    return () => {
      ativo = false;
    };
  }, []);

  return { lista, carregando, erro, configurado: supabaseConfigurado };
}
