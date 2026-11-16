-- Vitrine de apartamentos — RB Negócios Imobiliários
-- Execute no SQL Editor do Supabase (ou via supabase db push).
--
-- Modelo de acesso:
--   * Leitura (anúncios e fotos): pública, qualquer visitante.
--   * Escrita (criar/editar/excluir anúncios e gerenciar fotos): somente o
--     usuário autenticado cujo e-mail é rbnegociosimobiliarios@gmail.com.
--     Qualquer outro usuário autenticado só consegue ler.
--
-- IMPORTANTE (feito no painel, fora deste script): em Authentication >
-- Providers > Email, mantenha DESATIVADO "Allow new users to sign up" e
-- "Allow anonymous sign-ins", e crie manualmente o único usuário
-- administrador (Authentication > Users > Add user) com o e-mail acima.
-- As políticas abaixo já bloqueiam outros e-mails, mas o cadastro fechado é
-- a primeira barreira.
--
-- Se o e-mail do administrador mudar, troque-o nas 6 políticas "admin ..." abaixo
-- (procure por rbnegociosimobiliarios@gmail.com).

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- Tabela
-- ---------------------------------------------------------------------------
create table if not exists public.apartamentos (
  id uuid primary key default gen_random_uuid(),
  codigo text not null unique,
  titulo text not null,
  descricao text,
  preco numeric(14, 2) not null check (preco >= 0),
  cidade text not null,
  bairro text not null,
  quartos integer not null default 0 check (quartos >= 0),
  banheiros integer not null default 0 check (banheiros >= 0),
  vagas integer not null default 0 check (vagas >= 0),
  area_privativa numeric(10, 2) not null check (area_privativa >= 0),
  area_construida numeric(10, 2) check (area_construida >= 0),
  status text not null default 'disponivel' check (status in ('disponivel', 'reservado', 'vendido')),
  destaque boolean not null default false,
  fotos text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists apartamentos_status_idx on public.apartamentos (status);
create index if not exists apartamentos_bairro_idx on public.apartamentos (bairro);

create or replace function public.set_updated_at() returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists apartamentos_set_updated_at on public.apartamentos;
create trigger apartamentos_set_updated_at
before update on public.apartamentos
for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Permissões de acesso à API (GRANT) — menor privilégio
-- O visitante (anon) só lê; o usuário autenticado pode ler e escrever, mas
-- quem realmente pode escrever é decidido pelas políticas RLS abaixo.
-- ---------------------------------------------------------------------------
grant usage on schema public to anon, authenticated;

revoke all on table public.apartamentos from anon, authenticated;
grant select on table public.apartamentos to anon;
grant select, insert, update, delete on table public.apartamentos to authenticated;

-- ---------------------------------------------------------------------------
-- RLS da tabela
-- O e-mail é lido do campo "email" do token (JWT) — nunca de user_metadata,
-- que o próprio usuário consegue editar.
-- ---------------------------------------------------------------------------
alter table public.apartamentos enable row level security;

-- Remove a política da versão anterior deste script, se existir.
drop policy if exists "escrita autenticada" on public.apartamentos;

drop policy if exists "leitura publica" on public.apartamentos;
create policy "leitura publica" on public.apartamentos
  for select
  to anon, authenticated
  using (true);

drop policy if exists "admin insere apartamentos" on public.apartamentos;
create policy "admin insere apartamentos" on public.apartamentos
  for insert
  to authenticated
  with check (lower(coalesce((select auth.jwt() ->> 'email'), '')) = 'rbnegociosimobiliarios@gmail.com');

drop policy if exists "admin edita apartamentos" on public.apartamentos;
create policy "admin edita apartamentos" on public.apartamentos
  for update
  to authenticated
  using (lower(coalesce((select auth.jwt() ->> 'email'), '')) = 'rbnegociosimobiliarios@gmail.com')
  with check (lower(coalesce((select auth.jwt() ->> 'email'), '')) = 'rbnegociosimobiliarios@gmail.com');

drop policy if exists "admin exclui apartamentos" on public.apartamentos;
create policy "admin exclui apartamentos" on public.apartamentos
  for delete
  to authenticated
  using (lower(coalesce((select auth.jwt() ->> 'email'), '')) = 'rbnegociosimobiliarios@gmail.com');

-- ---------------------------------------------------------------------------
-- Storage das fotos: bucket público, só imagens, até 5 MB por arquivo
-- (5 MB = 5242880 bytes). Rodar de novo atualiza os limites.
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'apartamentos-fotos',
  'apartamentos-fotos',
  true,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp', 'image/avif']
)
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

-- Remove a política da versão anterior deste script, se existir.
drop policy if exists "fotos escrita autenticada" on storage.objects;

drop policy if exists "fotos leitura publica" on storage.objects;
create policy "fotos leitura publica" on storage.objects
  for select
  to anon, authenticated
  using (bucket_id = 'apartamentos-fotos');

drop policy if exists "admin envia fotos" on storage.objects;
create policy "admin envia fotos" on storage.objects
  for insert
  to authenticated
  with check (
    bucket_id = 'apartamentos-fotos'
    and lower(coalesce((select auth.jwt() ->> 'email'), '')) = 'rbnegociosimobiliarios@gmail.com'
  );

drop policy if exists "admin edita fotos" on storage.objects;
create policy "admin edita fotos" on storage.objects
  for update
  to authenticated
  using (
    bucket_id = 'apartamentos-fotos'
    and lower(coalesce((select auth.jwt() ->> 'email'), '')) = 'rbnegociosimobiliarios@gmail.com'
  )
  with check (
    bucket_id = 'apartamentos-fotos'
    and lower(coalesce((select auth.jwt() ->> 'email'), '')) = 'rbnegociosimobiliarios@gmail.com'
  );

drop policy if exists "admin exclui fotos" on storage.objects;
create policy "admin exclui fotos" on storage.objects
  for delete
  to authenticated
  using (
    bucket_id = 'apartamentos-fotos'
    and lower(coalesce((select auth.jwt() ->> 'email'), '')) = 'rbnegociosimobiliarios@gmail.com'
  );
