import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import App from "@/App";
import { PropertyCard } from "@/components/PropertyCard";
import type { Apartamento } from "@/lib/apartamentos";

const ap: Apartamento = {
  id: "1", codigo: "AP0245", titulo: "Apartamento 3 quartos - Calafate", descricao: null, preco: 519999,
  cidade: "Belo Horizonte", bairro: "Calafate", quartos: 3, banheiros: 3, vagas: 1, area_privativa: 126.7,
  area_construida: null, status: "reservado", destaque: true, fotos: [], created_at: "", updated_at: "",
};

function renderEm(path: string) {
  return render(
    <HelmetProvider>
      <MemoryRouter initialEntries={[path]}>
        <App />
      </MemoryRouter>
    </HelmetProvider>,
  );
}

describe("páginas (sem Supabase configurado)", () => {
  it("a Home renderiza o H1 e avisa que a vitrine está em configuração", () => {
    renderEm("/");
    expect(screen.getByRole("heading", { level: 1 }).textContent).toMatch(/apartamento certo/i);
    expect(screen.getAllByText("Vitrine em configuração").length).toBeGreaterThan(0);
  });
  it("a listagem renderiza", () => {
    renderEm("/apartamentos");
    expect(screen.getByRole("heading", { level: 1, name: "Apartamentos à venda" })).toBeInTheDocument();
  });
  it("o contato mostra o WhatsApp oficial", () => {
    renderEm("/contato");
    const links = screen.getAllByRole("link", { name: /97120-7558/ });
    expect(links.length).toBeGreaterThan(0);
  });
  it("rota inexistente mostra 404 em português", () => {
    renderEm("/nao-existe");
    expect(screen.getByText("Página não encontrada")).toBeInTheDocument();
  });
  it("o painel pede configuração do Supabase", async () => {
    renderEm("/admin");
    expect(await screen.findByText("Supabase não configurado")).toBeInTheDocument();
  });
});

describe("PropertyCard", () => {
  it("mostra preço, local, código, status e link para o detalhe", () => {
    render(
      <MemoryRouter>
        <PropertyCard ap={ap} />
      </MemoryRouter>,
    );
    expect(screen.getByText("R$ 519.999")).toBeInTheDocument();
    expect(screen.getByText("Calafate, Belo Horizonte")).toBeInTheDocument();
    expect(screen.getByText("Código AP0245")).toBeInTheDocument();
    expect(screen.getByText("Reservado")).toBeInTheDocument();
    expect(screen.getByRole("link")).toHaveAttribute("href", "/apartamentos/AP0245");
  });
});
