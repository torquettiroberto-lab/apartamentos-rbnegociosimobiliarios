import { describe, expect, it } from "vitest";
import { ehChaveSecreta } from "@/lib/chave-supabase";

const jwt = (payload: object) => `x.${btoa(JSON.stringify(payload)).replace(/=+$/, "")}.y`;

describe("ehChaveSecreta", () => {
  it("aceita chaves públicas", () => {
    expect(ehChaveSecreta("sb_publishable_abc123")).toBe(false);
    expect(ehChaveSecreta(jwt({ role: "anon" }))).toBe(false);
    expect(ehChaveSecreta("qualquer-coisa")).toBe(false);
  });
  it("recusa chaves secretas", () => {
    expect(ehChaveSecreta("sb_secret_abc123")).toBe(true);
    expect(ehChaveSecreta(jwt({ role: "service_role" }))).toBe(true);
  });
});
