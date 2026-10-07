-- ============================================================



-- 011_multi_tenant_security.sql



-- Segurança multi-tenant por organização



--



-- Objetivo:



-- 1. Centralizar a descoberta da organização do usuário



-- 2. Migrar o RLS das tabelas de negócio para organization_id



-- 3. Manter user_id durante a fase de transição



-- 4. Impedir acesso entre organizações



-- 5. Adaptar as RPCs SECURITY DEFINER antes da ativação do RLS



-- ============================================================











-- ============================================================



-- 1. FUNÇÃO: ORGANIZAÇÃO DO USUÁRIO AUTENTICADO



-- ============================================================







CREATE OR REPLACE FUNCTION public.get_user_organization_id()



RETURNS uuid



LANGUAGE sql



STABLE



SECURITY DEFINER



SET search_path = public



AS $$



    SELECT om.organization_id



    FROM public.organization_members om



    WHERE om.user_id = auth.uid()



    ORDER BY om.created_at



    LIMIT 1;



$$;











-- ============================================================



-- 2. PERMISSÕES DA FUNÇÃO



-- ============================================================







REVOKE ALL



ON FUNCTION public.get_user_organization_id()



FROM PUBLIC;







GRANT EXECUTE



ON FUNCTION public.get_user_organization_id()



TO authenticated;



-- ============================================================

-- 3A. RPCs MULTI-TENANT

--

-- As RPCs SECURITY DEFINER são adaptadas antes das policies

-- de organização para que toda escrita interna já grave

-- organization_id e valide a organização do usuário.

-- ============================================================



CREATE OR REPLACE FUNCTION public.create_default_finance_categories()

 RETURNS integer

 LANGUAGE plpgsql

 SECURITY DEFINER

 SET search_path TO 'public'

AS $function$

declare

  v_user_id uuid;

  v_organization_id uuid;

  v_count integer := 0;

begin



  v_user_id := auth.uid();



  if v_user_id is null then

    raise exception 'Usuário não autenticado.';

  end if;



  v_organization_id := public.get_user_organization_id();



  if v_organization_id is null then

    raise exception 'Usuário não possui uma organização.';

  end if;



  insert into public.finance_categories (

    user_id,

    organization_id,

    name,

    type

  )

  values

    (v_user_id, v_organization_id, 'Vendas', 'income'),

    (v_user_id, v_organization_id, 'Outras receitas', 'income'),

    (v_user_id, v_organization_id, 'Fornecedores', 'expense'),

    (v_user_id, v_organization_id, 'Marketing', 'expense'),

    (v_user_id, v_organization_id, 'Frete', 'expense'),

    (v_user_id, v_organization_id, 'Impostos', 'expense'),

    (v_user_id, v_organization_id, 'Operacional', 'expense'),

    (v_user_id, v_organization_id, 'Outras despesas', 'expense')

  on conflict (user_id, name, type) do nothing;



  get diagnostics v_count = row_count;



  return v_count;



end;

$function$;





CREATE OR REPLACE FUNCTION public.create_order_with_items(p_customer_id uuid, p_items jsonb, p_discount numeric DEFAULT 0, p_shipping numeric DEFAULT 0, p_payment_method text DEFAULT NULL::text, p_notes text DEFAULT NULL::text)

 RETURNS uuid

 LANGUAGE plpgsql

 SECURITY DEFINER

 SET search_path TO 'public'

AS $function$

declare

  v_user_id uuid;

  v_organization_id uuid;

  v_order_id uuid;

  v_receivable_id uuid;



  v_subtotal numeric(12,2) := 0;

  v_discount numeric(12,2);

  v_shipping numeric(12,2);

  v_total numeric(12,2);



  v_item jsonb;

  v_product_id uuid;

  v_quantity integer;



  v_product_name text;

  v_sku text;

  v_unit_price numeric(12,2);

  v_stock integer;

