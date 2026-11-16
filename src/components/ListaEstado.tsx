import { Notice } from "@/components/Notice";

/** Mensagens padrão de carregamento/erro/configuração para listas públicas. */
export function ListaEstado({ configurado, carregando, erro }: { configurado: boolean; carregando: boolean; erro: string | null }) {
  if (!configurado) {
    return (
      <Notice title="Vitrine em configuração">
        Os anúncios aparecem aqui assim que a conexão com o banco de dados for configurada.
      </Notice>
    );
  }
  if (carregando) return <p className="text-rb-stone" role="status">Carregando apartamentos…</p>;
  if (erro) return <Notice title="Não foi possível carregar os apartamentos" tone="erro">Tente novamente em instantes.</Notice>;
  return null;
}
