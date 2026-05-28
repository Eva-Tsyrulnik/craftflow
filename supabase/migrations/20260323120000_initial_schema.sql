-- CraftFlow §10 — начальная схема + RLS

create extension if not exists "pgcrypto";

-- ── users (профиль, связан с auth.users) ─────────────────────────────
create table public.users (
  id uuid primary key references auth.users (id) on delete cascade,
  email varchar,
  telegram_id bigint,
  name varchar not null,
  avatar_url text,
  role text not null default 'client'
    check (role in ('master', 'client', 'both')),
  platform_origin varchar not null default 'web',
  created_at timestamptz not null default now()
);

-- ── masters ───────────────────────────────────────────────────────────
create table public.masters (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users (id) on delete cascade,
  categories text[] not null default '{}',
  bio text not null,
  portfolio_urls text[],
  price_from integer not null,
  rating numeric(3, 2),
  reviews_count integer not null default 0,
  is_pro boolean not null default false,
  is_verified boolean not null default false,
  promoted_until timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id)
);

-- ── orders ────────────────────────────────────────────────────────────
create table public.orders (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.users (id) on delete cascade,
  master_id uuid not null references public.masters (id) on delete cascade,
  title varchar not null,
  description text not null,
  reference_urls text[],
  budget integer not null,
  deadline date not null,
  status text not null default 'pending'
    check (status in ('pending', 'active', 'in_progress', 'review', 'completed', 'cancelled')),
  escrow_id varchar,
  escrow_status text check (escrow_status in ('held', 'released', 'refunded')),
  platform_origin varchar not null default 'web',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.order_stages (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders (id) on delete cascade,
  name varchar not null,
  status text not null default 'pending'
    check (status in ('pending', 'in_progress', 'submitted', 'approved', 'revision')),
  files_urls text[],
  comment text,
  sort_order integer not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.messages (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders (id) on delete cascade,
  sender_id uuid not null references public.users (id) on delete cascade,
  body text,
  file_url text,
  created_at timestamptz not null default now()
);

create table public.reviews (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders (id) on delete cascade unique,
  reviewer_id uuid not null references public.users (id) on delete cascade,
  master_id uuid not null references public.masters (id) on delete cascade,
  rating integer not null check (rating between 1 and 5),
  text text,
  created_at timestamptz not null default now()
);

-- ── триггер: профиль при регистрации ──────────────────────────────────
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.users (id, email, name, role, platform_origin)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'name', split_part(coalesce(new.email, 'user'), '@', 1)),
    coalesce(new.raw_user_meta_data ->> 'role', 'client'),
    coalesce(new.raw_user_meta_data ->> 'platform_origin', 'web')
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ── RLS ───────────────────────────────────────────────────────────────
alter table public.users enable row level security;
alter table public.masters enable row level security;
alter table public.orders enable row level security;
alter table public.order_stages enable row level security;
alter table public.messages enable row level security;
alter table public.reviews enable row level security;

-- users
create policy "users_select_own" on public.users
  for select using (auth.uid() = id);
create policy "users_select_master_public" on public.users
  for select using (
    exists (select 1 from public.masters m where m.user_id = id)
  );
create policy "users_update_own" on public.users
  for update using (auth.uid() = id);
create policy "users_insert_own" on public.users
  for insert with check (auth.uid() = id);

-- masters (публичное чтение)
create policy "masters_select_public" on public.masters
  for select using (true);
create policy "masters_insert_own" on public.masters
  for insert with check (auth.uid() = user_id);
create policy "masters_update_own" on public.masters
  for update using (auth.uid() = user_id);
create policy "masters_delete_own" on public.masters
  for delete using (auth.uid() = user_id);

-- orders (участники)
create policy "orders_select_participant" on public.orders
  for select using (
    auth.uid() = client_id
    or auth.uid() = (select user_id from public.masters m where m.id = master_id)
  );
create policy "orders_insert_client" on public.orders
  for insert with check (auth.uid() = client_id);
create policy "orders_update_participant" on public.orders
  for update using (
    auth.uid() = client_id
    or auth.uid() = (select user_id from public.masters m where m.id = master_id)
  );

-- order_stages
create policy "stages_select_participant" on public.order_stages
  for select using (
    exists (
      select 1 from public.orders o
      where o.id = order_id
        and (
          auth.uid() = o.client_id
          or auth.uid() = (select user_id from public.masters m where m.id = o.master_id)
        )
    )
  );
create policy "stages_insert_master" on public.order_stages
  for insert with check (
    exists (
      select 1 from public.orders o
      join public.masters m on m.id = o.master_id
      where o.id = order_id and auth.uid() = m.user_id
    )
  );
create policy "stages_update_master" on public.order_stages
  for update using (
    exists (
      select 1 from public.orders o
      join public.masters m on m.id = o.master_id
      where o.id = order_id and auth.uid() = m.user_id
    )
  );

-- messages
create policy "messages_select_participant" on public.messages
  for select using (
    exists (
      select 1 from public.orders o
      where o.id = order_id
        and (
          auth.uid() = o.client_id
          or auth.uid() = (select user_id from public.masters m where m.id = o.master_id)
        )
    )
  );
create policy "messages_insert_participant" on public.messages
  for insert with check (
    auth.uid() = sender_id
    and exists (
      select 1 from public.orders o
      where o.id = order_id
        and (
          auth.uid() = o.client_id
          or auth.uid() = (select user_id from public.masters m where m.id = o.master_id)
        )
    )
  );

-- reviews (публичное чтение)
create policy "reviews_select_public" on public.reviews
  for select using (true);
create policy "reviews_insert_client" on public.reviews
  for insert with check (auth.uid() = reviewer_id);

-- ── updated_at ────────────────────────────────────────────────────────
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger masters_updated_at before update on public.masters
  for each row execute function public.set_updated_at();
create trigger orders_updated_at before update on public.orders
  for each row execute function public.set_updated_at();
create trigger order_stages_updated_at before update on public.order_stages
  for each row execute function public.set_updated_at();
