import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Loader2, Check, X } from 'lucide-react';
import { useCoupon } from '@/hooks/useCoupon';
import type { CouponValidationResult } from '@/types/coupon';

type Props = {
  orderValue: number;
  onDiscountChange?: (discount: number, data: CouponValidationResult | null) => void;
  className?: string;
};

export function CouponInput({ orderValue, onDiscountChange, className }: Props) {
  const [code, setCode] = useState('');
  const { loading, result, applyCoupon } = useCoupon();

  const handleApply = async () => {
    const res = await applyCoupon(code, orderValue);
    const discount = res.success ? Math.max(0, Math.min(orderValue, res.discount)) : 0;
    if (onDiscountChange) onDiscountChange(discount, res);
  };

  const normalized = code.toUpperCase();

  return (
    <div className={className}>
      <div className="flex gap-2">
        <Input
          value={normalized}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          placeholder="CUPOM"
          maxLength={32}
        />
        <Button onClick={handleApply} disabled={loading || !normalized.trim()}>
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Aplicar cupom'}
        </Button>
      </div>
      {result && (
        <div className="mt-2">
          {result.success ? (
            <div className="flex items-center text-green-700 bg-green-100 rounded px-2 py-1 text-sm">
              <Check className="w-4 h-4 mr-1" />
              <span>Desconto aplicado: R$ {result.discount.toFixed(2)}</span>
            </div>
          ) : (
            <div className="flex items-center text-red-700 bg-red-100 rounded px-2 py-1 text-sm">
              <X className="w-4 h-4 mr-1" />
              <span>{result.error.message}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
