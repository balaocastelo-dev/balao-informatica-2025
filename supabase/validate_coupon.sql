create or replace function public.validate_coupon(p_code text, p_order_value numeric)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  v_coupon record;
  v_now timestamptz := now();
  v_discount numeric := 0;
  v_effective_code text := trim(coalesce(p_code, ''));
  v_min_order numeric;
  v_max_discount numeric;
  v_ok boolean := false;
begin
  if v_effective_code = '' then
    return json_build_object('success', false, 'error', json_build_object('code', 'INVALID_CODE', 'message', 'Código inválido'));
  end if;

  select *
  into v_coupon
  from public.coupons
  where active = true
    and lower(code) = lower(v_effective_code)
  limit 1;

  if not found then
    return json_build_object('success', false, 'error', json_build_object('code', 'NOT_FOUND', 'message', 'Cupom não encontrado'));
  end if;

  if v_coupon.starts_at is not null and v_now < v_coupon.starts_at then
    return json_build_object('success', false, 'error', json_build_object('code', 'NOT_STARTED', 'message', 'Cupom ainda não está válido'));
  end if;

  if v_coupon.ends_at is not null and v_now > v_coupon.ends_at then
    return json_build_object('success', false, 'error', json_build_object('code', 'EXPIRED', 'message', 'Cupom expirado'));
  end if;

  if v_coupon.usage_limit is not null and v_coupon.usage_count >= v_coupon.usage_limit then
    return json_build_object('success', false, 'error', json_build_object('code', 'USAGE_LIMIT', 'message', 'Limite de uso atingido'));
  end if;

  v_min_order := coalesce(v_coupon.min_order_value, 0);
  if p_order_value is null or p_order_value < v_min_order then
    return json_build_object('success', false, 'error', json_build_object('code', 'MIN_ORDER', 'message', 'Valor mínimo do pedido não atingido'));
  end if;

  if v_coupon.discount_type = 'percentage' then
    v_discount := (p_order_value * v_coupon.discount_value) / 100.0;
  else
    v_discount := v_coupon.discount_value;
  end if;

  v_max_discount := coalesce(v_coupon.max_discount_value, v_discount);
  if v_discount > v_max_discount then
    v_discount := v_max_discount;
  end if;

  if v_discount < 0 then
    v_discount := 0;
  end if;

  if v_discount > p_order_value then
    v_discount := p_order_value;
  end if;

  update public.coupons
    set usage_count = usage_count + 1
  where id = v_coupon.id
    and (v_coupon.usage_limit is null or usage_count < v_coupon.usage_limit);

  if found then
    v_ok := true;
  else
    return json_build_object('success', false, 'error', json_build_object('code', 'USAGE_LIMIT', 'message', 'Limite de uso atingido'));
  end if;

  return json_build_object(
    'success', true,
    'discount', v_discount,
    'coupon_id', v_coupon.id
  );
end;
$$;
