import { apiClient } from './apiClient';
import { ApiResponse, Order } from '../types';

export const orderApi = {
  getMyOrders: async (): Promise<Order[]> => {
    const res = await apiClient.get<ApiResponse<Order[]>>('/orders/me');
    return res.data.data;
  },

  getOrderById: async (id: number): Promise<Order> => {
    const res = await apiClient.get<ApiResponse<Order>>(`/orders/${id}`);
    return res.data.data;
  },

  cancelOrder: async (id: number, reason?: string): Promise<Order> => {
    const res = await apiClient.post<ApiResponse<Order>>(`/orders/${id}/cancel`, null, {
      params: { reason },
    });
    return res.data.data;
  },
};

