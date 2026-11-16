-- Vitrine de apartamentos — RB Negócios Imobiliários
-- Execute no SQL Editor do Supabase (ou via supabase db push).

create extension if not exists "pgcrypto";

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
language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists apartamentos_set_updated_at on public.apartamentos;
create trigger apartamentos_set_updated_at
before update on public.apartamentos
for each row execute function public.set_updated_at();

-- Segurança (RLS): qualquer visitante lê; só usuário autenticado escreve.
-- IMPORTANTE: no painel do Supabase, em Authentication > Providers > Email,
-- DESATIVE "Allow new users to sign up" e crie manualmente o único usuário
-- administrador (Authentication > Users > Add user). Sem isso, qualquer
-- pessoa poderia se cadastrar e editar os anúncios.
alter table public.apartamentos enable row level security;

drop policy if exists "leitura publica" on public.apartamentos;
create policy "leitura publica" on public.apartamentos
  for select using (true);

drop policy if exists "escrita autenticada" on public.apartamentos;
create policy "escrita autenticada" on public.apartamentos
  for all to authenticated using (true) with check (true);

-- Storage das fotos: leitura pública, escrita só autenticada.
insert into storage.buckets (id, name, public)
values ('apartamentos-fotos', 'apartamentos-fotos', true)
on conflict (id) do nothing;

drop policy if exists "fotos leitura publica" on storage.objects;
create policy "fotos leitura publica" on storage.objects
  for select using (bucket_id = 'apartamentos-fotos');

drop policy if exists "fotos escrita autenticada" on storage.objects;
create policy "fotos escrita autenticada" on storage.objects
  for all to authenticated
  using (bucket_id = 'apartamentos-fotos')
  with check (bucket_id = 'apartamentos-fotos');
