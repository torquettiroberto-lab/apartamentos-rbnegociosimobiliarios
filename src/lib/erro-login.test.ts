import { describe, expect, it } from "vitest";
import { mensagemErroLogin } from "./erro-login";

describe("mensagemErroLogin", () => {
  it("distingue credenciais inválidas de e-mail não confirmado", () => {
    expect(mensagemErroLogin({ code: "invalid_credentials", status: 400 })).toMatch(/invalid_credentials/);
    expect(mensagemErroLogin({ code: "email_not_confirmed", status: 400 })).toMatch(/não foi confirmado/);
  });
  it("trata limite de requisições, chave recusada e falha de rede", () => {
    expect(mensagemErroLogin({ code: "over_request_rate_limit", status: 429 })).toMatch(/Muitas tentativas/);
    expect(mensagemErroLogin({ status: 401 })).toMatch(/chave/);
    expect(mensagemErroLogin(new Error("Failed to fetch"))).toMatch(/Não foi possível falar/);
  });
});
