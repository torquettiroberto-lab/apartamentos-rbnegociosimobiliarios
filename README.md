# Vitrine de apartamentos — RB Negócios Imobiliários

Site de anúncios de apartamentos à venda, destinado a
`imoveis.rbnegociosimobiliarios.com.br`, separado do site institucional
(`www.rbnegociosimobiliarios.com.br`). Mesma identidade visual da RB (paleta
petróleo/turquesa, Source Serif 4 + Inter), com layout mais comercial.

**Stack:** Vite 5 + React 18 + TypeScript + Tailwind 3 + React Router 6, e
**Supabase** (banco de dados Postgres, autenticação do painel e fotos).

## O que tem

- **Site público:** Início (busca + destaques), Apartamentos (lista com filtros
  de bairro, quartos, vagas e preço — a URL guarda os filtros), página de cada
  apartamento (galeria, ficha, descrição e botão de WhatsApp que cita o código
  do imóvel) e Contato.
- **Painel** em `/admin`: login, lista de anúncios, troca de status
  (disponível/reservado/vendido), criar, editar e excluir anúncios, enviar fotos
  e escolher a capa, e cadastrar o endereço completo do imóvel.
- Anúncios **vendidos** somem da vitrine; a página direta do imóvel mostra o
  aviso "já foi vendido".
- Contato só por WhatsApp (31) 97120-7558. Sem formulários e sem analytics.

## Estrutura do projeto

```
src/
  pages/          Home, Listagem, Detalhe, Contato, NotFound
  pages/admin/    Login, Lista, Formulario (painel)
  components/     cards, filtros, galeria, layout e AdminLayout
  lib/
    supabase.ts       cliente Supabase (recusa chaves secretas)
    repositorio.ts    todas as consultas ao banco e ao Storage
    apartamentos.ts   tipos, validação de endereço e formatação
    auth.tsx          sessão do administrador
    viacep.ts         preenchimento por CEP (painel)
    foto.ts           remoção de EXIF antes do envio
  config/site.ts  marca e contato
supabase/migrations/   SQL do banco (0001 e 0002)
```

## Instalação e uso local

Requer Node.js 18+ (testado com Node 22).

```bash
npm install
cp .env.example .env.local   # preencha as variáveis (abaixo)
npm run dev                  # http://localhost:8080
```

Se o servidor não subir por erro de endereço IPv6 (`EAFNOSUPPORT`), use:
`npm run dev -- --host 127.0.0.1`.

| Comando | O que faz |
|---|---|
| `npm run dev` | servidor de desenvolvimento |
| `npm run build` | build de produção em `dist/` |
| `npm test` | testes automatizados (Vitest) |
| `npm run lint` | ESLint |
| `npx tsc -p tsconfig.app.json --noEmit` | checagem de tipos |

Os testes nunca usam credenciais reais: o Vitest força as variáveis do Supabase
vazias.

## Variáveis de ambiente

Defina em `.env.local` (ignorado pelo Git; nunca é commitado):

| Variável | Valor |
|---|---|
| `VITE_SUPABASE_URL` | Project URL do projeto Supabase |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | **Publishable key** (`sb_publishable_…`) |

A chave publishable é pública por natureza; a segurança vem das regras de acesso
no banco (RLS e permissões por coluna). **Nunca** use `service_role` ou
`sb_secret_…` em variáveis `VITE_*`: o cliente se recusa a iniciar com elas.
Depois de mudar o `.env.local`, reinicie o servidor de desenvolvimento.

## Supabase

### Configuração inicial (uma vez)

1. Crie um projeto em <https://supabase.com>.
2. Em **Authentication → Providers → Email**, **desative** "Allow new users to
   sign up" e "Allow anonymous sign-ins". Em **Authentication → Users → Add
   user**, crie o único administrador (e-mail + senha, com **Auto Confirm
   User**). *Sem desativar o cadastro, qualquer pessoa poderia criar conta.*
3. Em **Project Settings → API Keys**, copie a **Project URL** e a **Publishable
   key** para o `.env.local`.
4. No **SQL Editor**, execute as migrações na ordem abaixo.

### Migrações (`supabase/migrations/`)

| Arquivo | Conteúdo | Situação |
|---|---|---|
| `0001_apartamentos.sql` | tabela, RLS, permissões e bucket de fotos | executada |
| `0002_endereco.sql` | colunas de endereço e privacidade por coluna | **PENDENTE — ainda não foi executada** |

**Ordem e cuidados da `0002`:**

