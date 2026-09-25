-- =========================================================
-- NEXO GESTÃO
-- MIGRATION 009
-- REGRAS DE NEGÓCIO DO FINANCEIRO
--
-- Referência funcional: Bling
--
-- Fluxo:
--
-- PEDIDO
--   ↓
-- CONTA A RECEBER
--   ↓
-- PARCELA
--   ↓
-- PAGAMENTO
--   ↓
-- CAIXA / BANCO
--
-- DESPESA
--   ↓
-- CONTA A PAGAR
--   ↓
-- PARCELA
--   ↓
-- PAGAMENTO
--   ↓
-- CAIXA / BANCO
-- =========================================================


-- =========================================================
-- 1. CONTA FINANCEIRA PADRÃO
-- =========================================================

create or replace function public.get_or_create_default_finance_account()
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid;
  v_account_id uuid;
begin

  v_user_id := auth.uid();

  if v_user_id is null then
    raise exception 'Usuário não autenticado.';
  end if;

  select id
  into v_account_id
  from public.finance_accounts
  where user_id = v_user_id
    and name = 'Banco Principal'
    and is_active = true
  limit 1;

  if v_account_id is null then

    insert into public.finance_accounts (
      user_id,
      name,
      type,
      initial_balance,
      current_balance,
      is_active
    )
    values (
      v_user_id,
      'Banco Principal',
      'bank',
      0,
      0,
      true
    )
    returning id into v_account_id;

  end if;

  return v_account_id;

end;
$$;


grant execute
on function public.get_or_create_default_finance_account()
to authenticated;


-- =========================================================
-- 2. CATEGORIAS FINANCEIRAS PADRÃO
-- =========================================================

create or replace function public.create_default_finance_categories()
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid;
  v_count integer := 0;
begin

  v_user_id := auth.uid();

  if v_user_id is null then
    raise exception 'Usuário não autenticado.';
  end if;

  insert into public.finance_categories (
    user_id,
    name,
    type
  )
  values
    (v_user_id, 'Vendas', 'income'),
    (v_user_id, 'Outras receitas', 'income'),
    (v_user_id, 'Fornecedores', 'expense'),
    (v_user_id, 'Marketing', 'expense'),
    (v_user_id, 'Frete', 'expense'),
    (v_user_id, 'Impostos', 'expense'),
    (v_user_id, 'Operacional', 'expense'),
    (v_user_id, 'Outras despesas', 'expense')
  on conflict (user_id, name) do nothing;

  get diagnostics v_count = row_count;

  return v_count;

end;
$$;


grant execute
on function public.create_default_finance_categories()
to authenticated;


-- =========================================================
-- 3. CRIAR CONTA A RECEBER A PARTIR DE UM PEDIDO
-- =========================================================

