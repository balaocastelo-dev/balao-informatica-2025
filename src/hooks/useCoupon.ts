import { useState } from 'react';
import { Coupon, getCouponByCode, validateCoupon } from '@/services/couponService';

type Status = { type: 'idle' } | { type: 'success'; message: string } | { type: 'error'; message: string };

export function useCoupon() {
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [discountAmount, setDiscountAmount] = useState<number>(0);
  const [status, setStatus] = useState<Status>({ type: 'idle' });
  const [isApplying, setIsApplying] = useState(false);

  const applyCoupon = async (code: string, subtotal: number) => {
    setIsApplying(true);
    try {
      const coupon = await getCouponByCode(code);
      if (!coupon) {
        setStatus({ type: 'error', message: 'Cupom inválido, expirado ou indisponível' });
        return false;
      }
      const result = validateCoupon(coupon, subtotal);
      if (!result.valid) {
        setStatus({ type: 'error', message: 'Cupom inválido, expirado ou indisponível' });
        return false;
      }
      setAppliedCoupon(result.coupon);
      setDiscountAmount(result.discountAmount);
      setStatus({ type: 'success', message: 'Cupom aplicado com sucesso' });
      return true;
    } catch {
      setStatus({ type: 'error', message: 'Cupom inválido, expirado ou indisponível' });
      return false;
    } finally {
      setIsApplying(false);
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setDiscountAmount(0);
    setStatus({ type: 'idle' });
  };

  const computeTotal = (subtotal: number) => {
    const total = Math.max(0, subtotal - discountAmount);
    return total;
  };

  return {
    appliedCoupon,
    discountAmount,
    status,
    isApplying,
    applyCoupon,
    removeCoupon,
    computeTotal,
  };
}

