create table public.customers (
  id uuid primary key default gen_random_uuid(),

  user_id uuid not null references auth.users(id) on delete cascade,

  name text not null,
  email text,
  phone text,

  document text,

  address text,
  number text,
  complement text,
  neighborhood text,
  city text,
  state text,
  zip_code text,

  notes text,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index customers_user_id_idx
on public.customers(user_id);

create index customers_name_idx
on public.customers(name);

alter table public.customers enable row level security;

create policy "Users can view their own customers"
on public.customers
for select
to authenticated
using (auth.uid() = user_id);

create policy "Users can create their own customers"
on public.customers
for insert
to authenticated
with check (auth.uid() = user_id);

create policy "Users can update their own customers"
on public.customers
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "Users can delete their own customers"
on public.customers
for delete
to authenticated
using (auth.uid() = user_id);