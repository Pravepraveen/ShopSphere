import { apiClient } from './apiClient';
import { ApiResponse, Category, Coupon, Order, OrderStatus, PageResponse, Product, DashboardAnalytics, AdminUser } from '../types';

export interface CreateProductPayload {
  sku: string;
  title: string;
  description?: string;
  price: number;
  stock: number;
  imageUrl?: string;
  categoryId: number;
  active?: boolean;
}

export interface CreateCouponPayload {
  code: string;
  discountType: 'PERCENTAGE' | 'FIXED';
  discountValue: number;
  minOrderValue: number;
  usageLimit: number;
  expiresAt?: string | null;
  active: boolean;
}

export const adminApi = {
  getDashboardAnalytics: async (): Promise<DashboardAnalytics> => {
    const res = await apiClient.get<ApiResponse<DashboardAnalytics>>('/admin/analytics/dashboard');
    return res.data.data;
  },

  getProducts: async (page = 0, size = 50, query?: string): Promise<PageResponse<Product>> => {
    const res = await apiClient.get<ApiResponse<PageResponse<Product>>>('/admin/products', {
      params: { page, size, query },
    });
    return res.data.data;
  },

  createProduct: async (payload: CreateProductPayload): Promise<Product> => {
    const res = await apiClient.post<ApiResponse<Product>>('/admin/products', payload);
    return res.data.data;
  },

  updateProduct: async (id: number, payload: CreateProductPayload): Promise<Product> => {
    const res = await apiClient.put<ApiResponse<Product>>(`/admin/products/${id}`, payload);
    return res.data.data;
  },

  adjustStock: async (id: number, delta?: number, stock?: number): Promise<Product> => {
    const res = await apiClient.patch<ApiResponse<Product>>(`/admin/products/${id}/stock`, null, {
      params: { delta, stock },
    });
    return res.data.data;
  },

  deactivateProduct: async (id: number): Promise<string> => {
    const res = await apiClient.delete<ApiResponse<string>>(`/admin/products/${id}`);
    return res.data.data;
  },

  getCategories: async (): Promise<Category[]> => {
    const res = await apiClient.get<ApiResponse<Category[]>>('/admin/categories');
    return res.data.data;
  },

  createCategory: async (name: string, description?: string, parentId?: number): Promise<Category> => {
    const res = await apiClient.post<ApiResponse<Category>>('/admin/categories', {
      name,
      description,
      parentId,
    });
    return res.data.data;
  },

  getOrders: async (): Promise<Order[]> => {
    const res = await apiClient.get<ApiResponse<Order[]>>('/admin/orders');
    return res.data.data;
  },

  updateOrderStatus: async (id: number, newStatus: OrderStatus, reason?: string): Promise<Order> => {
    const res = await apiClient.patch<ApiResponse<Order>>(`/admin/orders/${id}/status`, {
      newStatus,
      reason,
    });
    return res.data.data;
  },

  updateShipmentDetails: async (
    id: number,
    payload: {
      carrier?: string;
      trackingNumber?: string;
      estimatedDelivery?: string;
      shippingNotes?: string;
      shippingAddress?: string;
    }
  ): Promise<Order> => {
    const res = await apiClient.patch<ApiResponse<Order>>(`/admin/orders/${id}/shipment`, payload);
    return res.data.data;
  },

  getCoupons: async (): Promise<Coupon[]> => {
    const res = await apiClient.get<ApiResponse<Coupon[]>>('/admin/coupons');
    return res.data.data;
  },

  createCoupon: async (payload: CreateCouponPayload): Promise<Coupon> => {
    const res = await apiClient.post<ApiResponse<Coupon>>('/admin/coupons', payload);
    return res.data.data;
  },

  updateCoupon: async (id: number, payload: CreateCouponPayload): Promise<Coupon> => {
    const res = await apiClient.put<ApiResponse<Coupon>>(`/admin/coupons/${id}`, payload);
    return res.data.data;
  },

  getUsers: async (): Promise<AdminUser[]> => {
    const res = await apiClient.get<ApiResponse<AdminUser[]>>('/admin/users');
    return res.data.data;
  },

  toggleUserStatus: async (id: number): Promise<AdminUser> => {
    const res = await apiClient.patch<ApiResponse<AdminUser>>(`/admin/users/${id}/toggle-status`);
    return res.data.data;
  },
};


