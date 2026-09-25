create table public.products (
  id uuid primary key default gen_random_uuid(),

  user_id uuid not null references auth.users(id) on delete cascade,

  name text not null,
  sku text not null,
  category text not null,

  price numeric(12, 2) not null default 0,
  stock integer not null default 0,
  min_stock integer not null default 0,

  status text not null default 'active'
    check (status in ('active', 'inactive')),

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint products_price_non_negative
    check (price >= 0),

  constraint products_stock_non_negative
    check (stock >= 0),

  constraint products_min_stock_non_negative
    check (min_stock >= 0),

  constraint products_sku_unique_per_user
    unique (user_id, sku)
);

create index products_user_id_idx
on public.products(user_id);

create index products_category_idx
on public.products(category);

create index products_status_idx
on public.products(status);

alter table public.products enable row level security;

create policy "Users can view their own products"
on public.products
for select
to authenticated
using (auth.uid() = user_id);

create policy "Users can create their own products"
on public.products
for insert
to authenticated
with check (auth.uid() = user_id);

create policy "Users can update their own products"
on public.products
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "Users can delete their own products"
on public.products
for delete
to authenticated
using (auth.uid() = user_id);