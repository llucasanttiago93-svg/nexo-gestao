create table public.orders (
  id uuid primary key default gen_random_uuid(),

  user_id uuid not null references auth.users(id) on delete cascade,

  customer_id uuid references public.customers(id) on delete set null,

  order_number bigint generated always as identity,

  status text not null default 'pending'
    check (
      status in (
        'pending',
        'confirmed',
        'processing',
        'shipped',
        'completed',
        'cancelled'
      )
    ),

  payment_status text not null default 'pending'
    check (
      payment_status in (
        'pending',
        'paid',
        'partially_paid',
        'refunded'
      )
    ),

  payment_method text,

  subtotal numeric(12, 2) not null default 0,
  discount numeric(12, 2) not null default 0,
  shipping numeric(12, 2) not null default 0,
  total numeric(12, 2) not null default 0,

  notes text,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint orders_subtotal_non_negative
    check (subtotal >= 0),

  constraint orders_discount_non_negative
    check (discount >= 0),

  constraint orders_shipping_non_negative
    check (shipping >= 0),

  constraint orders_total_non_negative
    check (total >= 0)
);

create index orders_user_id_idx
on public.orders(user_id);

create index orders_customer_id_idx
on public.orders(customer_id);

create index orders_status_idx
on public.orders(status);

create index orders_created_at_idx
on public.orders(created_at);

alter table public.orders enable row level security;

create policy "Users can view their own orders"
on public.orders
for select
to authenticated
using (auth.uid() = user_id);

create policy "Users can create their own orders"
on public.orders
for insert
to authenticated
with check (auth.uid() = user_id);

create policy "Users can update their own orders"
on public.orders
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "Users can delete their own orders"
on public.orders
for delete
to authenticated
using (auth.uid() = user_id);