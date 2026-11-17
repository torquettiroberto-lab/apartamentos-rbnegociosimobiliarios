/**
 * Prepara uma foto para envio removendo TODOS os metadados (EXIF, inclusive
 * localização GPS). A imagem é decodificada (já aplicando a rotação do EXIF)
 * e redesenhada num canvas, que não carrega metadados. Se algo falhar, a foto
 * NÃO é enviada — nunca se envia o arquivo original com EXIF.
 */

export const TIPOS_FOTO_ACEITOS = ["image/jpeg", "image/png", "image/webp", "image/avif"] as const;
export const LADO_MAXIMO = 2560;

/** Reduz mantendo a proporção; nunca amplia. */
export function dimensoesAlvo(largura: number, altura: number, max = LADO_MAXIMO) {
  const maior = Math.max(largura, altura);
  if (maior <= max) return { largura, altura };
  const f = max / maior;
  return { largura: Math.round(largura * f), altura: Math.round(altura * f) };
}

/** PNG continua PNG (sem perda); o resto vira JPEG. */
export function tipoDeSaida(tipoOriginal: string): "image/png" | "image/jpeg" {
  return tipoOriginal === "image/png" ? "image/png" : "image/jpeg";
}

export function extensaoDoTipo(tipo: string): string {
  return tipo === "image/png" ? "png" : "jpg";
}

export async function removerMetadados(arquivo: File): Promise<{ blob: Blob; tipo: string }> {
  const tipo = tipoDeSaida(arquivo.type);
  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(arquivo, { imageOrientation: "from-image" });
  } catch {
    throw new Error("Não foi possível ler esta imagem. Use um arquivo JPG, PNG, WebP ou AVIF válido.");
  }
  try {
    const { largura, altura } = dimensoesAlvo(bitmap.width, bitmap.height);
    const canvas = document.createElement("canvas");
    canvas.width = largura;
    canvas.height = altura;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Este navegador não consegue preparar a foto.");
    if (tipo === "image/jpeg") {
      ctx.fillStyle = "#fff"; // JPEG não tem transparência
      ctx.fillRect(0, 0, largura, altura);
    }
    ctx.drawImage(bitmap, 0, 0, largura, altura);
    const blob = await new Promise<Blob | null>((ok) => canvas.toBlob(ok, tipo, 0.9));
    if (!blob || blob.type !== tipo) throw new Error("Não foi possível preparar a foto para envio.");
    return { blob, tipo };
  } finally {
    bitmap.close();
  }
}