begin

  v_user_id := auth.uid();



  if v_user_id is null then

    raise exception 'Usuário não autenticado.';

  end if;



  v_organization_id := public.get_user_organization_id();



  if v_organization_id is null then

    raise exception 'Usuário não possui uma organização.';

  end if;



  if p_customer_id is null then

    raise exception 'Selecione um cliente.';

  end if;



  if p_items is null

     or jsonb_array_length(p_items) = 0 then

    raise exception 'Adicione pelo menos um produto.';

  end if;



  if not exists (

    select 1

    from public.customers

    where id = p_customer_id

      and user_id = v_user_id

      and organization_id = v_organization_id

  ) then

    raise exception 'Cliente não encontrado.';

  end if;



  v_discount := greatest(coalesce(p_discount, 0), 0);

  v_shipping := greatest(coalesce(p_shipping, 0), 0);



  /*

   * Valida os produtos e calcula o subtotal

   * usando os preços atuais do banco.

   */

  for v_item in

    select value

    from jsonb_array_elements(p_items)

  loop



    v_product_id :=

      (v_item ->> 'productId')::uuid;



    v_quantity :=

      (v_item ->> 'quantity')::integer;



    if v_quantity is null

       or v_quantity <= 0 then

      raise exception 'Quantidade de produto inválida.';

    end if;



    select

      name,

      sku,

      price,

      stock

    into

      v_product_name,

      v_sku,

      v_unit_price,

      v_stock

    from public.products

    where id = v_product_id

      and user_id = v_user_id

      and organization_id = v_organization_id

      and status = 'active'

    for update;



    if not found then

      raise exception 'Produto não encontrado ou inativo.';

    end if;



    if v_quantity > v_stock then

      raise exception

        'Estoque insuficiente para o produto: %.',

        v_product_name;

    end if;



    v_subtotal :=

      v_subtotal +

      (v_unit_price * v_quantity);



  end loop;



  if v_discount > v_subtotal then

    raise exception

      'O desconto não pode ser maior que o subtotal.';

  end if;



  v_total :=

    v_subtotal

    - v_discount

    + v_shipping;



  /*

   * O order_number é gerado automaticamente pelo PostgreSQL.

   */

  insert into public.orders (

    user_id,

    organization_id,

    customer_id,

    status,

    payment_status,

    payment_method,

    subtotal,

    discount,

    shipping,

    total,

    notes

  )

  values (

    v_user_id,

    v_organization_id,

    p_customer_id,

    'pending',

    'pending',

    p_payment_method,

    v_subtotal,

    v_discount,

    v_shipping,

    v_total,

    nullif(trim(coalesce(p_notes, '')), '')

  )

  returning id

  into v_order_id;



  /*

   * Cria os itens e baixa o estoque.

   */

  for v_item in

    select value

    from jsonb_array_elements(p_items)

  loop



    v_product_id :=

      (v_item ->> 'productId')::uuid;



    v_quantity :=

      (v_item ->> 'quantity')::integer;



    select

      name,

      sku,

      price

    into

      v_product_name,

      v_sku,

      v_unit_price

    from public.products

    where id = v_product_id

      and user_id = v_user_id

      and organization_id = v_organization_id

      and status = 'active'

    for update;



    insert into public.order_items (

      order_id,

      organization_id,

      product_id,

      product_name,

      sku,

      quantity,

      unit_price,

      total_price

    )

    values (

      v_order_id,

      v_organization_id,

      v_product_id,

      v_product_name,

      v_sku,

      v_quantity,

      v_unit_price,

      v_unit_price * v_quantity

    );



    update public.products

    set

      stock = stock - v_quantity,

      updated_at = now()

    where id = v_product_id

      and user_id = v_user_id

      and organization_id = v_organization_id;



  end loop;



  /*

   * Cria automaticamente a conta a receber

   * vinculada ao pedido.

   *

   * O pedido começa com pagamento pendente,

   * portanto a conta fica em aberto.

   */

  select public.create_receivable_from_order(

    v_order_id,

    current_date,

    p_payment_method

  )

  into v_receivable_id;



  return v_order_id;

end;

$function$;





CREATE OR REPLACE FUNCTION public.create_receivable_from_order(p_order_id uuid, p_due_date date DEFAULT CURRENT_DATE, p_payment_method text DEFAULT NULL::text)

 RETURNS uuid

 LANGUAGE plpgsql

 SECURITY DEFINER

 SET search_path TO 'public'

AS $function$

declare

  v_user_id uuid;

  v_organization_id uuid;

  v_order public.orders%rowtype;

  v_receivable_id uuid;

  v_category_id uuid;

  v_existing_receivable_id uuid;

begin

  v_user_id := auth.uid();



  if v_user_id is null then

    raise exception 'Usuário não autenticado.';

  end if;



  v_organization_id := public.get_user_organization_id();



  if v_organization_id is null then

    raise exception 'Usuário não possui uma organização.';

  end if;



  select *

  into v_order

  from public.orders

  where id = p_order_id

    and user_id = v_user_id

    and organization_id = v_organization_id

  for update;



  if not found then

    raise exception 'Pedido não encontrado.';

  end if;



  select id

  into v_existing_receivable_id

  from public.accounts_receivable

  where order_id = p_order_id

    and user_id = v_user_id

    and organization_id = v_organization_id

  limit 1;



  if v_existing_receivable_id is not null then

    return v_existing_receivable_id;

  end if;



  select id

  into v_category_id

  from public.finance_categories

  where user_id = v_user_id

    and organization_id = v_organization_id

    and name = 'Vendas'

    and is_active = true

  limit 1;



  insert into public.accounts_receivable (

    user_id,

    organization_id,

    customer_id,

    order_id,

    description,

    category_id,

    total_amount,

    status

  )

  values (

    v_user_id,

    v_organization_id,

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

    organization_id,

    installment_number,

    due_date,

    amount,

    paid_amount,

    status,

    payment_method

  )

  values (

    v_receivable_id,

    v_organization_id,

    1,

    p_due_date,

    v_order.total,

    0,

    'open',

    p_payment_method

  );



  return v_receivable_id;

end;

$function$;





CREATE OR REPLACE FUNCTION public.create_payable(p_description text, p_amount numeric, p_due_date date, p_category_id uuid DEFAULT NULL::uuid, p_notes text DEFAULT NULL::text)

 RETURNS uuid

 LANGUAGE plpgsql

 SECURITY DEFINER

 SET search_path TO 'public'

AS $function$

declare



  v_user_id uuid;

  v_organization_id uuid;



  v_payable_id uuid;



