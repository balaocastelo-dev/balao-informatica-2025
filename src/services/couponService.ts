import { supabase } from '@/integrations/supabase/client';

export type CouponDiscountType = 'percentage' | 'fixed';

export interface Coupon {
  id: string;
  code: string;
  discount_type: CouponDiscountType;
  discount_value: number;
  min_cart_value?: number | null;
  max_uses?: number | null;
  used_count: number;
  starts_at?: string | null;
  expires_at?: string | null;
  active: boolean;
  created_at: string;
}

export interface CreateCouponInput {
  code: string;
  discount_type: CouponDiscountType;
  discount_value: number;
  min_cart_value?: number | null;
  max_uses?: number | null;
  starts_at?: string | null;
  expires_at?: string | null;
  active?: boolean;
}

export type UpdateCouponInput = Partial<CreateCouponInput>;

export type CouponValidationResult =
  | { valid: true; coupon: Coupon; discountAmount: number }
  | { valid: false; reason: string };

const normalizeCode = (code: string) => (code || '').trim().toUpperCase();

export async function getCouponByCode(code: string) {
  const normalized = normalizeCode(code);
  const { data, error } = await supabase
    .from('coupons')
    .select('*')
    .eq('code', normalized)
    .maybeSingle();
  if (error) throw error;
  return data as Coupon | null;
}

export async function listCoupons() {
  const { data, error } = await supabase
    .from('coupons')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data || []) as Coupon[];
}

export async function createCoupon(input: CreateCouponInput) {
  const payload = { ...input, code: normalizeCode(input.code) };
  const { data, error } = await supabase
    .from('coupons')
    .insert(payload)
    .select()
    .single();
  if (error) throw error;
  return data as Coupon;
}

export async function updateCoupon(id: string, input: UpdateCouponInput) {
  const payload = { ...input };
  if (payload.code) payload.code = normalizeCode(payload.code);
  const { data, error } = await supabase
    .from('coupons')
    .update(payload)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data as Coupon;
}

export async function deleteCoupon(id: string) {
  const { error } = await supabase.from('coupons').delete().eq('id', id);
  if (error) throw error;
}

export async function setCouponActive(id: string, active: boolean) {
  const { data, error } = await supabase
    .from('coupons')
    .update({ active })
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data as Coupon;
}

export function validateCoupon(coupon: Coupon, subtotal: number): CouponValidationResult {
  if (!coupon.active) return { valid: false, reason: 'Cupom inativo' };
  const now = new Date();
  if (coupon.starts_at && new Date(coupon.starts_at) > now) {
    return { valid: false, reason: 'Cupom ainda não está válido' };
  }
  if (coupon.expires_at && new Date(coupon.expires_at) < now) {
    return { valid: false, reason: 'Cupom expirado' };
  }
  if (coupon.max_uses != null && coupon.used_count >= coupon.max_uses) {
    return { valid: false, reason: 'Limite de uso atingido' };
  }
  if (coupon.min_cart_value != null && subtotal < Number(coupon.min_cart_value)) {
    return { valid: false, reason: 'Valor mínimo do carrinho não atingido' };
  }
  let discountAmount = 0;
  if (coupon.discount_type === 'percentage') {
    discountAmount = subtotal * (Number(coupon.discount_value) / 100);
  } else {
    discountAmount = Number(coupon.discount_value);
  }
  discountAmount = Math.max(0, Math.min(discountAmount, subtotal));
  return { valid: true, coupon, discountAmount };
}
