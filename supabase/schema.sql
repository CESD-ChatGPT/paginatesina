-- ═══════════════════════════════════════════════════════════════
-- SOLVUS — esquema de inventario multiusuario
--
-- Cómo correrlo:
--   Panel de Supabase → SQL Editor → New query → pegar todo → Run.
--   Es idempotente: se puede volver a correr sin romper nada.
--
-- Modelo de aislamiento: cada fila pertenece a un usuario
-- (`user_id`) y Row Level Security hace que nadie pueda leer ni
-- escribir filas de otro. Sin RLS, la anon key —que viaja en el
-- bundle y es pública por diseño— dejaría leer la tabla entera.
-- ═══════════════════════════════════════════════════════════════

-- ── PERFILES ──────────────────────────────────────────────────
-- El rol vive acá y NO en auth.users.user_metadata, que el propio
-- usuario puede escribir con la anon key: cualquiera podría haberse
-- puesto `administrador` solo. Acá el rol es una columna que el
-- cliente no tiene permiso de UPDATE (ver el GRANT más abajo).
create table if not exists public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  name        text not null default '',
  job_title   text not null default '',
  role        text not null default 'operador'
              check (role in ('administrador', 'supervisor', 'operador', 'consulta')),
  created_at  timestamptz not null default now()
);

-- ── DEPÓSITOS ─────────────────────────────────────────────────
create table if not exists public.warehouses (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  code        text not null,
  name        text not null,
  created_at  timestamptz not null default now(),
  unique (user_id, code)
);

-- ── PROVEEDORES ───────────────────────────────────────────────
create table if not exists public.suppliers (
  id               uuid primary key default gen_random_uuid(),
  user_id          uuid not null references auth.users(id) on delete cascade,
  name             text not null,
  lead_time_days   integer not null default 7 check (lead_time_days >= 0),
  frequency        text not null default 'Mensual',
  last_purchase_at date,
  created_at       timestamptz not null default now(),
  unique (user_id, name)
);

-- ── PRODUCTOS ─────────────────────────────────────────────────
create table if not exists public.products (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid not null references auth.users(id) on delete cascade,
  sku            text not null,
  name           text not null,
  category       text not null default 'Sin categoría',
  unit_cost      numeric(12,2) not null default 0 check (unit_cost >= 0),
  ean            text,
  reorder_point  integer not null default 0 check (reorder_point >= 0),
  supplier_id    uuid references public.suppliers(id) on delete set null,
  created_at     timestamptz not null default now(),
  unique (user_id, sku)
);

-- ── STOCK POR DEPÓSITO ────────────────────────────────────────
-- El stock no se guarda en products: el mismo SKU vive en varios
-- depósitos y las transferencias mueven entre ellos.
create table if not exists public.stock_levels (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references auth.users(id) on delete cascade,
  product_id    uuid not null references public.products(id) on delete cascade,
  warehouse_id  uuid not null references public.warehouses(id) on delete cascade,
  qty           integer not null default 0 check (qty >= 0),
  last_sale_at  date,
  unique (product_id, warehouse_id)
);

-- ── MOVIMIENTOS ───────────────────────────────────────────────
-- De acá sale la serie de demanda: no se inventa, se agrega desde
-- las salidas reales. Un usuario nuevo no tiene serie, y eso es
-- correcto — la pantalla lo dice en vez de dibujar una curva falsa.
create table if not exists public.stock_moves (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references auth.users(id) on delete cascade,
  product_id    uuid not null references public.products(id) on delete cascade,
  warehouse_id  uuid references public.warehouses(id) on delete set null,
  delta         integer not null,
  kind          text not null check (kind in ('venta','compra','ajuste','transferencia')),
  reason        text,
  created_at    timestamptz not null default now()
);

create index if not exists stock_moves_user_fecha on public.stock_moves (user_id, created_at desc);

-- ── CONTEOS FÍSICOS PENDIENTES ────────────────────────────────
create table if not exists public.physical_counts (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  product_id  uuid not null references public.products(id) on delete cascade,
  counted     integer not null check (counted >= 0),
  created_at  timestamptz not null default now(),
  unique (user_id, product_id)
);

-- ── AUDITORÍA ─────────────────────────────────────────────────
create table if not exists public.audit_events (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  actor_name  text not null default 'Sistema',
  action      text not null,
  target      text,
  detail      text,
  reason      text,
  created_at  timestamptz not null default now()
);

create index if not exists audit_events_user_fecha on public.audit_events (user_id, created_at desc);

-- ═══════════════════════════════════════════════════════════════
-- ROW LEVEL SECURITY
--
-- Sin esto nada de lo de arriba protege nada: la anon key es pública
-- y cualquiera podría leer todas las filas de todos los usuarios.
-- ═══════════════════════════════════════════════════════════════

alter table public.profiles        enable row level security;
alter table public.warehouses      enable row level security;
alter table public.suppliers       enable row level security;
alter table public.products        enable row level security;
alter table public.stock_levels    enable row level security;
alter table public.stock_moves     enable row level security;
alter table public.physical_counts enable row level security;
alter table public.audit_events    enable row level security;

-- Perfil: cada uno ve y edita el suyo.
drop policy if exists "perfil propio: leer" on public.profiles;
create policy "perfil propio: leer" on public.profiles
  for select using (auth.uid() = id);

drop policy if exists "perfil propio: editar" on public.profiles;
create policy "perfil propio: editar" on public.profiles
  for update using (auth.uid() = id) with check (auth.uid() = id);

-- El resto de las tablas: dueño por user_id.
do $$
declare t text;
begin
  foreach t in array array['warehouses','suppliers','products','stock_levels',
                           'stock_moves','physical_counts','audit_events']
  loop
    execute format('drop policy if exists "dueño: todo" on public.%I', t);
    execute format(
      'create policy "dueño: todo" on public.%I for all
         using (auth.uid() = user_id) with check (auth.uid() = user_id)', t);
  end loop;
end $$;

-- ── El rol no se puede cambiar desde el cliente ────────────────
-- RLS no filtra por columna, así que el candado va en los permisos:
-- el cliente puede actualizar su nombre y su puesto, nunca su rol.
-- Cambiar un rol es tarea del panel de Supabase o de una función con
-- service_role, que jamás viaja al navegador.
revoke update on public.profiles from authenticated;
grant  update (name, job_title) on public.profiles to authenticated;

-- ── Alta automática de perfil ─────────────────────────────────
-- Con el menor privilegio: toda cuenta nueva nace como 'operador'.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, name, job_title, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', ''),
    coalesce(new.raw_user_meta_data->>'jobTitle', ''),
    'operador'
  )
  on conflict (id) do nothing;
  return new;
end $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Perfiles para las cuentas que ya existían antes de esta migración.
insert into public.profiles (id, name, job_title, role)
select u.id,
       coalesce(u.raw_user_meta_data->>'name', ''),
       coalesce(u.raw_user_meta_data->>'jobTitle', ''),
       'operador'
from auth.users u
on conflict (id) do nothing;
