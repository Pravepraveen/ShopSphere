import { apiClient } from './apiClient';
import { ApiResponse, Cart } from '../types';

export const cartApi = {
  getCart: async (): Promise<Cart> => {
    const res = await apiClient.get<ApiResponse<Cart>>('/cart');
    return res.data.data;
  },

  addItem: async (productId: number, quantity: number): Promise<Cart> => {
    const res = await apiClient.post<ApiResponse<Cart>>('/cart/items', { productId, quantity });
    return res.data.data;
  },

  updateQuantity: async (itemId: number, quantity: number): Promise<Cart> => {
    const res = await apiClient.put<ApiResponse<Cart>>(`/cart/items/${itemId}`, { quantity });
    return res.data.data;
  },

  removeItem: async (itemId: number): Promise<Cart> => {
    const res = await apiClient.delete<ApiResponse<Cart>>(`/cart/items/${itemId}`);
    return res.data.data;
  },

  clearCart: async (): Promise<void> => {
    await apiClient.delete<ApiResponse<string>>('/cart');
  },
};