create or replace function public.create_receivable_from_order(
  p_order_id uuid,
  p_due_date date default current_date,
  p_payment_method text default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid;
  v_order public.orders%rowtype;
  v_receivable_id uuid;
  v_category_id uuid;
  v_existing_receivable_id uuid;
begin
  v_user_id := auth.uid();

  if v_user_id is null then
    raise exception 'Usuário não autenticado.';
  end if;

  select *
  into v_order
  from public.orders
  where id = p_order_id
    and user_id = v_user_id
  for update;

  if not found then
    raise exception 'Pedido não encontrado.';
  end if;

  select id
  into v_existing_receivable_id
  from public.accounts_receivable
  where order_id = p_order_id
    and user_id = v_user_id
  limit 1;

  if v_existing_receivable_id is not null then
    return v_existing_receivable_id;
  end if;

  select id
  into v_category_id
  from public.finance_categories
  where user_id = v_user_id
    and name = 'Vendas'
    and is_active = true
  limit 1;

  insert into public.accounts_receivable (
    user_id,
    customer_id,
    order_id,
    description,
    category_id,
    total_amount,
    status
  )
  values (
    v_user_id,
    v_order.customer_id,
    v_order.id,
    'Pedido #' || v_order.order_number,
    v_category_id,
    v_order.total,
    'open'
  )
  returning id into v_receivable_id;

  insert into public.accounts_receivable_installments (
    receivable_id,
    installment_number,
    due_date,
    amount,
    paid_amount,
    status,
    payment_method
  )
  values (
    v_receivable_id,
    1,
    p_due_date,
    v_order.total,
    0,
    'open',
    p_payment_method
  );

  return v_receivable_id;
end;
$$;

grant execute
on function public.create_receivable_from_order(uuid, date, text)
to authenticated;


-- =========================================================
-- 4. PAGAR PARCELA DE CONTA A RECEBER
-- =========================================================

create or replace function public.pay_receivable_installment(
  p_installment_id uuid,
  p_financial_account_id uuid,
  p_amount numeric
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare

  v_user_id uuid;

  v_installment
    public.accounts_receivable_installments%rowtype;

  v_receivable
    public.accounts_receivable%rowtype;

  v_account
    public.finance_accounts%rowtype;

  v_remaining numeric(12,2);

  v_new_paid_amount numeric(12,2);

  v_new_status text;

  v_cash_movement_id uuid;

begin

  -- =====================================================
  -- USUÁRIO
  -- =====================================================

  v_user_id := auth.uid();

  if v_user_id is null then
    raise exception 'Usuário não autenticado.';
  end if;


  -- =====================================================
  -- PARCELA
  -- =====================================================

  select *
  into v_installment
  from public.accounts_receivable_installments
  where id = p_installment_id
  for update;

  if not found then
    raise exception 'Parcela não encontrada.';
  end if;


  -- =====================================================
  -- CONTA A RECEBER
  -- =====================================================

  select *
  into v_receivable
  from public.accounts_receivable
  where id = v_installment.receivable_id
    and user_id = v_user_id
  for update;

  if not found then
    raise exception 'Conta a receber não pertence ao usuário.';
  end if;


  -- =====================================================
  -- CONTA FINANCEIRA
  -- =====================================================

  select *
  into v_account
  from public.finance_accounts
  where id = p_financial_account_id
    and user_id = v_user_id
    and is_active = true
  for update;

  if not found then
    raise exception
      'Conta financeira inválida ou não pertence ao usuário.';
  end if;


  -- =====================================================
  -- VALIDAR VALOR
  -- =====================================================

  if p_amount is null or p_amount <= 0 then
    raise exception
      'O valor do pagamento deve ser maior que zero.';
  end if;


  v_remaining :=
    round(
      v_installment.amount
      - v_installment.paid_amount,
      2
    );


  if v_remaining <= 0 then
    raise exception
      'Esta parcela já está totalmente paga.';
  end if;


  if p_amount > v_remaining then
    raise exception
      'O valor informado é maior que o valor restante da parcela.';
  end if;


  -- =====================================================
  -- NOVO VALOR PAGO
  -- =====================================================

  v_new_paid_amount :=
    round(
      v_installment.paid_amount + p_amount,
      2
    );


  if v_new_paid_amount >= v_installment.amount then
    v_new_status := 'paid';
  else
    v_new_status := 'partially_paid';
  end if;


  -- =====================================================
  -- ATUALIZAR PARCELA
  -- =====================================================

  update public.accounts_receivable_installments
  set
    paid_amount = v_new_paid_amount,

    status = v_new_status,

    paid_at =
      case
        when v_new_status = 'paid'
          then coalesce(paid_at, now())
        else
          paid_at
      end,

    financial_account_id =
      p_financial_account_id,

    updated_at = now()

  where id = p_installment_id;


  -- =====================================================
  -- CRIAR MOVIMENTO DE CAIXA
  -- =====================================================

  insert into public.cash_movements (
    user_id,
    financial_account_id,
    type,
    description,
    amount,
    movement_date,
    category_id,
    order_id,
    receivable_installment_id,
    status
  )
  values (
    v_user_id,
    p_financial_account_id,
    'income',
    v_receivable.description,
    p_amount,
    current_date,
    v_receivable.category_id,
    v_receivable.order_id,
    p_installment_id,
    'completed'
  )
  returning id into v_cash_movement_id;


  -- =====================================================
  -- ATUALIZAR CONTA A RECEBER
  -- =====================================================

  if v_new_paid_amount >= v_installment.amount then

    if not exists (
      select 1
      from public.accounts_receivable_installments
      where receivable_id = v_receivable.id
        and status in (
          'open',
          'partially_paid',
          'overdue'
        )
        and id <> p_installment_id
    ) then

      update public.accounts_receivable
      set
        status = 'paid',
        updated_at = now()
      where id = v_receivable.id;

    else

      update public.accounts_receivable
      set
        status = 'partially_paid',
        updated_at = now()
      where id = v_receivable.id;

    end if;

  else

    update public.accounts_receivable
    set
      status = 'partially_paid',
      updated_at = now()
    where id = v_receivable.id;

  end if;


  -- =====================================================
  -- ATUALIZAR SALDO
  -- =====================================================

  update public.finance_accounts
  set
    current_balance =
      round(
        current_balance + p_amount,
        2
      ),
    updated_at = now()
  where id = p_financial_account_id;


  -- =====================================================
  -- RETORNO
  -- =====================================================

  return jsonb_build_object(

    'success', true,

    'installment_id',
    p_installment_id,

    'cash_movement_id',
    v_cash_movement_id,

    'amount_paid',
    p_amount,

    'installment_paid_amount',
    v_new_paid_amount,

    'installment_status',
    v_new_status,

    'receivable_id',
    v_receivable.id,

    'receivable_status',
    (
      select status
      from public.accounts_receivable
      where id = v_receivable.id
    ),

    'financial_account_id',
    p_financial_account_id

  );

end;
$$;


grant execute
on function public.pay_receivable_installment(
  uuid,
  uuid,
  numeric
)
to authenticated;


-- =========================================================
-- 5. CRIAR CONTA A PAGAR
-- =========================================================

create or replace function public.create_payable(
  p_description text,
  p_amount numeric,
  p_due_date date,
  p_category_id uuid default null,
  p_notes text default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare

  v_user_id uuid;

  v_payable_id uuid;

begin

  v_user_id := auth.uid();

  if v_user_id is null then
    raise exception 'Usuário não autenticado.';
  end if;


  if trim(coalesce(p_description, '')) = '' then
    raise exception
      'A descrição da conta a pagar é obrigatória.';
  end if;


  if p_amount is null or p_amount <= 0 then
    raise exception
      'O valor deve ser maior que zero.';
  end if;


  insert into public.accounts_payable (
    user_id,
    description,
    category_id,
    total_amount,
    status,
    notes
  )
  values (
    v_user_id,
    trim(p_description),
    p_category_id,
    p_amount,
    'open',
    p_notes
  )
  returning id into v_payable_id;


  insert into public.accounts_payable_installments (
    payable_id,
    installment_number,
    due_date,
    amount,
    paid_amount,
    status
  )
  values (
    v_payable_id,
    1,
    p_due_date,
    p_amount,
    0,
    'open'
  );


  return v_payable_id;

end;
$$;


grant execute
on function public.create_payable(
  text,
  numeric,
  date,
  uuid,
  text
)
to authenticated;


-- =========================================================
-- 6. PAGAR CONTA A PAGAR
-- =========================================================

create or replace function public.pay_payable_installment(
  p_installment_id uuid,
  p_financial_account_id uuid,
  p_amount numeric
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare

  v_user_id uuid;

  v_installment
    public.accounts_payable_installments%rowtype;

  v_payable
    public.accounts_payable%rowtype;

  v_account
    public.finance_accounts%rowtype;

  v_remaining numeric(12,2);

  v_new_paid_amount numeric(12,2);

  v_new_status text;

  v_cash_movement_id uuid;

begin

  -- =====================================================
  -- USUÁRIO
  -- =====================================================

  v_user_id := auth.uid();

  if v_user_id is null then
    raise exception 'Usuário não autenticado.';
  end if;


  -- =====================================================
  -- PARCELA
  -- =====================================================

  select *
  into v_installment
  from public.accounts_payable_installments
  where id = p_installment_id
  for update;

  if not found then
    raise exception 'Parcela não encontrada.';
  end if;


  -- =====================================================
  -- CONTA A PAGAR
  -- =====================================================

  select *
  into v_payable
  from public.accounts_payable
  where id = v_installment.payable_id
    and user_id = v_user_id
  for update;

  if not found then
    raise exception
      'Conta a pagar não pertence ao usuário.';
  end if;


  -- =====================================================
  -- CONTA FINANCEIRA
  -- =====================================================

  select *
  into v_account
  from public.finance_accounts
  where id = p_financial_account_id
    and user_id = v_user_id
    and is_active = true
  for update;

  if not found then
    raise exception
      'Conta financeira inválida ou não pertence ao usuário.';
  end if;


  -- =====================================================
  -- VALIDAR VALOR
  -- =====================================================

  if p_amount is null or p_amount <= 0 then
    raise exception
      'O valor do pagamento deve ser maior que zero.';
  end if;


  v_remaining :=
    round(
      v_installment.amount
      - v_installment.paid_amount,
      2
    );


  if v_remaining <= 0 then
    raise exception
      'Esta parcela já está totalmente paga.';
  end if;


  if p_amount > v_remaining then
    raise exception
      'O valor informado é maior que o valor restante da parcela.';
  end if;


  -- =====================================================
  -- NOVO VALOR
  -- =====================================================

  v_new_paid_amount :=
    round(
      v_installment.paid_amount + p_amount,
      2
    );


  if v_new_paid_amount >= v_installment.amount then
    v_new_status := 'paid';
  else
    v_new_status := 'partially_paid';
  end if;


  -- =====================================================
  -- ATUALIZAR PARCELA
  -- =====================================================

  update public.accounts_payable_installments
  set
    paid_amount = v_new_paid_amount,

    status = v_new_status,

    paid_at =
      case
        when v_new_status = 'paid'
          then coalesce(paid_at, now())
        else
          paid_at
      end,

    financial_account_id =
      p_financial_account_id,

    updated_at = now()

  where id = p_installment_id;


  -- =====================================================
  -- SAÍDA DE CAIXA
  -- =====================================================

  insert into public.cash_movements (
    user_id,
    financial_account_id,
    type,
    description,
    amount,
    movement_date,
    category_id,
    payable_installment_id,
    status
  )
  values (
    v_user_id,
    p_financial_account_id,
    'expense',
    v_payable.description,
    p_amount,
    current_date,
    v_payable.category_id,
    p_installment_id,
    'completed'
  )
  returning id into v_cash_movement_id;


  -- =====================================================
  -- ATUALIZAR CONTA A PAGAR
  -- =====================================================

  if v_new_paid_amount >= v_installment.amount then

    update public.accounts_payable
    set
      status = 'paid',
      updated_at = now()
    where id = v_payable.id;

  else

    update public.accounts_payable
    set
      status = 'partially_paid',
      updated_at = now()
    where id = v_payable.id;

  end if;


  -- =====================================================
  -- ATUALIZAR SALDO
  -- =====================================================

  update public.finance_accounts
  set
    current_balance =
      round(
        current_balance - p_amount,
        2
      ),
    updated_at = now()
  where id = p_financial_account_id;


  -- =====================================================
  -- RETORNO
  -- =====================================================

  return jsonb_build_object(

    'success', true,

    'installment_id',
    p_installment_id,

    'cash_movement_id',
    v_cash_movement_id,

    'amount_paid',
    p_amount,

    'installment_paid_amount',
    v_new_paid_amount,

    'installment_status',
    v_new_status,

    'payable_id',
    v_payable.id,

    'payable_status',
    (
      select status
      from public.accounts_payable
      where id = v_payable.id
    ),

    'financial_account_id',
    p_financial_account_id

  );

end;
$$;


grant execute
on function public.pay_payable_installment(
  uuid,
  uuid,
  numeric
)
to authenticated;