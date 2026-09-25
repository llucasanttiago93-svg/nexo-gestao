create table public.categories (
  id uuid primary key default gen_random_uuid(),

  user_id uuid not null references auth.users(id) on delete cascade,

  name text not null,

  type text not null default 'product'
    check (
      type in (
        'product',
        'income',
        'expense'
      )
    ),

  created_at timestamptz not null default now(),

  constraint categories_unique_per_user
    unique (user_id, name, type)
);

create index categories_user_id_idx
on public.categories(user_id);

alter table public.categories enable row level security;

create policy "Users can view their own categories"
on public.categories
for select
to authenticated
using (auth.uid() = user_id);

create policy "Users can create their own categories"
on public.categories
for insert
to authenticated
with check (auth.uid() = user_id);

create policy "Users can update their own categories"
on public.categories
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "Users can delete their own categories"
on public.categories
for delete
to authenticated
using (auth.uid() = user_id);