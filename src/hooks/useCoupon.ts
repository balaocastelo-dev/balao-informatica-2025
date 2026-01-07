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
      const { data, error } = await supabase.rpc('validate_coupon', {
        p_code: normalized,
        p_order_value: orderValue,
      });
      if (error) {
        const err: CouponValidationResult = {
          success: false,
          error: { code: 'INVALID_CODE', message: 'Erro na validação do cupom' },
        };
        setResult(err);
        return err;
      }
      const parsed: CouponValidationResult = data as CouponValidationResult;
      setResult(parsed);
      return parsed;
    } finally {
      setLoading(false);
    }
  }, []);

  return { loading, result, applyCoupon };
}
