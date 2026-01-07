export type CouponValidationSuccess = {
  success: true;
  discount: number;
  coupon_id: string;
};

export type CouponValidationError = {
  success: false;
  error: {
    code:
      | 'INVALID_CODE'
      | 'NOT_FOUND'
      | 'NOT_STARTED'
      | 'EXPIRED'
      | 'USAGE_LIMIT'
      | 'MIN_ORDER';
    message: string;
  };
};

export type CouponValidationResult = CouponValidationSuccess | CouponValidationError;
