import { apenasDigitos } from "@/lib/apartamentos";

export interface EnderecoViaCep {
  rua: string;
  bairro: string;
  cidade: string;
  estado: string;
}

/**
 * Consulta o ViaCEP (https://viacep.com.br) para preencher o endereço.
 * Só o CEP é enviado ao serviço — nenhum outro dado do anúncio. Devolve null
 * se o CEP for inválido ou não existir; lança erro se o serviço falhar.
 */
export async function buscarCep(cep: string, f: typeof fetch = fetch): Promise<EnderecoViaCep | null> {
  const digitos = apenasDigitos(cep);
  if (digitos.length !== 8) return null;
  const controle = new AbortController();
  const timer = setTimeout(() => controle.abort(), 8000);
  let d: unknown;
  try {
    const resp = await f(`https://viacep.com.br/ws/${digitos}/json/`, { signal: controle.signal });
    if (!resp.ok) throw new Error(`ViaCEP respondeu ${resp.status}`);
    d = await resp.json();
  } finally {
    clearTimeout(timer);
  }
  const dados = d as { erro?: boolean | string; logradouro?: string; bairro?: string; localidade?: string; uf?: string };
  if (dados.erro) return null;
  return {
    rua: (dados.logradouro ?? "").trim(),
    bairro: (dados.bairro ?? "").trim(),
    cidade: (dados.localidade ?? "").trim(),
    estado: (dados.uf ?? "").trim().toUpperCase(),
  };
}
