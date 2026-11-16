import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

/** Falso enquanto as variáveis do Supabase não foram configuradas. */
export const supabaseConfigurado = Boolean(url && anonKey);

export const supabase: SupabaseClient | null = supabaseConfigurado ? createClient(url!, anonKey!) : null;

export function exigirSupabase(): SupabaseClient {
  if (!supabase) {
    throw new Error("Supabase não configurado (defina VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY).");
  }
  return supabase;
}
