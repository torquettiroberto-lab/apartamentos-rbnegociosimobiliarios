import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Notice } from "@/components/Notice";
import { STATUS_LABEL, paraNumero, proximoCodigo, type ApartamentoInput, type StatusApartamento } from "@/lib/apartamentos";
import { atualizar, criar, enviarFoto, listarTodos, obterPorId, removerFoto } from "@/lib/repositorio";
import { supabaseConfigurado } from "@/lib/supabase";

interface Campos {
  codigo: string;
  titulo: string;
  descricao: string;
  preco: string;
  cidade: string;
  bairro: string;
  quartos: string;
  banheiros: string;
  vagas: string;
  area_privativa: string;
  area_construida: string;
  status: StatusApartamento;
  destaque: boolean;
}

const vazio: Campos = {
  codigo: "", titulo: "", descricao: "", preco: "", cidade: "", bairro: "",
  quartos: "0", banheiros: "0", vagas: "0", area_privativa: "", area_construida: "",
  status: "disponivel", destaque: false,
};

const campo =
  "mt-1.5 h-11 w-full rounded-[4px] border border-rb-stone-line bg-white px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rb-teal-strong";

export default function Formulario() {
  const { id } = useParams();
  const editando = Boolean(id);
  const navigate = useNavigate();
  const [c, setC] = useState<Campos>(vazio);
  const [fotos, setFotos] = useState<string[]>([]);
  const [removidas, setRemovidas] = useState<string[]>([]);
  const [carregando, setCarregando] = useState(supabaseConfigurado);
  const [enviandoFotos, setEnviandoFotos] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    if (!supabaseConfigurado) return;
    let ativo = true;
    (async () => {
      try {
        if (id) {
          const ap = await obterPorId(id);
          if (!ativo) return;
          if (!ap) {
            setErro("Apartamento não encontrado.");
          } else {
            setC({
              codigo: ap.codigo, titulo: ap.titulo, descricao: ap.descricao ?? "", preco: String(ap.preco),
              cidade: ap.cidade, bairro: ap.bairro, quartos: String(ap.quartos), banheiros: String(ap.banheiros),
              vagas: String(ap.vagas), area_privativa: String(ap.area_privativa),
              area_construida: ap.area_construida != null ? String(ap.area_construida) : "",
              status: ap.status, destaque: ap.destaque,
            });
            setFotos(ap.fotos);
          }
        } else {
          const todos = await listarTodos();
          if (ativo) setC((x) => ({ ...x, codigo: proximoCodigo(todos.map((a) => a.codigo)) }));
        }
      } catch (e) {
        if (ativo) setErro((e as Error).message);
      } finally {
        if (ativo) setCarregando(false);
      }
    })();
    return () => {
      ativo = false;
    };
  }, [id]);

  const set = <K extends keyof Campos>(k: K, v: Campos[K]) => setC((x) => ({ ...x, [k]: v }));

  const aoEscolherFotos = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const arquivos = Array.from(e.target.files ?? []);
    e.target.value = "";
    if (arquivos.length === 0) return;
    setErro(null);
    setEnviandoFotos(true);
    try {
      const urls: string[] = [];
      for (const a of arquivos) urls.push(await enviarFoto(a));
      setFotos((f) => [...f, ...urls]);
    } catch (err) {
      setErro((err as Error).message);
    } finally {
      setEnviandoFotos(false);
    }
  };

  const tirarFoto = (url: string) => {
    setFotos((f) => f.filter((x) => x !== url));
    setRemovidas((r) => [...r, url]);
  };

  const tornarCapa = (url: string) => setFotos((f) => [url, ...f.filter((x) => x !== url)]);

  const salvar = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro(null);

    const preco = paraNumero(c.preco);
    const area = paraNumero(c.area_privativa);
    const areaCons = paraNumero(c.area_construida);
    const inteiro = (v: string) => Math.max(0, Math.floor(Number(v) || 0));
    if (preco == null || Number.isNaN(preco) || preco < 0) return setErro("Informe um preço válido.");
    if (area == null || Number.isNaN(area) || area < 0) return setErro("Informe uma área privativa válida.");
    if (Number.isNaN(areaCons)) return setErro("Área construída inválida.");

    const dados: ApartamentoInput = {
      codigo: c.codigo.trim().toUpperCase(),
      titulo: c.titulo.trim(),
      descricao: c.descricao.trim() || null,
      preco,
      cidade: c.cidade.trim(),
      bairro: c.bairro.trim(),
      quartos: inteiro(c.quartos),
      banheiros: inteiro(c.banheiros),
      vagas: inteiro(c.vagas),
      area_privativa: area,
      area_construida: areaCons,
      status: c.status,
      destaque: c.destaque,
      fotos,
    };

    setSalvando(true);
    try {
      if (id) await atualizar(id, dados);
      else await criar(dados);
      await Promise.allSettled(removidas.map(removerFoto));
      navigate("/admin");
    } catch (err) {
      const msg = (err as { message?: string; code?: string });
      setErro(msg.code === "23505" ? "Já existe um apartamento com esse código." : (msg.message ?? "Erro ao salvar."));
    } finally {
      setSalvando(false);
    }
  };

  return (
    <AdminLayout title={editando ? "Editar apartamento" : "Novo apartamento"}>
      <h1 className="mb-6 font-rb-serif text-3xl">{editando ? "Editar apartamento" : "Novo apartamento"}</h1>
      {carregando && <p role="status">Carregando…</p>}
      {erro && <div className="mb-4"><Notice title="Atenção" tone="erro">{erro}</Notice></div>}
      {!carregando && (
        <form onSubmit={salvar} className="space-y-6 rounded-[4px] border border-rb-stone-line bg-white p-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block text-sm font-medium">Código
              <input required className={campo} value={c.codigo} onChange={(e) => set("codigo", e.target.value)} />
            </label>
            <label className="block text-sm font-medium">Status
              <select className={campo} value={c.status} onChange={(e) => set("status", e.target.value as StatusApartamento)}>
                {(Object.keys(STATUS_LABEL) as StatusApartamento[]).map((s) => <option key={s} value={s}>{STATUS_LABEL[s]}</option>)}
              </select>
            </label>
          </div>
          <label className="block text-sm font-medium">Título do anúncio
            <input required className={campo} value={c.titulo} onChange={(e) => set("titulo", e.target.value)} />
          </label>
          <div className="grid gap-4 sm:grid-cols-3">
            <label className="block text-sm font-medium">Preço (R$)
              <input required inputMode="decimal" className={campo} value={c.preco} onChange={(e) => set("preco", e.target.value)} />
            </label>
            <label className="block text-sm font-medium">Cidade
              <input required className={campo} value={c.cidade} onChange={(e) => set("cidade", e.target.value)} />
            </label>
            <label className="block text-sm font-medium">Bairro
              <input required className={campo} value={c.bairro} onChange={(e) => set("bairro", e.target.value)} />
            </label>
          </div>
          <div className="grid gap-4 sm:grid-cols-5">
            <label className="block text-sm font-medium">Quartos
              <input type="number" min={0} className={campo} value={c.quartos} onChange={(e) => set("quartos", e.target.value)} />
            </label>
            <label className="block text-sm font-medium">Banheiros
              <input type="number" min={0} className={campo} value={c.banheiros} onChange={(e) => set("banheiros", e.target.value)} />
            </label>
            <label className="block text-sm font-medium">Vagas
              <input type="number" min={0} className={campo} value={c.vagas} onChange={(e) => set("vagas", e.target.value)} />
            </label>
            <label className="block text-sm font-medium">Área privativa (m²)
              <input required inputMode="decimal" className={campo} value={c.area_privativa} onChange={(e) => set("area_privativa", e.target.value)} />
            </label>
            <label className="block text-sm font-medium">Área construída (m²)
              <input inputMode="decimal" className={campo} value={c.area_construida} onChange={(e) => set("area_construida", e.target.value)} />
            </label>
          </div>
          <label className="block text-sm font-medium">Descrição
            <textarea rows={6} className={campo + " h-auto py-2"} value={c.descricao} onChange={(e) => set("descricao", e.target.value)} />
          </label>
          <label className="flex items-center gap-2 text-sm font-medium">
            <input type="checkbox" checked={c.destaque} onChange={(e) => set("destaque", e.target.checked)} />
            Mostrar em destaque na página inicial
          </label>

          <fieldset>
            <legend className="text-sm font-medium">Fotos</legend>
            <p className="mt-1 text-xs text-rb-stone">A primeira foto é a capa. Até 5 MB por foto.</p>
            <input type="file" accept="image/*" multiple aria-label="Adicionar fotos" onChange={aoEscolherFotos} disabled={enviandoFotos} className="mt-2 text-sm" />
            {enviandoFotos && <p role="status" className="mt-2 text-sm">Enviando fotos…</p>}
            {fotos.length > 0 && (
              <ul className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
                {fotos.map((url, i) => (
                  <li key={url} className="rounded-[4px] border border-rb-stone-line p-2">
                    <img src={url} alt={`Foto ${i + 1}`} width={200} height={150} className="aspect-[4/3] w-full object-cover" />
                    <div className="mt-2 flex items-center justify-between text-xs">
                      {i === 0 ? <span className="font-medium text-rb-teal-strong">Capa</span> : (
                        <button type="button" className="underline underline-offset-2" onClick={() => tornarCapa(url)}>Tornar capa</button>
                      )}
                      <button type="button" className="text-red-800 underline underline-offset-2" onClick={() => tirarFoto(url)}>Remover</button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </fieldset>

          <div className="flex gap-3">
            <button type="submit" disabled={salvando || enviandoFotos} className="h-11 rounded-[4px] bg-rb-teal-strong px-6 text-sm font-medium text-rb-cream hover:bg-rb-ink-900 disabled:opacity-60">
              {salvando ? "Salvando…" : "Salvar"}
            </button>
            <button type="button" onClick={() => navigate("/admin")} className="h-11 rounded-[4px] border border-rb-graphite px-6 text-sm font-medium">Cancelar</button>
          </div>
        </form>
      )}
    </AdminLayout>
  );
}
