import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import {
  COLUNAS_PUBLICAS, COMPLEMENTO_NAO_POSSUI, enderecoPublico, formatarCep, normalizarEndereco, validarEndereco,
  type CamposEndereco,
  filtrarApartamentos, filtrosDeParams, formatArea, formatPreco, listarBairros,
  paraNumero, plural, proximoCodigo, visivelNaListagem, type Apartamento,
} from "@/lib/apartamentos";

const base: Apartamento = {
  id: "1", codigo: "AP0001", titulo: "Apto", descricao: null, preco: 500000, cidade: "Belo Horizonte",
  bairro: "Buritis", quartos: 3, banheiros: 2, vagas: 2, area_privativa: 80, area_construida: null,
  status: "disponivel", destaque: false, fotos: [], created_at: "", updated_at: "",
  rua: null, estado: null, cep: null, numero: null, complemento: null,
};
const lista: Apartamento[] = [
  base,
  { ...base, id: "2", codigo: "AP0002", bairro: "Centro", quartos: 2, vagas: 0, preco: 300000 },
  { ...base, id: "3", codigo: "AP0003", bairro: "Buritis", quartos: 4, vagas: 3, preco: 1200000 },
];

describe("formatação", () => {
  it("formata preço em reais sem centavos", () => {
    expect(formatPreco(519999)).toBe("R$ 519.999");
    expect(formatPreco(1950000)).toBe("R$ 1.950.000");
  });
  it("formata área em m²", () => {
    expect(formatArea(126.7)).toBe("126,7 m²");
    expect(formatArea(44)).toBe("44 m²");
  });
});

describe("filtros", () => {
  it("filtra por bairro, quartos, vagas e preço", () => {
    expect(filtrarApartamentos(lista, { bairro: "Centro" }).map((a) => a.codigo)).toEqual(["AP0002"]);
    expect(filtrarApartamentos(lista, { quartosMin: 3 }).map((a) => a.codigo)).toEqual(["AP0001", "AP0003"]);
    expect(filtrarApartamentos(lista, { vagasMin: 3 }).map((a) => a.codigo)).toEqual(["AP0003"]);
    expect(filtrarApartamentos(lista, { precoMax: 500000 }).map((a) => a.codigo)).toEqual(["AP0001", "AP0002"]);
    expect(filtrarApartamentos(lista, {})).toHaveLength(3);
  });
  it("combina filtros", () => {
    expect(filtrarApartamentos(lista, { bairro: "Buritis", quartosMin: 4 }).map((a) => a.codigo)).toEqual(["AP0003"]);
  });
  it("lê filtros da URL ignorando valores inválidos", () => {
    const f = filtrosDeParams(new URLSearchParams("bairro=Buritis&quartos=3&vagas=abc&preco=-5"));
    expect(f).toEqual({ bairro: "Buritis", quartosMin: 3, vagasMin: undefined, precoMax: undefined });
  });
  it("lista bairros sem repetição e em ordem", () => {
    expect(listarBairros(lista)).toEqual(["Buritis", "Centro"]);
  });
});

describe("visibilidade", () => {
  it("esconde vendidos da listagem pública", () => {
    expect(visivelNaListagem({ status: "vendido" })).toBe(false);
    expect(visivelNaListagem({ status: "reservado" })).toBe(true);
    expect(visivelNaListagem({ status: "disponivel" })).toBe(true);
  });
});

describe("códigos e números", () => {
  it("sugere o próximo código sequencial", () => {
    expect(proximoCodigo([])).toBe("AP0001");
    expect(proximoCodigo(["AP0245", "AP0059", "TEMP1"])).toBe("AP0246");
  });
  it("converte números no formato brasileiro e simples", () => {
    expect(paraNumero("1.250.000,50")).toBe(1250000.5);
    expect(paraNumero("519999")).toBe(519999);
    expect(paraNumero("80.5")).toBe(80.5);
    expect(paraNumero("")).toBeNull();
    expect(paraNumero("abc")).toBeNaN();
  });
});

describe("plural", () => {
  it("concorda singular e plural", () => {
    expect(plural(1, "vaga", "vagas")).toBe("1 vaga");
    expect(plural(0, "vaga", "vagas")).toBe("0 vagas");
    expect(plural(3, "quarto", "quartos")).toBe("3 quartos");
  });
});

