create table public.order_items (
  id uuid primary key default gen_random_uuid(),

  order_id uuid not null references public.orders(id) on delete cascade,

  product_id uuid references public.products(id) on delete set null,

  product_name text not null,
  sku text,

  quantity integer not null default 1,
  unit_price numeric(12, 2) not null default 0,
  total_price numeric(12, 2) not null default 0,

  created_at timestamptz not null default now(),

  constraint order_items_quantity_positive
    check (quantity > 0),

  constraint order_items_unit_price_non_negative
    check (unit_price >= 0),

  constraint order_items_total_price_non_negative
    check (total_price >= 0)
);

create index order_items_order_id_idx
on public.order_items(order_id);

create index order_items_product_id_idx
on public.order_items(product_id);

alter table public.order_items enable row level security;

create policy "Users can view their own order items"
on public.order_items
for select
to authenticated
using (
  exists (
    select 1
    from public.orders
    where orders.id = order_items.order_id
      and orders.user_id = auth.uid()
  )
);

create policy "Users can create their own order items"
on public.order_items
for insert
to authenticated
with check (
  exists (
    select 1
    from public.orders
    where orders.id = order_items.order_id
      and orders.user_id = auth.uid()
  )
);

create policy "Users can update their own order items"
on public.order_items
for update
to authenticated
using (
  exists (
    select 1
    from public.orders
    where orders.id = order_items.order_id
      and orders.user_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.orders
    where orders.id = order_items.order_id
      and orders.user_id = auth.uid()
  )
);

create policy "Users can delete their own order items"
on public.order_items
for delete
to authenticated
using (
  exists (
    select 1
    from public.orders
    where orders.id = order_items.order_id
      and orders.user_id = auth.uid()
  )
);