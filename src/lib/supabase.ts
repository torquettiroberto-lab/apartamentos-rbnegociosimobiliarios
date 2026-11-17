import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { ehChaveSecreta } from "@/lib/chave-supabase";

const url = (import.meta.env.VITE_SUPABASE_URL as string | undefined)?.trim();
const publishableKey = (import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string | undefined)?.trim();

// Nunca inicializa o cliente com uma chave secreta (service_role / sb_secret_...).
if (publishableKey && ehChaveSecreta(publishableKey)) {
  console.error(
    "VITE_SUPABASE_PUBLISHABLE_KEY contém uma chave SECRETA do Supabase. Use apenas a chave pública (publishable).",
  );
}

/** Falso enquanto as variáveis do Supabase não foram configuradas (ou se a chave for secreta). */
export const supabaseConfigurado = Boolean(url && publishableKey && !ehChaveSecreta(publishableKey));

export const supabase: SupabaseClient | null = supabaseConfigurado ? createClient(url!, publishableKey!) : null;

export function exigirSupabase(): SupabaseClient {
  if (!supabase) {
    throw new Error("Supabase não configurado (defina VITE_SUPABASE_URL e VITE_SUPABASE_PUBLISHABLE_KEY).");
  }
  return supabase;
}