describe("endereço", () => {
  const completo: CamposEndereco = { cep: "", rua: "Rua A", numero: "10", complemento: "Não possui", estado: "MG" };

  it("enderecoPublico mostra rua, bairro e cidade — e nunca número, complemento ou CEP", () => {
    const ap = { ...base, rua: "Rua das Palmeiras", cep: "30000000", numero: "123", complemento: "Apto 401" };
    const txt = enderecoPublico(ap);
    expect(txt).toBe("Rua das Palmeiras, Buritis, Belo Horizonte");
    expect(txt).not.toMatch(/123|401|30000/);
  });
  it("sem rua (apartamento antigo) cai para bairro e cidade", () => {
    expect(enderecoPublico({ ...base, rua: null })).toBe("Buritis, Belo Horizonte");
  });
  it("cadastro novo: rua, número, complemento e estado são obrigatórios; CEP é opcional", () => {
    const erros = validarEndereco({ cep: "", rua: "", numero: "", complemento: "", estado: "" }, true);
    expect(Object.keys(erros).sort()).toEqual(["complemento", "estado", "numero", "rua"]);
    expect(validarEndereco(completo, true)).toEqual({});
  });
  it('complemento aceita "Não possui", mas não texto vazio ou só espaços', () => {
    expect(validarEndereco({ ...completo, complemento: COMPLEMENTO_NAO_POSSUI }, true)).toEqual({});
    expect(validarEndereco({ ...completo, complemento: "   " }, true).complemento).toBeDefined();
  });
  it("campos só com espaços contam como vazios", () => {
    const erros = validarEndereco({ ...completo, rua: "  ", numero: " " }, true);
    expect(erros.rua).toBeDefined();
    expect(erros.numero).toBeDefined();
  });
  it("CEP: vazio ok; 8 dígitos (com ou sem hífen) ok; incompleto é rejeitado mesmo sem exigir", () => {
    expect(validarEndereco({ ...completo, cep: "" }, true).cep).toBeUndefined();
    expect(validarEndereco({ ...completo, cep: "30140-071" }, true).cep).toBeUndefined();
    expect(validarEndereco({ ...completo, cep: "30140071" }, true).cep).toBeUndefined();
    expect(validarEndereco({ ...completo, cep: "3014" }, true).cep).toBeDefined();
    expect(validarEndereco({ ...completo, cep: "3014" }, false).cep).toBeDefined();
  });
  it("estado fora da lista de UFs é rejeitado", () => {
    expect(validarEndereco({ ...completo, estado: "XX" }, true).estado).toBeDefined();
    expect(validarEndereco({ ...completo, estado: "mg" }, true).estado).toBeDefined();
  });
  it("apartamento antigo sem endereço: não exige nada (exigir = false)", () => {
    expect(validarEndereco({ cep: "", rua: "", numero: "", complemento: "", estado: "" }, false)).toEqual({});
  });
  it("normaliza: vazio vira null e o CEP guarda só dígitos", () => {
    expect(normalizarEndereco({ cep: "30140-071", rua: " Rua A ", numero: "10", complemento: "", estado: "MG" })).toEqual({
      cep: "30140071", rua: "Rua A", numero: "10", complemento: null, estado: "MG",
    });
    expect(normalizarEndereco({ cep: "", rua: "", numero: "", complemento: "", estado: "" })).toEqual({
      cep: null, rua: null, numero: null, complemento: null, estado: null,
    });
  });
  it("formata o CEP enquanto digita", () => {
    expect(formatarCep("30140071")).toBe("30140-071");
    expect(formatarCep("3014")).toBe("3014");
    expect(formatarCep("30140-0719999")).toBe("30140-071");
  });
  it("as colunas públicas nunca incluem CEP, número ou complemento", () => {
    for (const privada of ["cep", "numero", "complemento"]) {
      expect(COLUNAS_PUBLICAS as readonly string[]).not.toContain(privada);
    }
    expect(COLUNAS_PUBLICAS as readonly string[]).toContain("rua");
  });
  it("a lista de colunas públicas é idêntica ao GRANT da migração 0002", () => {
    const sql = readFileSync("supabase/migrations/0002_endereco.sql", "utf8");
    const grant = /grant select \(([^)]*)\)\s+on table public\.apartamentos to anon/i.exec(sql)?.[1] ?? "";
    const colunasSql = grant.split(",").map((c) => c.trim()).filter(Boolean).sort();
    expect(colunasSql).toEqual([...COLUNAS_PUBLICAS].sort());
  });
});
