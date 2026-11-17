/**
 * Impede que uma chave SECRETA do Supabase seja usada no navegador.
 * No site só pode ir a chave pública ("publishable", `sb_publishable_...`, ou a
 * `anon` legada). Chaves `sb_secret_...` e JWTs com role `service_role`
 * ignoram o RLS e jamais devem entrar em variáveis VITE_*.
 */
export function ehChaveSecreta(chave: string): boolean {
  const k = chave.trim();
  if (k.startsWith("sb_secret_")) return true;
  const partes = k.split(".");
  if (partes.length === 3) {
    try {
      const base64 = partes[1].replace(/-/g, "+").replace(/_/g, "/");
      const payload = JSON.parse(atob(base64.padEnd(Math.ceil(base64.length / 4) * 4, "=")));
      return payload?.role === "service_role";
    } catch {
      return false;
    }
  }
  return false;
}