begin



  v_user_id := auth.uid();



  if v_user_id is null then

    raise exception 'Usuário não autenticado.';

  end if;



  v_organization_id := public.get_user_organization_id();



  if v_organization_id is null then

    raise exception 'Usuário não possui uma organização.';

  end if;





  if trim(coalesce(p_description, '')) = '' then

    raise exception

      'A descrição da conta a pagar é obrigatória.';

  end if;





  if p_amount is null or p_amount <= 0 then

    raise exception

      'O valor deve ser maior que zero.';

  end if;



  if p_category_id is not null and not exists (

    select 1

    from public.finance_categories

    where id = p_category_id

      and user_id = v_user_id

      and organization_id = v_organization_id

  ) then

    raise exception 'Categoria financeira inválida ou não pertence à organização.';

  end if;







  insert into public.accounts_payable (

    user_id,

    organization_id,

    description,

    category_id,

    total_amount,

    status,

    notes

  )

  values (

    v_user_id,

    v_organization_id,

    trim(p_description),

    p_category_id,

    p_amount,

    'open',

    p_notes

  )

  returning id into v_payable_id;





  insert into public.accounts_payable_installments (

    payable_id,

    organization_id,

    installment_number,

    due_date,

    amount,

    paid_amount,

    status

  )

  values (

    v_payable_id,

    v_organization_id,

    1,

    p_due_date,

    p_amount,

    0,

    'open'

  );





  return v_payable_id;



end;

$function$;





CREATE OR REPLACE FUNCTION public.create_payable_with_installments(p_description text, p_amount numeric, p_due_date date, p_installments integer DEFAULT 1, p_category_id uuid DEFAULT NULL::uuid, p_notes text DEFAULT NULL::text)

 RETURNS uuid

 LANGUAGE plpgsql

 SECURITY DEFINER

 SET search_path TO 'public'

AS $function$

declare

  v_user_id uuid;

  v_organization_id uuid;

  v_payable_id uuid;



  v_base_amount numeric(12,2);

  v_last_amount numeric(12,2);



  v_installment_date date;

  v_days_in_month integer;



  i integer;

begin

  v_user_id := auth.uid();



  if v_user_id is null then

    raise exception 'Usuário não autenticado';

  end if;



  v_organization_id := public.get_user_organization_id();



  if v_organization_id is null then

    raise exception 'Usuário não possui uma organização.';

  end if;



  if p_description is null

     or trim(p_description) = '' then

    raise exception 'Descrição obrigatória';

  end if;



  if p_amount is null

     or p_amount <= 0 then

    raise exception 'Valor deve ser maior que zero';

  end if;



  if p_due_date is null then

    raise exception 'Data de vencimento obrigatória';

  end if;



  if p_installments is null

     or p_installments < 1

     or p_installments > 120 then

    raise exception 'Número de parcelas deve estar entre 1 e 120';

  end if;



  if p_category_id is not null and not exists (

    select 1

    from public.finance_categories

    where id = p_category_id

      and user_id = v_user_id

      and organization_id = v_organization_id

  ) then

    raise exception 'Categoria financeira inválida ou não pertence à organização.';

  end if;





  /*

   * Valor base de cada parcela.

   * A última parcela recebe a diferença dos centavos.

   */

  v_base_amount :=

    floor(

      (p_amount / p_installments) * 100

    ) / 100;



  v_last_amount :=

    p_amount -

    (v_base_amount * (p_installments - 1));



  /*

   * Cria a conta a pagar.

   */

  insert into public.accounts_payable (

    user_id,

    organization_id,

    description,

    category_id,

    total_amount,

    status,

    notes

  )

  values (

    v_user_id,

    v_organization_id,

    trim(p_description),

    p_category_id,

    p_amount,

    'open',

    nullif(trim(p_notes), '')

  )

  returning id into v_payable_id;



  /*

   * Cria as parcelas.

   */

  for i in 1..p_installments loop



    /*

     * Calcula corretamente o mês da parcela,

     * evitando problemas com datas como 31/01.

     */

    v_installment_date :=

      (

        date_trunc(

          'month',

          p_due_date

        )

        + ((i - 1) * interval '1 month')

        + (

          least(

            extract(

              day from p_due_date

            )::integer,

            extract(

              day from (

                date_trunc(

                  'month',

                  p_due_date

                )

                + (i * interval '1 month')

                - interval '1 day'

              )

            )::integer

          ) - 1

        ) * interval '1 day'

      )::date;



    insert into public.accounts_payable_installments (

      payable_id,

      organization_id,

      installment_number,

      due_date,

      amount,

      paid_amount,

      status

    )

    values (

      v_payable_id,

      v_organization_id,

      i,

      v_installment_date,



      case

        when i = p_installments

          then v_last_amount

        else v_base_amount

      end,



      0,

      'open'

    );



  end loop;



  return v_payable_id;

end;

$function$;





CREATE OR REPLACE FUNCTION public.get_or_create_default_finance_account()

 RETURNS uuid

 LANGUAGE plpgsql

 SECURITY DEFINER

 SET search_path TO 'public'

AS $function$

declare

  v_user_id uuid;

  v_organization_id uuid;

  v_account_id uuid;

