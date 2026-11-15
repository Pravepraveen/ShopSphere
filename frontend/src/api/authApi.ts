import { apiClient } from './apiClient';
import { ApiResponse, AuthResponse } from '../types';

export const authApi = {
  login: async (email: string, password: string): Promise<AuthResponse> => {
    const res = await apiClient.post<ApiResponse<AuthResponse>>('/auth/login', { email, password });
    return res.data.data;
  },

  register: async (firstName: string, lastName: string, email: string, password: string): Promise<AuthResponse> => {
    const res = await apiClient.post<ApiResponse<AuthResponse>>('/auth/register', {
      firstName,
      lastName,
      email,
      password,
    });
    return res.data.data;
  },

  getCurrentUser: async (): Promise<AuthResponse> => {
    const res = await apiClient.get<ApiResponse<AuthResponse>>('/auth/me');
    return res.data.data;
  },
};

