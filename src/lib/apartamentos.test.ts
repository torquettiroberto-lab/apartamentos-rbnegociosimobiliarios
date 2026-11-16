import { describe, expect, it } from "vitest";
import {
  filtrarApartamentos, filtrosDeParams, formatArea, formatPreco, listarBairros,
  paraNumero, plural, proximoCodigo, visivelNaListagem, type Apartamento,
} from "@/lib/apartamentos";

const base: Apartamento = {
  id: "1", codigo: "AP0001", titulo: "Apto", descricao: null, preco: 500000, cidade: "Belo Horizonte",
  bairro: "Buritis", quartos: 3, banheiros: 2, vagas: 2, area_privativa: 80, area_construida: null,
  status: "disponivel", destaque: false, fotos: [], created_at: "", updated_at: "",
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