begin



  v_user_id := auth.uid();



  if v_user_id is null then

    raise exception 'Usuário não autenticado.';

  end if;



  v_organization_id := public.get_user_organization_id();



  if v_organization_id is null then

    raise exception 'Usuário não possui uma organização.';

  end if;



  select id

  into v_account_id

  from public.finance_accounts

  where user_id = v_user_id

    and organization_id = v_organization_id

    and name = 'Banco Principal'

    and is_active = true

  limit 1;



  if v_account_id is null then



    insert into public.finance_accounts (

      user_id,

      organization_id,

      name,

      type,

      initial_balance,

      current_balance,

      is_active

    )

    values (

      v_user_id,

      v_organization_id,

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

$function$;





CREATE OR REPLACE FUNCTION public.pay_payable_installment(p_installment_id uuid, p_financial_account_id uuid, p_amount numeric)

 RETURNS jsonb

 LANGUAGE plpgsql

 SECURITY DEFINER

 SET search_path TO 'public'

AS $function$

declare



  v_user_id uuid;

  v_organization_id uuid;



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



  v_organization_id := public.get_user_organization_id();



  if v_organization_id is null then

    raise exception 'Usuário não possui uma organização.';

  end if;





  -- =====================================================

  -- PARCELA

  -- =====================================================



  select *

  into v_installment

  from public.accounts_payable_installments

  where id = p_installment_id

    and organization_id = v_organization_id

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

    and organization_id = v_organization_id

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

    and organization_id = v_organization_id

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

  -- NOVO VALOR DA PARCELA

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



  where id = p_installment_id

    and organization_id = v_organization_id;





  -- =====================================================

  -- SAÍDA DE CAIXA

  -- =====================================================



  insert into public.cash_movements (

    user_id,

    organization_id,

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

    v_organization_id,

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

  -- ATUALIZAR STATUS DA CONTA A PAGAR

  -- =====================================================



  /*

   * A conta só fica "paid" quando TODAS as parcelas

   * estiverem pagas.

   */



  if not exists (

    select 1

    from public.accounts_payable_installments

    where payable_id = v_payable.id

      and status in (

        'open',

        'partially_paid',

        'overdue'

      )

  ) then



    if exists (

      select 1

      from public.accounts_payable_installments

      where payable_id = v_payable.id

        and status = 'paid'

    ) then



      update public.accounts_payable

      set

        status = 'paid',

        updated_at = now()

      where id = v_payable.id

      and organization_id = v_organization_id;



    else



      update public.accounts_payable

      set

        status = 'cancelled',

        updated_at = now()

      where id = v_payable.id

      and organization_id = v_organization_id;



    end if;



  elsif exists (

    select 1

    from public.accounts_payable_installments

    where payable_id = v_payable.id

      and status = 'paid'

  ) then



    update public.accounts_payable

    set

      status = 'partially_paid',

      updated_at = now()

    where id = v_payable.id

      and organization_id = v_organization_id;



  elsif exists (

    select 1

    from public.accounts_payable_installments

    where payable_id = v_payable.id

      and status = 'overdue'

  ) then



    update public.accounts_payable

    set

      status = 'overdue',

      updated_at = now()

    where id = v_payable.id

      and organization_id = v_organization_id;



  else



    update public.accounts_payable

    set

      status = 'open',

      updated_at = now()

    where id = v_payable.id

      and organization_id = v_organization_id;



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

  where id = p_financial_account_id

    and organization_id = v_organization_id;





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

$function$;





CREATE OR REPLACE FUNCTION public.pay_receivable_installment(p_installment_id uuid, p_financial_account_id uuid, p_amount numeric)

 RETURNS jsonb

 LANGUAGE plpgsql

 SECURITY DEFINER

 SET search_path TO 'public'

AS $function$



declare



  v_user_id uuid;

  v_organization_id uuid;



  v_installment

    public.accounts_receivable_installments%rowtype;



  v_receivable

    public.accounts_receivable%rowtype;



  v_account

    public.finance_accounts%rowtype;



  v_remaining numeric(12,2);



  v_new_paid_amount numeric(12,2);



  v_new_status text;



  v_receivable_status text;



  v_cash_movement_id uuid;



begin



  -- =====================================================

  -- USUÁRIO

  -- =====================================================



  v_user_id := auth.uid();



  if v_user_id is null then

    raise exception 'Usuário não autenticado.';

  end if;



  v_organization_id := public.get_user_organization_id();



  if v_organization_id is null then

    raise exception 'Usuário não possui uma organização.';

  end if;





  -- =====================================================

  -- PARCELA

  -- =====================================================



  select *

  into v_installment

  from public.accounts_receivable_installments

  where id = p_installment_id

    and organization_id = v_organization_id

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

    and organization_id = v_organization_id

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

    and organization_id = v_organization_id

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



    financial_account_id = p_financial_account_id,



    updated_at = now()



  where id = p_installment_id

    and organization_id = v_organization_id;





  -- =====================================================

  -- CRIAR MOVIMENTO DE CAIXA

  -- =====================================================



  insert into public.cash_movements (

    user_id,

    organization_id,

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

    v_organization_id,

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

      where id = v_receivable.id

        and organization_id = v_organization_id;



      v_receivable_status := 'paid';



    else



      update public.accounts_receivable

      set

        status = 'partially_paid',

        updated_at = now()

      where id = v_receivable.id

        and organization_id = v_organization_id;



      v_receivable_status := 'partially_paid';



    end if;



  else



    update public.accounts_receivable

    set

      status = 'partially_paid',

      updated_at = now()

    where id = v_receivable.id

        and organization_id = v_organization_id;



    v_receivable_status := 'partially_paid';



  end if;





  -- =====================================================

  -- SINCRONIZAR STATUS DE PAGAMENTO DO PEDIDO

  -- =====================================================



  if v_receivable.order_id is not null then



    update public.orders

    set

      payment_status =

        case

          when v_receivable_status = 'paid'

            then 'paid'



          when v_receivable_status = 'partially_paid'

            then 'partially_paid'



          else payment_status

        end,



      updated_at = now()



    where id = v_receivable.order_id

      and user_id = v_user_id

      and organization_id = v_organization_id;



  end if;





  -- =====================================================

  -- ATUALIZAR SALDO DA CONTA

  -- =====================================================



  update public.finance_accounts

  set

    current_balance =

      round(

        current_balance + p_amount,

        2

      ),



    updated_at = now()



  where id = p_financial_account_id

    and organization_id = v_organization_id;





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

    v_receivable_status,



    'financial_account_id',

    p_financial_account_id



  );



end;



$function$;





CREATE OR REPLACE FUNCTION public.transfer_between_finance_accounts(p_source_account_id uuid, p_destination_account_id uuid, p_amount numeric, p_description text DEFAULT NULL::text)

 RETURNS jsonb

 LANGUAGE plpgsql

 SECURITY DEFINER

 SET search_path TO 'public'

AS $function$

declare

  v_user_id uuid;

  v_organization_id uuid;



  v_source_account public.finance_accounts%rowtype;

  v_destination_account public.finance_accounts%rowtype;



  v_transfer_id uuid;

  v_source_movement_id uuid;

  v_destination_movement_id uuid;



  v_description text;

begin



  -- =====================================================

  -- USUÁRIO

  -- =====================================================



  v_user_id := auth.uid();



  if v_user_id is null then

    raise exception 'Usuário não autenticado.';

  end if;



  v_organization_id := public.get_user_organization_id();



  if v_organization_id is null then

    raise exception 'Usuário não possui uma organização.';

  end if;





  -- =====================================================

  -- VALIDAÇÕES

  -- =====================================================



  if p_source_account_id = p_destination_account_id then

    raise exception

      'A conta de origem e a conta de destino devem ser diferentes.';

  end if;



  if p_amount is null or p_amount <= 0 then

    raise exception

      'O valor da transferência deve ser maior que zero.';

  end if;





  -- =====================================================

  -- CONTAS

  -- =====================================================



  select *

  into v_source_account

  from public.finance_accounts

  where id = p_source_account_id

    and user_id = v_user_id

    and organization_id = v_organization_id

    and is_active = true

  for update;



  if not found then

    raise exception

      'Conta de origem inválida ou não pertence ao usuário.';

  end if;





  select *

  into v_destination_account

  from public.finance_accounts

  where id = p_destination_account_id

    and user_id = v_user_id

    and organization_id = v_organization_id

    and is_active = true

  for update;



  if not found then

    raise exception

      'Conta de destino inválida ou não pertence ao usuário.';

  end if;





  -- =====================================================

  -- SALDO

  -- =====================================================



  if v_source_account.current_balance < p_amount then

    raise exception

      'Saldo insuficiente na conta de origem.';

  end if;





  -- =====================================================

  -- IDENTIFICADOR DA TRANSFERÊNCIA

  -- =====================================================



  v_transfer_id := gen_random_uuid();



  v_description :=

    nullif(trim(coalesce(p_description, '')), '');



  if v_description is null then

    v_description :=

      'Transferência para ' ||

      v_destination_account.name;

  end if;





  -- =====================================================

  -- SAÍDA DA CONTA DE ORIGEM

  -- =====================================================



  insert into public.cash_movements (

    user_id,

    organization_id,

    financial_account_id,

    type,

    description,

    amount,

    movement_date,

    transfer_id,

    status

  )

  values (

    v_user_id,

    v_organization_id,

    p_source_account_id,

    'expense',

    v_description,

    p_amount,

    current_date,

    v_transfer_id,

    'completed'

  )

  returning id into v_source_movement_id;





  -- =====================================================

  -- ENTRADA NA CONTA DE DESTINO

  -- =====================================================



  insert into public.cash_movements (

    user_id,

    organization_id,

    financial_account_id,

    type,

    description,

    amount,

    movement_date,

    transfer_id,

    status

  )

  values (

    v_user_id,

    v_organization_id,

    p_destination_account_id,

    'income',

    'Transferência de ' ||

      v_source_account.name,

    p_amount,

    current_date,

    v_transfer_id,

    'completed'

  )

  returning id into v_destination_movement_id;





  -- =====================================================

  -- ATUALIZAR SALDO DA ORIGEM

  -- =====================================================



  update public.finance_accounts

  set

    current_balance =

      round(current_balance - p_amount, 2),

    updated_at = now()

  where id = p_source_account_id

    and organization_id = v_organization_id;





  -- =====================================================

  -- ATUALIZAR SALDO DO DESTINO

  -- =====================================================



  update public.finance_accounts

  set

    current_balance =

      round(current_balance + p_amount, 2),

    updated_at = now()

  where id = p_destination_account_id

    and organization_id = v_organization_id;





  -- =====================================================

  -- RETORNO

  -- =====================================================



  return jsonb_build_object(

    'success', true,

    'transfer_id', v_transfer_id,

    'source_account_id', p_source_account_id,

    'destination_account_id', p_destination_account_id,

    'source_movement_id', v_source_movement_id,

    'destination_movement_id', v_destination_movement_id,

    'amount', p_amount

  );



end;

$function$;

















-- ============================================================



-- 3. ORGANIZATIONS



-- ============================================================







DROP POLICY IF EXISTS "Users can view their organizations"



ON public.organizations;







DROP POLICY IF EXISTS "Users can view their organizations" ON public.organizations;

CREATE POLICY "Users can view their organizations"

ON public.organizations



FOR SELECT



TO authenticated



USING (



    id = public.get_user_organization_id()



);











-- ============================================================



-- 4. ORGANIZATION MEMBERS



-- ============================================================







DROP POLICY IF EXISTS "Users can view their memberships"



ON public.organization_members;







DROP POLICY IF EXISTS "Users can view their memberships" ON public.organization_members;

CREATE POLICY "Users can view their memberships"

ON public.organization_members



FOR SELECT



TO authenticated



USING (



    organization_id = public.get_user_organization_id()



    AND user_id = auth.uid()



);











-- ============================================================



-- 5. COMPANY PROFILES



-- ============================================================







DROP POLICY IF EXISTS "Users can view own company profile"



ON public.company_profiles;







DROP POLICY IF EXISTS "Users can insert own company profile"



ON public.company_profiles;







DROP POLICY IF EXISTS "Users can update own company profile"



ON public.company_profiles;







DROP POLICY IF EXISTS "Users can delete own company profile"



ON public.company_profiles;











DROP POLICY IF EXISTS "Users can view company profile" ON public.company_profiles;

CREATE POLICY "Users can view company profile"

ON public.company_profiles



FOR SELECT



TO authenticated



USING (



    organization_id = public.get_user_organization_id()



);











DROP POLICY IF EXISTS "Users can insert company profile" ON public.company_profiles;

CREATE POLICY "Users can insert company profile"

ON public.company_profiles



FOR INSERT



TO authenticated



WITH CHECK (



    organization_id = public.get_user_organization_id()



);











DROP POLICY IF EXISTS "Users can update company profile" ON public.company_profiles;

CREATE POLICY "Users can update company profile"

ON public.company_profiles



FOR UPDATE



TO authenticated



USING (



    organization_id = public.get_user_organization_id()



)



WITH CHECK (



    organization_id = public.get_user_organization_id()



);











DROP POLICY IF EXISTS "Users can delete company profile" ON public.company_profiles;

CREATE POLICY "Users can delete company profile"

ON public.company_profiles



FOR DELETE



TO authenticated



USING (



    organization_id = public.get_user_organization_id()



);











-- ============================================================



-- 6. COMPANY PREFERENCES



-- ============================================================







DROP POLICY IF EXISTS "Users can view own company preferences"



ON public.company_preferences;







DROP POLICY IF EXISTS "Users can insert own company preferences"



ON public.company_preferences;







DROP POLICY IF EXISTS "Users can update own company preferences"



ON public.company_preferences;







DROP POLICY IF EXISTS "Users can delete own company preferences"



ON public.company_preferences;











DROP POLICY IF EXISTS "Users can view company preferences" ON public.company_preferences;

CREATE POLICY "Users can view company preferences"

ON public.company_preferences



FOR SELECT



TO authenticated



USING (



    organization_id = public.get_user_organization_id()



);











DROP POLICY IF EXISTS "Users can insert company preferences" ON public.company_preferences;

CREATE POLICY "Users can insert company preferences"

ON public.company_preferences



FOR INSERT



TO authenticated



WITH CHECK (



    organization_id = public.get_user_organization_id()



);











DROP POLICY IF EXISTS "Users can update company preferences" ON public.company_preferences;

CREATE POLICY "Users can update company preferences"

ON public.company_preferences



FOR UPDATE



TO authenticated



USING (



    organization_id = public.get_user_organization_id()



)



WITH CHECK (



    organization_id = public.get_user_organization_id()



);











DROP POLICY IF EXISTS "Users can delete company preferences" ON public.company_preferences;

CREATE POLICY "Users can delete company preferences"

ON public.company_preferences



FOR DELETE



TO authenticated



USING (



    organization_id = public.get_user_organization_id()



);











-- ============================================================



-- 7. CATEGORIES



-- ============================================================







DROP POLICY IF EXISTS "Users can view their own categories"



ON public.categories;







DROP POLICY IF EXISTS "Users can create their own categories"



ON public.categories;







DROP POLICY IF EXISTS "Users can update their own categories"



ON public.categories;







DROP POLICY IF EXISTS "Users can delete their own categories"



ON public.categories;











DROP POLICY IF EXISTS "Users can view organization categories" ON public.categories;

CREATE POLICY "Users can view organization categories"

ON public.categories



FOR SELECT



TO authenticated



USING (



    organization_id = public.get_user_organization_id()



);











DROP POLICY IF EXISTS "Users can create organization categories" ON public.categories;

CREATE POLICY "Users can create organization categories"

ON public.categories



FOR INSERT



TO authenticated



WITH CHECK (



    organization_id = public.get_user_organization_id()



);











DROP POLICY IF EXISTS "Users can update organization categories" ON public.categories;

CREATE POLICY "Users can update organization categories"

ON public.categories



FOR UPDATE



TO authenticated



USING (



    organization_id = public.get_user_organization_id()



)



WITH CHECK (



    organization_id = public.get_user_organization_id()



);











DROP POLICY IF EXISTS "Users can delete organization categories" ON public.categories;

CREATE POLICY "Users can delete organization categories"

ON public.categories



FOR DELETE



TO authenticated



USING (



    organization_id = public.get_user_organization_id()



);











-- ============================================================



-- 8. CUSTOMERS



-- ============================================================







DROP POLICY IF EXISTS "Users can view their own customers"



ON public.customers;







DROP POLICY IF EXISTS "Users can create their own customers"



ON public.customers;







DROP POLICY IF EXISTS "Users can update their own customers"



ON public.customers;







DROP POLICY IF EXISTS "Users can delete their own customers"



ON public.customers;











DROP POLICY IF EXISTS "Users can view organization customers" ON public.customers;

CREATE POLICY "Users can view organization customers"

ON public.customers



FOR SELECT



TO authenticated



USING (



    organization_id = public.get_user_organization_id()



);











DROP POLICY IF EXISTS "Users can create organization customers" ON public.customers;

CREATE POLICY "Users can create organization customers"

ON public.customers



FOR INSERT



TO authenticated



WITH CHECK (



    organization_id = public.get_user_organization_id()



);











DROP POLICY IF EXISTS "Users can update organization customers" ON public.customers;

CREATE POLICY "Users can update organization customers"

ON public.customers



FOR UPDATE



TO authenticated



USING (



    organization_id = public.get_user_organization_id()



)



WITH CHECK (



    organization_id = public.get_user_organization_id()



);











DROP POLICY IF EXISTS "Users can delete organization customers" ON public.customers;

CREATE POLICY "Users can delete organization customers"

ON public.customers



FOR DELETE



TO authenticated



USING (



    organization_id = public.get_user_organization_id()



);











-- ============================================================



-- 9. PRODUCTS



-- ============================================================







DROP POLICY IF EXISTS "Users can view their own products"



ON public.products;







DROP POLICY IF EXISTS "Users can create their own products"



ON public.products;







DROP POLICY IF EXISTS "Users can update their own products"



ON public.products;







DROP POLICY IF EXISTS "Users can delete their own products"



ON public.products;











DROP POLICY IF EXISTS "Users can view organization products" ON public.products;

CREATE POLICY "Users can view organization products"

ON public.products



FOR SELECT



TO authenticated



USING (



    organization_id = public.get_user_organization_id()



);











DROP POLICY IF EXISTS "Users can create organization products" ON public.products;

CREATE POLICY "Users can create organization products"

ON public.products



FOR INSERT



TO authenticated



WITH CHECK (



    organization_id = public.get_user_organization_id()



);











DROP POLICY IF EXISTS "Users can update organization products" ON public.products;

CREATE POLICY "Users can update organization products"

ON public.products



FOR UPDATE



TO authenticated



USING (



    organization_id = public.get_user_organization_id()



)



WITH CHECK (



    organization_id = public.get_user_organization_id()



);











DROP POLICY IF EXISTS "Users can delete organization products" ON public.products;

CREATE POLICY "Users can delete organization products"

ON public.products



FOR DELETE



TO authenticated



USING (



    organization_id = public.get_user_organization_id()



);











-- ============================================================



-- 10. ORDERS



-- ============================================================







DROP POLICY IF EXISTS "Users can view their own orders"



ON public.orders;







DROP POLICY IF EXISTS "Users can create their own orders"



ON public.orders;







DROP POLICY IF EXISTS "Users can update their own orders"



ON public.orders;







DROP POLICY IF EXISTS "Users can delete their own orders"



ON public.orders;











DROP POLICY IF EXISTS "Users can view organization orders" ON public.orders;

CREATE POLICY "Users can view organization orders"

ON public.orders



FOR SELECT



TO authenticated



USING (



    organization_id = public.get_user_organization_id()



);











DROP POLICY IF EXISTS "Users can create organization orders" ON public.orders;

CREATE POLICY "Users can create organization orders"

ON public.orders



FOR INSERT



TO authenticated



WITH CHECK (



    organization_id = public.get_user_organization_id()



);











DROP POLICY IF EXISTS "Users can update organization orders" ON public.orders;

CREATE POLICY "Users can update organization orders"

ON public.orders



FOR UPDATE



TO authenticated



USING (



    organization_id = public.get_user_organization_id()



)



WITH CHECK (



    organization_id = public.get_user_organization_id()



);











DROP POLICY IF EXISTS "Users can delete organization orders" ON public.orders;

CREATE POLICY "Users can delete organization orders"

ON public.orders



FOR DELETE



TO authenticated



USING (



    organization_id = public.get_user_organization_id()



);











-- ============================================================



-- 11. ORDER ITEMS



-- ============================================================







DROP POLICY IF EXISTS "Users can view their own order items"



ON public.order_items;







DROP POLICY IF EXISTS "Users can create their own order items"



ON public.order_items;







DROP POLICY IF EXISTS "Users can update their own order items"



ON public.order_items;







DROP POLICY IF EXISTS "Users can delete their own order items"



ON public.order_items;











DROP POLICY IF EXISTS "Users can view organization order items" ON public.order_items;

CREATE POLICY "Users can view organization order items"

ON public.order_items



FOR SELECT



TO authenticated



USING (



    organization_id = public.get_user_organization_id()



);











DROP POLICY IF EXISTS "Users can create organization order items" ON public.order_items;

CREATE POLICY "Users can create organization order items"

ON public.order_items



FOR INSERT



TO authenticated



WITH CHECK (



    organization_id = public.get_user_organization_id()



);











DROP POLICY IF EXISTS "Users can update organization order items" ON public.order_items;

CREATE POLICY "Users can update organization order items"

ON public.order_items



FOR UPDATE



TO authenticated



USING (



    organization_id = public.get_user_organization_id()



)



WITH CHECK (



    organization_id = public.get_user_organization_id()



);











DROP POLICY IF EXISTS "Users can delete organization order items" ON public.order_items;

CREATE POLICY "Users can delete organization order items"

ON public.order_items



FOR DELETE



TO authenticated



USING (



    organization_id = public.get_user_organization_id()



);











-- ============================================================



-- 12. FINANCE ACCOUNTS



-- ============================================================







DROP POLICY IF EXISTS "Users can manage own finance accounts"



ON public.finance_accounts;











DROP POLICY IF EXISTS "Users can manage organization finance accounts" ON public.finance_accounts;

CREATE POLICY "Users can manage organization finance accounts"

ON public.finance_accounts



FOR ALL



TO authenticated



USING (



    organization_id = public.get_user_organization_id()



)



WITH CHECK (



    organization_id = public.get_user_organization_id()



);











-- ============================================================



-- 13. FINANCE CATEGORIES



-- ============================================================







DROP POLICY IF EXISTS "Users can manage own finance categories"



ON public.finance_categories;











DROP POLICY IF EXISTS "Users can manage organization finance categories" ON public.finance_categories;

CREATE POLICY "Users can manage organization finance categories"

ON public.finance_categories



FOR ALL



TO authenticated



USING (



    organization_id = public.get_user_organization_id()



)



WITH CHECK (



    organization_id = public.get_user_organization_id()



);











-- ============================================================



-- 14. ACCOUNTS RECEIVABLE



-- ============================================================







DROP POLICY IF EXISTS "Users can manage own receivables"



ON public.accounts_receivable;











DROP POLICY IF EXISTS "Users can manage organization receivables" ON public.accounts_receivable;

CREATE POLICY "Users can manage organization receivables"

ON public.accounts_receivable



FOR ALL



TO authenticated



USING (



    organization_id = public.get_user_organization_id()



)



WITH CHECK (



    organization_id = public.get_user_organization_id()



);











-- ============================================================



-- 15. ACCOUNTS RECEIVABLE INSTALLMENTS



-- ============================================================







DROP POLICY IF EXISTS "Users can manage own receivable installments"



ON public.accounts_receivable_installments;











DROP POLICY IF EXISTS "Users can manage organization receivable installments" ON public.accounts_receivable_installments;

CREATE POLICY "Users can manage organization receivable installments"

ON public.accounts_receivable_installments



FOR ALL



TO authenticated



USING (



    organization_id = public.get_user_organization_id()



)



WITH CHECK (



    organization_id = public.get_user_organization_id()



);











-- ============================================================



-- 16. ACCOUNTS PAYABLE



-- ============================================================







DROP POLICY IF EXISTS "Users can manage own payables"



ON public.accounts_payable;











DROP POLICY IF EXISTS "Users can manage organization payables" ON public.accounts_payable;

CREATE POLICY "Users can manage organization payables"

ON public.accounts_payable



FOR ALL



TO authenticated



USING (



    organization_id = public.get_user_organization_id()



)



WITH CHECK (



    organization_id = public.get_user_organization_id()



);











-- ============================================================



-- 17. ACCOUNTS PAYABLE INSTALLMENTS



-- ============================================================







DROP POLICY IF EXISTS "Users can manage own payable installments"



ON public.accounts_payable_installments;











DROP POLICY IF EXISTS "Users can manage organization payable installments" ON public.accounts_payable_installments;

CREATE POLICY "Users can manage organization payable installments"

ON public.accounts_payable_installments



FOR ALL



TO authenticated



USING (



    organization_id = public.get_user_organization_id()



)



WITH CHECK (



    organization_id = public.get_user_organization_id()



);











-- ============================================================



-- 18. CASH MOVEMENTS



-- ============================================================







DROP POLICY IF EXISTS "Users can manage own cash movements"



ON public.cash_movements;











DROP POLICY IF EXISTS "Users can manage organization cash movements" ON public.cash_movements;

CREATE POLICY "Users can manage organization cash movements"

ON public.cash_movements



FOR ALL



TO authenticated



USING (



    organization_id = public.get_user_organization_id()



)



WITH CHECK (



    organization_id = public.get_user_organization_id()



);











-- ============================================================



-- 19. TRANSACTIONS



-- ============================================================







DROP POLICY IF EXISTS "Users can view their own transactions"



ON public.transactions;







DROP POLICY IF EXISTS "Users can create their own transactions"



ON public.transactions;







DROP POLICY IF EXISTS "Users can update their own transactions"



ON public.transactions;







DROP POLICY IF EXISTS "Users can delete their own transactions"



ON public.transactions;











DROP POLICY IF EXISTS "Users can view organization transactions" ON public.transactions;

CREATE POLICY "Users can view organization transactions"

ON public.transactions



FOR SELECT



TO authenticated



USING (



    organization_id = public.get_user_organization_id()



);











DROP POLICY IF EXISTS "Users can create organization transactions" ON public.transactions;

CREATE POLICY "Users can create organization transactions"

ON public.transactions



FOR INSERT



TO authenticated



WITH CHECK (



    organization_id = public.get_user_organization_id()



);











DROP POLICY IF EXISTS "Users can update organization transactions" ON public.transactions;

CREATE POLICY "Users can update organization transactions"

ON public.transactions



FOR UPDATE



TO authenticated



USING (



    organization_id = public.get_user_organization_id()



)



WITH CHECK (



    organization_id = public.get_user_organization_id()



);











DROP POLICY IF EXISTS "Users can delete organization transactions" ON public.transactions;

CREATE POLICY "Users can delete organization transactions"

ON public.transactions



FOR DELETE



TO authenticated



USING (



    organization_id = public.get_user_organization_id()



);











-- ============================================================



-- 20. PROFILES



--



-- Profiles continuam pertencendo diretamente ao usuário.



-- Não fazem parte do tenant de negócio.



-- ============================================================







-- Nenhuma alteração nas policies de profiles.











-- ============================================================



-- FIM DA MIGRATION 011



-- ============================================================