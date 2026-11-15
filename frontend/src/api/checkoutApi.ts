import { apiClient } from './apiClient';
import { ApiResponse, CouponValidation, Order } from '../types';

export interface CheckoutPayload {
  shippingAddress: string;
  couponCode?: string;
  items?: Array<{ productId: number; quantity: number }>;
}

export interface MockPaymentPayload {
  orderId: number;
  action: 'SIMULATE_SUCCESS' | 'SIMULATE_FAILURE';
}

export interface MockPaymentResult {
  paymentSuccessful: boolean;
  orderId: number;
  orderNumber: string;
  orderStatus: string;
  message: string;
  order: Order;
}

export const checkoutApi = {
  validateCoupon: async (code: string, subtotal: number): Promise<CouponValidation> => {
    const res = await apiClient.post<ApiResponse<CouponValidation>>('/coupons/validate', { code, subtotal });
    return res.data.data;
  },

  checkout: async (idempotencyKey: string, payload: CheckoutPayload): Promise<Order> => {
    const res = await apiClient.post<ApiResponse<Order>>('/checkout', payload, {
      headers: {
        'Idempotency-Key': idempotencyKey,
      },
    });
    return res.data.data;
  },

  mockPayment: async (payload: MockPaymentPayload): Promise<MockPaymentResult> => {
    const res = await apiClient.post<ApiResponse<MockPaymentResult>>('/checkout/mock-payment', payload);
    return res.data.data;
  },
};

