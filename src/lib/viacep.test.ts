import { describe, expect, it, vi } from "vitest";
import { buscarCep } from "./viacep";

const resposta = (corpo: unknown, ok = true, status = 200) =>
  vi.fn().mockResolvedValue({ ok, status, json: async () => corpo }) as unknown as typeof fetch;

describe("buscarCep (ViaCEP)", () => {
  it("devolve rua, bairro, cidade e estado, enviando só o CEP", async () => {
    const f = resposta({ logradouro: "Rua A", bairro: "Centro", localidade: "Belo Horizonte", uf: "mg" });
    expect(await buscarCep("30140-071", f)).toEqual({ rua: "Rua A", bairro: "Centro", cidade: "Belo Horizonte", estado: "MG" });
    expect((f as unknown as ReturnType<typeof vi.fn>).mock.calls[0][0]).toBe("https://viacep.com.br/ws/30140071/json/");
  });
  it("CEP inexistente (erro: true) devolve null", async () => {
    expect(await buscarCep("00000000", resposta({ erro: true }))).toBeNull();
  });
  it("CEP incompleto nem chama o serviço", async () => {
    const f = resposta({});
    expect(await buscarCep("3014", f)).toBeNull();
    expect(f).not.toHaveBeenCalled();
  });
  it("falha do serviço lança erro", async () => {
    await expect(buscarCep("30140071", resposta({}, false, 500))).rejects.toThrow(/500/);
  });
});
