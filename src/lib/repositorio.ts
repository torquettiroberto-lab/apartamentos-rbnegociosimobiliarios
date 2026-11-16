import { exigirSupabase } from "@/lib/supabase";
import { visivelNaListagem, type Apartamento, type ApartamentoInput } from "@/lib/apartamentos";

const TABELA = "apartamentos";
export const BUCKET_FOTOS = "apartamentos-fotos";
export const TAMANHO_MAX_FOTO = 5 * 1024 * 1024;

/** Lista pública: disponíveis e reservados, mais novos primeiro. */
export async function listarPublicos(): Promise<Apartamento[]> {
  const { data, error } = await exigirSupabase()
    .from(TABELA)
    .select("*")
    .neq("status", "vendido")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return ((data ?? []) as Apartamento[]).filter(visivelNaListagem);
}

/** Detalhe público por código (mostra também os vendidos, com selo). */
export async function obterPorCodigo(codigo: string): Promise<Apartamento | null> {
  const { data, error } = await exigirSupabase().from(TABELA).select("*").eq("codigo", codigo).maybeSingle();
  if (error) throw error;
  return (data as Apartamento | null) ?? null;
}

export async function listarTodos(): Promise<Apartamento[]> {
  const { data, error } = await exigirSupabase().from(TABELA).select("*").order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as Apartamento[];
}

export async function obterPorId(id: string): Promise<Apartamento | null> {
  const { data, error } = await exigirSupabase().from(TABELA).select("*").eq("id", id).maybeSingle();
  if (error) throw error;
  return (data as Apartamento | null) ?? null;
}

export async function criar(input: ApartamentoInput): Promise<Apartamento> {
  const { data, error } = await exigirSupabase().from(TABELA).insert(input).select().single();
  if (error) throw error;
  return data as Apartamento;
}

export async function atualizar(id: string, input: Partial<ApartamentoInput>): Promise<Apartamento> {
  const { data, error } = await exigirSupabase().from(TABELA).update(input).eq("id", id).select().single();
  if (error) throw error;
  return data as Apartamento;
}

export async function remover(id: string): Promise<void> {
  const { error } = await exigirSupabase().from(TABELA).delete().eq("id", id);
  if (error) throw error;
}

/** Envia uma foto ao Storage e devolve a URL pública. */
export async function enviarFoto(arquivo: File): Promise<string> {
  if (!arquivo.type.startsWith("image/")) throw new Error("O arquivo precisa ser uma imagem.");
  if (arquivo.size > TAMANHO_MAX_FOTO) throw new Error("Cada foto pode ter no máximo 5 MB.");
  const cliente = exigirSupabase();
  const ext = (arquivo.name.split(".").pop() || "jpg").toLowerCase().replace(/[^a-z0-9]/g, "");
  const caminho = `${crypto.randomUUID()}.${ext || "jpg"}`;
  const { error } = await cliente.storage.from(BUCKET_FOTOS).upload(caminho, arquivo, {
    cacheControl: "31536000",
    contentType: arquivo.type,
  });
  if (error) throw error;
  return cliente.storage.from(BUCKET_FOTOS).getPublicUrl(caminho).data.publicUrl;
}

/** Remove do Storage uma foto pela URL pública (ignora URLs de outro bucket). */
export async function removerFoto(url: string): Promise<void> {
  const marcador = `/${BUCKET_FOTOS}/`;
  const i = url.indexOf(marcador);
  if (i === -1) return;
  const caminho = decodeURIComponent(url.slice(i + marcador.length).split("?")[0]);
  const { error } = await exigirSupabase().storage.from(BUCKET_FOTOS).remove([caminho]);
  if (error) throw error;
}
