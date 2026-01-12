import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { CouponValidationResult } from '@/types/coupon';

export function useCoupon() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<CouponValidationResult | null>(null);

  const applyCoupon = useCallback(async (code: string, orderValue: number) => {
    const normalized = String(code || '').trim().toUpperCase();
    
    if (!normalized) {
      const err: CouponValidationResult = {
        success: false,
        error: { code: 'INVALID_CODE', message: 'Código inválido' },
      };
      setResult(err);
      return err;
    }

    setLoading(true);
    try {
      const { data: coupons, error } = await supabase
        .from('coupons')
        .select('*')
        .eq('code', normalized)
        .eq('active', true)
        .maybeSingle();

      if (error) {
        console.error('Erro ao buscar cupom:', error);
        const err: CouponValidationResult = {
          success: false,
          error: { code: 'INVALID_CODE', message: `Erro ao validar cupom: ${error.message}` },
        };
        setResult(err);
        return err;
      }

      if (!coupons) {
        const err: CouponValidationResult = {
          success: false,
          error: { code: 'NOT_FOUND', message: 'Cupom não encontrado ou inativo' },
        };
        setResult(err);
        return err;
      }

      const now = new Date();

      if (coupons.starts_at && new Date(coupons.starts_at) > now) {
        const err: CouponValidationResult = {
          success: false,
          error: { code: 'NOT_STARTED', message: 'Este cupom ainda não é válido' },
        };
        setResult(err);
        return err;
      }

      if (coupons.ends_at && new Date(coupons.ends_at) < now) {
        const err: CouponValidationResult = {
          success: false,
          error: { code: 'EXPIRED', message: 'Este cupom expirou' },
        };
        setResult(err);
        return err;
      }

      if (coupons.usage_limit !== null && coupons.usage_count >= coupons.usage_limit) {
        const err: CouponValidationResult = {
          success: false,
          error: { code: 'USAGE_LIMIT', message: 'Este cupom atingiu o limite de uso' },
        };
        setResult(err);
        return err;
      }

      if (coupons.min_order_value !== null && orderValue < coupons.min_order_value) {
        const err: CouponValidationResult = {
          success: false,
          error: { 
            code: 'MIN_ORDER', 
            message: `Valor mínimo para este cupom: R$ ${coupons.min_order_value.toFixed(2)}` 
          },
        };
        setResult(err);
        return err;
      }

      let discount = 0;
      if (coupons.discount_type === 'percentage') {
        discount = (orderValue * coupons.discount_value) / 100;
      } else {
        discount = coupons.discount_value;
      }

      if (coupons.max_discount_value !== null) {
        discount = Math.min(discount, coupons.max_discount_value);
      }

      // Ensure discount doesn't exceed order value
      discount = Math.min(discount, orderValue);

      const success: CouponValidationResult = {
        success: true,
        discount,
        coupon_id: coupons.id,
      };

      setResult(success);
      return success;

    } catch (e) {
      console.error('Erro inesperado:', e);
      const err: CouponValidationResult = {
        success: false,
        error: { code: 'INVALID_CODE', message: 'Erro inesperado ao validar' },
      };
      setResult(err);
      return err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { loading, result, applyCoupon };
}
