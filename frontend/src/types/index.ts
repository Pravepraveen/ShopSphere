export type Role = 'ROLE_CUSTOMER' | 'ROLE_ADMIN' | 'CUSTOMER' | 'ADMIN';

export interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  role: Role;
}

export interface AuthResponse {
  token: string;
  type: string;
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  role: Role;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string;
  parentId?: number | null;
  parentName?: string | null;
  subcategories?: Category[];
}

export interface Product {
  id: number;
  sku: string;
  title: string;
  description?: string;
  price: number;
  stock: number;
  imageUrl?: string;
  categoryId: number;
  categoryName?: string;
  active: boolean;
  version: number;
}

export interface CartItem {
  id: number;
  productId: number;
  productSku: string;
  productTitle: string;
  productImageUrl?: string;
  unitPrice: number;
  quantity: number;
  itemSubtotal: number;
  availableStock: number;
}

export interface Cart {
  id: number;
  userId: number;
  items: CartItem[];
  totalItems: number;
  subtotal: number;
}

export type OrderStatus =
  | 'PLACED'
  | 'PAID'
  | 'PACKED'
  | 'SHIPPED'
  | 'DELIVERED'
  | 'PAYMENT_FAILED'
  | 'CANCELLED';

export interface OrderStatusHistory {
  id: number;
  previousStatus: OrderStatus | null;
  newStatus: OrderStatus;
  changedBy: string;
  reason?: string;
  createdAt: string;
}

export interface OrderItem {
  id: number;
  productId: number;
  productTitle: string;
  unitPrice: number;
  quantity: number;
  subtotal: number;
}

export interface Order {
  id: number;
  orderNumber: string;
  userId: number;
  customerEmail: string;
  customerName: string;
  status: OrderStatus;
  subtotal: number;
  discountAmount: number;
  totalAmount: number;
  couponCode?: string | null;
  idempotencyKey: string;
  shippingAddress: string;
  carrier?: string | null;
  trackingNumber?: string | null;
  estimatedDelivery?: string | null;
  shippingNotes?: string | null;
  items: OrderItem[];
  statusHistory: OrderStatusHistory[];
  createdAt: string;
  updatedAt: string;
}

export interface CouponValidation {
  valid: boolean;
  code: string;
  discountType: 'PERCENTAGE' | 'FIXED';
  discountValue: number;
  discountAmount: number;
  subtotal: number;
  totalAfterDiscount: number;
  message?: string;
}

export interface Coupon {
  id: number;
  code: string;
  discountType: 'PERCENTAGE' | 'FIXED';
  discountValue: number;
  minOrderValue: number;
  usageLimit: number;
  timesUsed: number;
  expiresAt?: string | null;
  active: boolean;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
  timestamp: string;
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
  first: boolean;
  last: boolean;
  empty: boolean;
}

export interface TopSellingProduct {
  productId: number;
  title: string;
  sku: string;
  imageUrl?: string;
  price: number;
  unitsSold: number;
  totalRevenue: number;
  currentStock: number;
}

export interface DailySales {
  date: string;
  revenue: number;
  orderCount: number;
}

export interface DashboardAnalytics {
  totalRevenue: number;
  totalOrders: number;
  totalCustomers: number;
  totalProducts: number;
  lowStockCount: number;
  outOfStockCount: number;
  ordersByStatus: Record<OrderStatus, number>;
  topSellingProducts: TopSellingProduct[];
  lowStockProducts: Product[];
  recentOrders: Order[];
  salesTrend: DailySales[];
}

export interface AdminUser {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  role: Role;
  enabled: boolean;
  createdAt: string;
  orderCount: number;
  totalSpent: number;
}


