import { apiClient } from './apiClient';
import { ApiResponse, Category, PageResponse, Product } from '../types';

export interface ProductFilterParams {
  query?: string;
  categoryId?: number;
  minPrice?: number;
  maxPrice?: number;
  page?: number;
  size?: number;
  sortBy?: string;
  sortDirection?: 'ASC' | 'DESC';
}

export const productApi = {
  getProducts: async (params?: ProductFilterParams): Promise<PageResponse<Product>> => {
    const res = await apiClient.get<ApiResponse<PageResponse<Product>>>('/products', { params });
    return res.data.data;
  },

  getProductById: async (id: number): Promise<Product> => {
    const res = await apiClient.get<ApiResponse<Product>>(`/products/${id}`);
    return res.data.data;
  },

  getCategories: async (): Promise<Category[]> => {
    const res = await apiClient.get<ApiResponse<Category[]>>('/categories');
    return res.data.data;
  },
};

