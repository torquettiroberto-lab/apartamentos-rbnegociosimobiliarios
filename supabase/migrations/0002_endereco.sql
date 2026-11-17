-- Vitrine de apartamentos — RB Negócios Imobiliários
-- Migração 0002: endereço completo + privacidade por coluna.
--
-- NÃO EXECUTAR antes de publicar/rodar o código novo (que lê só as colunas
-- públicas). Executar no SQL Editor do Supabase, depois da 0001.
--
-- O que faz:
--   1. Adiciona cep, rua, numero, complemento e estado (todas opcionais no
--      banco, sem valor padrão): os apartamentos já cadastrados NÃO são
--      alterados. A obrigatoriedade para cadastros novos é do formulário.
--   2. Privacidade por coluna: o visitante (anon) deixa de ler a tabela inteira
--      e passa a ler só as colunas públicas. cep, numero e complemento ficam
--      acessíveis apenas ao usuário autenticado (as políticas RLS de admin da
--      0001 continuam valendo para escrita).
--
-- ATENÇÃO: NÃO rode a 0001 de novo depois desta. O GRANT de tabela inteira da
-- 0001 devolveria a leitura de todas as colunas ao visitante. Se rodar, execute
-- a 0002 em seguida (é idempotente).
--
-- A lista de colunas públicas abaixo deve ser igual a COLUNAS_PUBLICAS em
-- src/lib/apartamentos.ts (há um teste que compara as duas).

-- ---------------------------------------------------------------------------
-- 1. Novas colunas (aditivo; não toca nas linhas existentes)
-- ---------------------------------------------------------------------------
alter table public.apartamentos
  add column if not exists cep text,
  add column if not exists rua text,
  add column if not exists numero text,
  add column if not exists complemento text,
  add column if not exists estado text;

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'apartamentos_cep_formato' and conrelid = 'public.apartamentos'::regclass
  ) then
    alter table public.apartamentos
      add constraint apartamentos_cep_formato check (cep is null or cep ~ '^[0-9]{8}$');
  end if;
  if not exists (
    select 1 from pg_constraint
    where conname = 'apartamentos_estado_formato' and conrelid = 'public.apartamentos'::regclass
  ) then
    alter table public.apartamentos
      add constraint apartamentos_estado_formato check (estado is null or estado ~ '^[A-Z]{2}$');
  end if;
end
$$;

-- ---------------------------------------------------------------------------
-- 2. Privacidade por coluna
-- ---------------------------------------------------------------------------
revoke select on table public.apartamentos from anon;

grant select (
  id, codigo, titulo, descricao, preco, cidade, bairro, rua, estado,
  quartos, banheiros, vagas, area_privativa, area_construida, status,
  destaque, fotos, created_at, updated_at
) on table public.apartamentos to anon;

-- Defesa em profundidade: remove qualquer leitura herdada via PUBLIC e garante
-- que as colunas privadas não tenham permissão para o visitante nem para PUBLIC.
-- (No Supabase padrão estes dois comandos não mudam nada: a auditoria de
-- permissões mostrou que PUBLIC não tem acesso à tabela e que não há grants de
-- coluna. Servem de proteção caso algum apareça no futuro.)
revoke all on table public.apartamentos from public;
revoke select (cep, numero, complemento) on table public.apartamentos from anon, public;

-- O usuário autenticado continua com leitura e escrita completas (0001); quem
-- pode escrever é decidido pelas políticas RLS "admin ...".
