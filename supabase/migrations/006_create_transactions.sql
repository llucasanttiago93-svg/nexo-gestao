create table public.transactions (
  id uuid primary key default gen_random_uuid(),

  user_id uuid not null references auth.users(id) on delete cascade,

  order_id uuid references public.orders(id) on delete set null,

  type text not null
    check (type in ('income', 'expense')),

  description text not null,

  category text,

  amount numeric(12, 2) not null,

  transaction_date date not null default current_date,

  status text not null default 'completed'
    check (
      status in (
        'pending',
        'completed',
        'cancelled'
      )
    ),

  notes text,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint transactions_amount_positive
    check (amount > 0)
);

create index transactions_user_id_idx
on public.transactions(user_id);

create index transactions_order_id_idx
on public.transactions(order_id);

create index transactions_date_idx
on public.transactions(transaction_date);

create index transactions_type_idx
on public.transactions(type);

alter table public.transactions enable row level security;

create policy "Users can view their own transactions"
on public.transactions
for select
to authenticated
using (auth.uid() = user_id);

create policy "Users can create their own transactions"
on public.transactions
for insert
to authenticated
with check (auth.uid() = user_id);

create policy "Users can update their own transactions"
on public.transactions
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "Users can delete their own transactions"
on public.transactions
for delete
to authenticated
using (auth.uid() = user_id);