import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Notice } from "@/components/Notice";
import { STATUS_LABEL, formatPreco, type Apartamento, type StatusApartamento } from "@/lib/apartamentos";
import { atualizar, listarTodos, remover, removerFoto } from "@/lib/repositorio";
import { supabaseConfigurado } from "@/lib/supabase";

export default function Lista() {
  const [lista, setLista] = useState<Apartamento[]>([]);
  const [carregando, setCarregando] = useState(supabaseConfigurado);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    if (!supabaseConfigurado) return;
    let ativo = true;
    listarTodos()
      .then((d) => ativo && setLista(d))
      .catch((e: Error) => ativo && setErro(e.message))
      .finally(() => ativo && setCarregando(false));
    return () => {
      ativo = false;
    };
  }, []);

  const mudarStatus = async (ap: Apartamento, status: StatusApartamento) => {
    setErro(null);
    try {
      const novo = await atualizar(ap.id, { status });
      setLista((l) => l.map((x) => (x.id === ap.id ? novo : x)));
    } catch (e) {
      setErro((e as Error).message);
    }
  };

  const excluir = async (ap: Apartamento) => {
    if (!window.confirm(`Excluir definitivamente o anúncio ${ap.codigo} — ${ap.titulo}?`)) return;
    setErro(null);
    try {
      await remover(ap.id);
      await Promise.allSettled(ap.fotos.map(removerFoto));
      setLista((l) => l.filter((x) => x.id !== ap.id));
    } catch (e) {
      setErro((e as Error).message);
    }
  };

  return (
    <AdminLayout title="Apartamentos">
      <div className="mb-6 flex items-center justify-between gap-4">
        <h1 className="font-rb-serif text-3xl">Apartamentos</h1>
        <Link to="/admin/novo" className="inline-flex h-11 items-center rounded-[4px] bg-rb-teal-strong px-5 text-sm font-medium text-rb-cream hover:bg-rb-ink-900">
          + Novo apartamento
        </Link>
      </div>
      {erro && <div className="mb-4"><Notice title="Erro" tone="erro">{erro}</Notice></div>}
      {carregando && <p role="status">Carregando…</p>}
      {!carregando && lista.length === 0 && <p className="text-rb-stone">Nenhum apartamento cadastrado ainda.</p>}
      {lista.length > 0 && (
        <div className="overflow-x-auto rounded-[4px] border border-rb-stone-line bg-white">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-rb-stone-line text-xs uppercase tracking-wide text-rb-stone">
              <tr>
                <th className="p-3">Código</th>
                <th className="p-3">Título</th>
                <th className="p-3">Preço</th>
                <th className="p-3">Status</th>
                <th className="p-3"><span className="sr-only">Ações</span></th>
              </tr>
            </thead>
            <tbody>
              {lista.map((ap) => (
                <tr key={ap.id} className="border-b border-rb-stone-line last:border-0">
                  <td className="p-3 font-medium">{ap.codigo}</td>
                  <td className="p-3">{ap.titulo}{ap.destaque && <span className="ml-2 text-xs text-rb-teal-strong">★ destaque</span>}</td>
                  <td className="p-3 whitespace-nowrap">{formatPreco(ap.preco)}</td>
                  <td className="p-3">
                    <select
                      aria-label={`Status do ${ap.codigo}`}
                      className="h-9 rounded-[4px] border border-rb-stone-line bg-white px-2"
                      value={ap.status}
                      onChange={(e) => mudarStatus(ap, e.target.value as StatusApartamento)}
                    >
                      {(Object.keys(STATUS_LABEL) as StatusApartamento[]).map((s) => (
                        <option key={s} value={s}>{STATUS_LABEL[s]}</option>
                      ))}
                    </select>
                  </td>
                  <td className="p-3 text-right whitespace-nowrap">
                    <Link to={`/admin/${ap.id}`} className="mr-4 underline underline-offset-4 hover:text-rb-teal-strong">Editar</Link>
                    <button type="button" onClick={() => excluir(ap)} className="text-red-800 underline underline-offset-4">Excluir</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </AdminLayout>
  );
}
