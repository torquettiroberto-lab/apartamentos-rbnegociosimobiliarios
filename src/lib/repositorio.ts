import { exigirSupabase } from "@/lib/supabase";
import {
  COLUNAS_PUBLICAS, visivelNaListagem, type Apartamento, type ApartamentoInput, type ApartamentoPublico,
} from "@/lib/apartamentos";
import { TIPOS_FOTO_ACEITOS, extensaoDoTipo, removerMetadados } from "@/lib/foto";

const TABELA = "apartamentos";
export const BUCKET_FOTOS = "apartamentos-fotos";
export const TAMANHO_MAX_FOTO = 5 * 1024 * 1024;

/** O visitante só tem permissão nessas colunas (ver 0002_endereco.sql): nunca usar select("*") nas leituras públicas. */
const SELECT_PUBLICO = COLUNAS_PUBLICAS.join(",");

/** Lista pública: disponíveis e reservados, mais novos primeiro. */
export async function listarPublicos(): Promise<ApartamentoPublico[]> {
  const { data, error } = await exigirSupabase()
    .from(TABELA)
    .select(SELECT_PUBLICO)
    .neq("status", "vendido")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return ((data ?? []) as unknown as ApartamentoPublico[]).filter(visivelNaListagem);
}

/** Detalhe público por código (mostra também os vendidos, com selo). */
export async function obterPorCodigo(codigo: string): Promise<ApartamentoPublico | null> {
  const { data, error } = await exigirSupabase().from(TABELA).select(SELECT_PUBLICO).eq("codigo", codigo).maybeSingle();
  if (error) throw error;
  return (data as unknown as ApartamentoPublico | null) ?? null;
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

/** Envia uma foto ao Storage, sem metadados (EXIF/GPS), e devolve a URL pública. */
export async function enviarFoto(arquivo: File): Promise<string> {
  if (!(TIPOS_FOTO_ACEITOS as readonly string[]).includes(arquivo.type)) {
    throw new Error("Use fotos JPG, PNG, WebP ou AVIF.");
  }
  if (arquivo.size > TAMANHO_MAX_FOTO) throw new Error("Cada foto pode ter no máximo 5 MB.");
  const { blob, tipo } = await removerMetadados(arquivo);
  if (blob.size > TAMANHO_MAX_FOTO) throw new Error("A foto ficou maior que 5 MB. Use uma imagem menor.");
  const cliente = exigirSupabase();
  const caminho = `${crypto.randomUUID()}.${extensaoDoTipo(tipo)}`;
  const { error } = await cliente.storage.from(BUCKET_FOTOS).upload(caminho, blob, {
    cacheControl: "31536000",
    contentType: tipo,
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