- Execute-a **somente depois** de o código desta versão estar rodando. O código
  novo lê só as colunas públicas; a versão antiga (`select *`) deixa de listar
  apartamentos assim que a `0002` for aplicada.
- **Não rode a `0001` de novo depois da `0002`:** o `GRANT` da `0001` devolveria
  ao visitante a leitura de todas as colunas. Se rodar, execute a `0002` em
  seguida (ela é idempotente).
- Antes de executar, faça um backup da tabela (exportar CSV pelo painel).
- Ela não apaga nem altera apartamentos já cadastrados: as novas colunas nascem
  vazias.
- Depois de executar, confirme como visitante que as colunas públicas respondem
  e que `cep`, `numero`, `complemento` e `select=*` são negados.
- **Reversão:** não restaure a leitura geral da tabela para o visitante (um
  `GRANT SELECT` na tabela inteira), pois isso expõe `cep`, `numero` e
  `complemento`. Qualquer reversão exige revisão específica das permissões antes
  de ser executada.

### Modelo de acesso

- **Leitura pública:** qualquer visitante lê anúncios e fotos.
- **Escrita:** só o usuário autenticado com o e-mail do administrador (definido
  nas políticas RLS da `0001`; se o e-mail mudar, troque-o nas políticas).

### Endereço e privacidade

- O painel cadastra CEP (opcional), rua, número, complemento ("Não possui"
  quando não houver), bairro, cidade e estado. Em **cadastros novos** o endereço
  completo é obrigatório (CEP à parte); apartamentos antigos podem ser editados
  sem endereço.
- A **vitrine pública mostra apenas rua, bairro e cidade.** CEP, número e
  complemento ficam privados: o código nunca os pede nas consultas públicas
  (nada de `select("*")`) e, após a `0002`, o próprio banco os bloqueia para
  visitantes por permissão de coluna.
- A lista de colunas públicas fica em `COLUNAS_PUBLICAS`
  (`src/lib/apartamentos.ts`) e precisa ser igual ao `GRANT` da `0002`; um teste
  compara as duas.
- **ViaCEP:** ao digitar o CEP, o painel consulta <https://viacep.com.br> para
  preencher rua, bairro, cidade e estado. Só o CEP é enviado a esse serviço.
- Título e descrição são públicos: não escreva número, complemento ou outro
  dado do endereço exato neles.

### Fotos

- JPG, PNG, WebP ou AVIF, até 5 MB; a primeira da lista é a capa.
- No envio, a foto é redesenhada e **todos os metadados (EXIF, inclusive GPS)
  são removidos**; imagens grandes são reduzidas a no máximo 2560 px. Se a foto
  não puder ser processada, ela não é enviada. Fotos enviadas antes desse
  tratamento não foram limpas.
- Se você sair do formulário sem salvar, fotos recém-enviadas ficam órfãs no
  Storage e podem ser apagadas pelo painel do Supabase.

## Solução de problemas do login

A tela de login mostra o motivo real da falha:

- **`invalid_credentials`:** e-mail ou senha não conferem com o usuário no
  Supabase.
- **E-mail não confirmado:** confirme o usuário em Authentication → Users.
- **Muitas tentativas:** aguarde alguns minutos.
- **Chave recusada:** a `VITE_SUPABASE_PUBLISHABLE_KEY` está incompleta ou é de
  outro projeto; confira o `.env.local` e reinicie o servidor.
- Em desenvolvimento, a tela mostra o host do projeto Supabase em uso.

## Hospedagem

A hospedagem do subdomínio **ainda não está definida**. O build (`npm run
build`) gera arquivos estáticos em `dist/`, que podem ser servidos por qualquer
host estático. Requisitos:

- Definir `VITE_SUPABASE_URL` e `VITE_SUPABASE_PUBLISHABLE_KEY` no ambiente de
  build do host.
- O site é uma SPA (sem pré-renderização): o host precisa reescrever rotas
  desconhecidas para `index.html`, senão acessar direto uma URL interna (ex.:
  `/apartamentos/AP0245`) dará 404.
- No DNS, o subdomínio `imoveis` aponta para o host escolhido; não altere os
  registros de `www` nem do domínio raiz, onde fica o site institucional.

## Observações

- Os valores de contato e a marca ficam em `src/config/site.ts`.
- `package.json` e `vite.config.ts` ainda trazem uma dependência de
  desenvolvimento herdada do modelo inicial do projeto; ela não é necessária
  para hospedar o site.
