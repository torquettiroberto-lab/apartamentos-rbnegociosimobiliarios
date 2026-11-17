# Vitrine de apartamentos — RB Negócios Imobiliários

Site de anúncios de apartamentos à venda, pensado para rodar em
`apartamentos.rbnegociosimobiliarios.com.br`, separado do site institucional
(`www.rbnegociosimobiliarios.com.br`). Mesma identidade visual da RB (paleta
petróleo/turquesa, Source Serif 4 + Inter), com layout mais comercial.

**Stack:** Vite + React + TypeScript + Tailwind + React Router (mesma base do
site institucional, compatível com o Lovable) e **Supabase** (banco de dados,
fotos e login do painel).

## O que tem

- **Site público:** Início (busca + destaques), Apartamentos (lista com filtros
  de bairro, quartos, vagas e preço — a URL guarda os filtros), página de cada
  apartamento (galeria, ficha, descrição e botão de WhatsApp que já cita o
  código do imóvel), Contato.
- **Painel** em `/admin`: login, lista de anúncios, trocar status
  (disponível/reservado/vendido) direto na lista, criar, editar e excluir
  anúncios, enviar fotos e escolher a capa. Sem precisar mexer em código.
- Anúncios **vendidos** somem da vitrine; a página direta do imóvel mostra o
  aviso "já foi vendido".
- Contato só por WhatsApp (31) 97120-7558, igual ao site institucional. Sem
  formulários e sem analytics.

## Configurar o Supabase (uma vez)

1. Crie um projeto em <https://supabase.com>.
2. No **SQL Editor**, cole e execute `supabase/migrations/0001_apartamentos.sql`
   (cria a tabela, as regras de segurança e o bucket de fotos).
3. Em **Authentication → Providers → Email**, **desative** "Allow new users to
   sign up". Depois, em **Authentication → Users → Add user**, crie o único
   usuário administrador (e-mail + senha). *Sem desativar o cadastro, qualquer
   pessoa poderia criar conta e editar os anúncios.*
4. Em **Project Settings → API**, copie a **Project URL** e a chave **anon
   public**.
5. Copie `.env.example` para `.env.local` e preencha `VITE_SUPABASE_URL` e
   `VITE_SUPABASE_PUBLISHABLE_KEY`. A chave publishable é pública por natureza; a
   segurança vem das regras (RLS) do script. Nunca use a chave `service_role`
   aqui.

## Rodar localmente

```bash
npm install
npm run dev      # http://localhost:8080
npm test         # testes
npm run build    # build de produção
```

## Publicar no Lovable e no subdomínio

1. Suba este repositório no GitHub e conecte-o a um novo projeto do Lovable.
2. No projeto do Lovable, configure as variáveis de ambiente
   `VITE_SUPABASE_URL` e `VITE_SUPABASE_PUBLISHABLE_KEY` (as mesmas do `.env.local`).
3. Publique e, em **Settings → Domains**, adicione
   `apartamentos.rbnegociosimobiliarios.com.br`.
4. No provedor do DNS do domínio, crie o registro que o Lovable indicar para o
   subdomínio (normalmente um `CNAME` de `apartamentos` apontando para o
   endereço informado pelo Lovable). Não altere os registros de `www` nem do
   domínio raiz — o site institucional continua como está.

## Observações

- O site é uma SPA (sem pré-renderização): os anúncios vêm do Supabase no
  navegador. Se o host não reescrever rotas desconhecidas para `index.html`,
  acessar direto uma URL interna (ex.: `/apartamentos/AP0245`) dará 404 — o
  Lovable já faz essa reescrita.
- Fotos: até 5 MB cada; a primeira da lista é a capa. Se você sair do
  formulário sem salvar, fotos recém-enviadas ficam órfãs no Storage (podem ser
  apagadas depois pelo painel do Supabase).
- Os valores de contato e a marca ficam em `src/config/site.ts`.
