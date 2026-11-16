import { describe, expect, it } from "vitest";
import { whatsappApartamentoUrl, whatsappGeralUrl } from "@/lib/whatsapp";

describe("whatsapp", () => {
  it("usa o número oficial da RB", () => {
    expect(whatsappGeralUrl()).toContain("https://wa.me/5531971207558?text=");
    expect(whatsappApartamentoUrl({ codigo: "AP0245", titulo: "Apto 3 quartos" })).toContain("https://wa.me/5531971207558?text=");
  });
  it("cita o código e o título do apartamento na mensagem", () => {
    const url = whatsappApartamentoUrl({ codigo: "AP0245", titulo: "Apto 3 quartos" });
    const texto = decodeURIComponent(url.split("text=")[1]);
    expect(texto).toContain("AP0245");
    expect(texto).toContain("Apto 3 quartos");
  });
  it("nunca usa o número antigo", () => {
    expect(whatsappGeralUrl()).not.toContain("988167887");
  });
});
