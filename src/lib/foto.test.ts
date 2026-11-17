import { describe, expect, it } from "vitest";
import { dimensoesAlvo, extensaoDoTipo, tipoDeSaida } from "./foto";

describe("preparo de fotos (remoção de EXIF)", () => {
  it("reduz fotos grandes mantendo a proporção e nunca amplia", () => {
    expect(dimensoesAlvo(4000, 3000)).toEqual({ largura: 2560, altura: 1920 });
    expect(dimensoesAlvo(3000, 4000)).toEqual({ largura: 1920, altura: 2560 });
    expect(dimensoesAlvo(800, 600)).toEqual({ largura: 800, altura: 600 });
  });
  it("PNG continua PNG; os demais viram JPEG", () => {
    expect(tipoDeSaida("image/png")).toBe("image/png");
    for (const t of ["image/jpeg", "image/webp", "image/avif"]) expect(tipoDeSaida(t)).toBe("image/jpeg");
    expect(extensaoDoTipo("image/png")).toBe("png");
    expect(extensaoDoTipo("image/jpeg")).toBe("jpg");
  });
});
