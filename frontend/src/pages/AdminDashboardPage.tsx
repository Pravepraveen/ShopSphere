import React, { useState, useEffect, useCallback } from 'react';
import { adminApi, CreateProductPayload, CreateCouponPayload } from '../api/adminApi';
import { Product, Order, Coupon, OrderStatus, DashboardAnalytics, AdminUser, Category } from '../types';
import { useToast } from '../components/common/Toast';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { formatINR } from '../utils/currency';
import {
  Package, ShoppingBag, Tag, Plus, Edit2, Trash2, X, Users,
  TrendingUp, AlertTriangle, CheckCircle, Clock, Truck,
  DollarSign, ArrowUpRight, BarChart3, RefreshCw, Eye, ShieldCheck, ShieldAlert,
  ChevronRight, Award, Box, Sparkles, Navigation, MapPin
} from 'lucide-react';

// ─── Reusable Modal ─────────────────────────────────────────────────────────────
interface ModalProps {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  maxWidth?: string;
}

const Modal: React.FC<ModalProps> = ({ title, onClose, children, maxWidth = '640px' }) => (
  <div style={{
    position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(4px)',
    zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem',
  }}>
    <div style={{
      background: '#ffffff', borderRadius: '20px', width: '100%', maxWidth, maxHeight: '90vh',
      overflowY: 'auto', padding: '2rem', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
      border: '1px solid rgba(226, 232, 240, 0.8)'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '1rem' }}>
        <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: 'var(--secondary)' }}>{title}</h3>
        <button
          className="btn btn-secondary btn-sm"
          style={{ borderRadius: '50%', width: '32px', height: '32px', padding: 0 }}
          onClick={onClose}
        >
          <X size={16} />
        </button>
      </div>
      {children}
    </div>
  </div>
);

// ─── TAB 1: EXECUTIVE INTELLIGENCE & REAL-TIME DASHBOARD ───────────────────────
const OverviewTab: React.FC<{ onNavigate: (tab: 'products' | 'orders' | 'coupons' | 'users') => void }> = ({ onNavigate }) => {
  const { showSuccess, showError } = useToast();
  const [data, setData] = useState<DashboardAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastSynced, setLastSynced] = useState<string>('Just now');
  const [restockingId, setRestockingId] = useState<number | null>(null);

  const loadAnalytics = useCallback(async (manual: boolean = false) => {
    if (manual) setIsRefreshing(true);
    try {
      const res = await adminApi.getDashboardAnalytics();
      setData(res);
      setLastSynced(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
      if (manual) showSuccess('Metrics synchronized in real time!');
    } catch {
      showError('Failed to load executive dashboard analytics');
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, [showSuccess, showError]);

  useEffect(() => {
    loadAnalytics();
    // Real-Time 10s auto-refresh
    const interval = setInterval(() => {
      loadAnalytics(false);
    }, 10000);
    return () => clearInterval(interval);
  }, [loadAnalytics]);

  const handleQuickRestock = async (productId: number, units: number = 20) => {
    setRestockingId(productId);
    try {
      await adminApi.adjustStock(productId, units);
      showSuccess(`Added +${units} units to inventory!`);
      loadAnalytics();
    } catch (err: any) {
      showError(err?.response?.data?.message || 'Failed to adjust stock');
    } finally {
      setRestockingId(null);
    }
  };

  if (loading) return <LoadingSpinner />;
  if (!data) return <p>No analytics data available.</p>;

  // Calculate SVG Chart Dimensions & Points for 7-Day Revenue Trend
  const chartWidth = 600;
  const chartHeight = 160;
  const maxRevenue = Math.max(...data.salesTrend.map(d => d.revenue), 1000);
  const points = data.salesTrend.map((d, index) => {
    const x = (index / (data.salesTrend.length - 1)) * (chartWidth - 40) + 20;
    const y = chartHeight - 30 - (d.revenue / maxRevenue) * (chartHeight - 60);
    return `${x},${y}`;
  }).join(' ');

  const areaPoints = `${(0 / (data.salesTrend.length - 1)) * (chartWidth - 40) + 20},${chartHeight - 20} ${points} ${(data.salesTrend.length - 1) / (data.salesTrend.length - 1) * (chartWidth - 40) + 20},${chartHeight - 20}`;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Real-time Hero Banner */}
      <div style={{
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 60%, #114b3a 100%)',
        borderRadius: '20px', padding: '28px 32px', color: '#ffffff',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px',
        boxShadow: '0 10px 25px -5px rgba(15, 23, 42, 0.25)', position: 'relative', overflow: 'hidden'
      }}>
        <div style={{ maxWidth: '600px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: '6px',
              background: 'rgba(5, 150, 105, 0.25)', border: '1px solid #10b981',
              padding: '4px 12px', borderRadius: '999px', fontSize: '11px', fontWeight: 800, color: '#6ee7b7'
            }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981', animation: 'pulseGlow 1.5s infinite' }} />
              Live Telemetry Stream Active
            </span>
            <span style={{ fontSize: '12px', color: '#94a3b8' }}>Synced: {lastSynced}</span>
          </div>
          <h2 style={{ fontSize: '26px', fontWeight: 800, margin: '0 0 8px 0', letterSpacing: '-0.5px' }}>
            Executive Operations & Real-Time Intelligence
          </h2>
          <p style={{ margin: 0, color: '#94a3b8', fontSize: '14px', lineHeight: 1.6 }}>
            Instant visibility into atomic stock reserves, courier fulfillment lifecycles, revenue velocity, and customer transactions.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            className="btn btn-sm"
            style={{ background: 'rgba(255,255,255,0.12)', color: '#ffffff', border: '1px solid rgba(255,255,255,0.2)' }}
            disabled={isRefreshing}
            onClick={() => loadAnalytics(true)}
          >
            <RefreshCw size={14} className={isRefreshing ? 'spin' : ''} style={{ animation: isRefreshing ? 'spin 0.8s linear infinite' : 'none' }} />
            {isRefreshing ? 'Syncing Real-Time...' : 'Refresh Metrics'}
          </button>
        </div>
      </div>

      {/* 4 Hero KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem' }}>
        <div className="kpi-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
            <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Total Revenue</span>
            <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: '#ecfdf5', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <DollarSign size={20} />
            </div>
          </div>
          <div style={{ fontSize: '28px', fontWeight: 800, color: 'var(--secondary)', letterSpacing: '-0.5px' }}>
            {formatINR(data.totalRevenue)}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '10px', fontSize: '12px', color: '#059669', fontWeight: 600 }}>
            <ArrowUpRight size={15} /> Verified settled & paid customer orders
          </div>
        </div>

        <div className="kpi-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
            <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Total Orders</span>
            <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ShoppingBag size={20} />
            </div>
          </div>
          <div style={{ fontSize: '28px', fontWeight: 800, color: 'var(--secondary)', letterSpacing: '-0.5px' }}>
            {data.totalOrders}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '10px', fontSize: '12px', color: 'var(--text-muted)' }}>
            <span style={{ fontWeight: 700, color: '#059669' }}>{data.ordersByStatus?.DELIVERED || 0}</span> delivered • <span style={{ fontWeight: 700, color: '#2563eb' }}>{data.ordersByStatus?.PAID || 0}</span> in progress
          </div>
        </div>

        <div className="kpi-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
            <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Active Customers</span>
            <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: '#faf5ff', color: '#9333ea', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Users size={20} />
            </div>
          </div>
          <div style={{ fontSize: '28px', fontWeight: 800, color: 'var(--secondary)', letterSpacing: '-0.5px' }}>
            {data.totalCustomers}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '10px', fontSize: '12px', color: '#9333ea', fontWeight: 600 }}>
            <CheckCircle size={15} /> Verified customer accounts
          </div>
        </div>

        <div className="kpi-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
            <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Inventory Health</span>
            <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: data.lowStockCount > 0 ? '#fffbeb' : '#ecfdf5', color: data.lowStockCount > 0 ? '#d97706' : '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <AlertTriangle size={20} />
            </div>
          </div>
          <div style={{ fontSize: '28px', fontWeight: 800, color: data.lowStockCount > 0 ? '#b45309' : 'var(--secondary)', letterSpacing: '-0.5px' }}>
            {data.lowStockCount} <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-muted)' }}>low stock</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '10px', fontSize: '12px', color: 'var(--text-muted)' }}>
            <span style={{ fontWeight: 700 }}>{data.totalProducts}</span> total catalog items ({data.outOfStockCount} zero stock)
          </div>
        </div>
      </div>

      {/* Visual Analytics & State Machine Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: '1.5rem' }}>
        {/* 7-Day Revenue Velocity Chart */}
        <div className="card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div>
              <h4 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: 'var(--secondary)' }}>7-Day Revenue Trajectory</h4>
              <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: 'var(--text-muted)' }}>Settled order revenue over the trailing week</p>
            </div>
            <span className="badge badge-emerald">Live Telemetry</span>
          </div>

          <div style={{ width: '100%', overflowX: 'auto' }}>
            <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} style={{ width: '100%', height: 'auto', display: 'block' }}>
              <defs>
                <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#114b3a" stopOpacity="0.35" />
                  <stop offset="100%" stopColor="#114b3a" stopOpacity="0.0" />
                </linearGradient>
              </defs>
              <line x1="20" y1={chartHeight - 30} x2={chartWidth - 20} y2={chartHeight - 30} stroke="#e2e8f0" strokeDasharray="4 4" />
              <line x1="20" y1={(chartHeight - 30) / 2} x2={chartWidth - 20} y2={(chartHeight - 30) / 2} stroke="#e2e8f0" strokeDasharray="4 4" />
              <polygon points={areaPoints} fill="url(#revenueGradient)" />
              <polyline points={points} fill="none" stroke="#114b3a" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />

              {data.salesTrend.map((d, index) => {
                const x = (index / (data.salesTrend.length - 1)) * (chartWidth - 40) + 20;
                const y = chartHeight - 30 - (d.revenue / maxRevenue) * (chartHeight - 60);
                return (
                  <g key={d.date}>
                    <circle cx={x} cy={y} r="4.5" fill="#ffffff" stroke="#114b3a" strokeWidth="2.5" />
                    <text x={x} y={chartHeight - 10} textAnchor="middle" fontSize="11" fill="#64748b" fontWeight="600">{d.date}</text>
                  </g>
                );
              })}
            </svg>
          </div>
        </div>

        {/* State Machine Pipeline Breakdown */}
        <div className="card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div>
              <h4 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: 'var(--secondary)' }}>Order Pipeline Distribution</h4>
              <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: 'var(--text-muted)' }}>Verified state-machine stage counts</p>
            </div>
            <button className="btn btn-secondary btn-sm" onClick={() => onNavigate('orders')}>View All</button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {[
              { status: 'PLACED', label: '1. Placed (Pending Pay)', color: '#64748b' },
              { status: 'PAID', label: '2. Paid (Awaiting Pack)', color: '#2563eb' },
              { status: 'PACKED', label: '3. Packed (Ready to Ship)', color: '#0891b2' },
              { status: 'SHIPPED', label: '4. Shipped (In Transit)', color: '#d97706' },
              { status: 'DELIVERED', label: '5. Delivered (Fulfilled)', color: '#059669' },
              { status: 'CANCELLED', label: 'Cancelled / Refunded', color: '#dc2626' },
            ].map(stage => {
              const count = data.ordersByStatus[stage.status as OrderStatus] || 0;
              const percentage = data.totalOrders > 0 ? Math.round((count / data.totalOrders) * 100) : 0;
              return (
                <div key={stage.status} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: 600 }}>
                    <span style={{ color: stage.color }}>{stage.label}</span>
                    <span style={{ color: 'var(--secondary)', fontWeight: 700 }}>{count} ({percentage}%)</span>
                  </div>
                  <div style={{ width: '100%', height: '7px', background: '#f1f5f9', borderRadius: '999px', overflow: 'hidden' }}>
                    <div style={{ width: `${percentage}%`, height: '100%', background: stage.color, borderRadius: '999px', transition: 'width 0.4s ease' }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Urgent Low Stock Alerts & Quick Restock Table */}
      {data.lowStockProducts && data.lowStockProducts.length > 0 && (
        <div style={{
          background: '#fffbeb', border: '1px solid #fde68a', borderRadius: '18px', padding: '24px',
          boxShadow: '0 4px 16px rgba(217, 119, 6, 0.08)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#fef3c7', color: '#b45309', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <AlertTriangle size={20} />
              </div>
              <div>
                <h4 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: '#92400e' }}>
                  Smart Inventory Alert: Low Stock Threshold Triggered ({data.lowStockProducts.length})
                </h4>
                <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: '#b45309' }}>
                  Items with 10 or fewer units in reserve. Restock immediately to prevent checkout stockouts.
                </p>
              </div>
            </div>
            <button className="btn btn-sm" style={{ background: '#b45309', color: '#ffffff', border: 'none' }} onClick={() => onNavigate('products')}>
              Open Full Inventory <ChevronRight size={14} />
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '12px' }}>
            {data.lowStockProducts.slice(0, 4).map(prod => (
              <div key={prod.id} style={{ background: '#ffffff', border: '1px solid #fde68a', borderRadius: '12px', padding: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '13px', color: 'var(--secondary)' }}>{prod.title}</div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'monospace' }}>SKU: {prod.sku}</div>
                  <div style={{ marginTop: '4px' }}>
                    <span className={`badge ${prod.stock === 0 ? 'badge-rose' : 'badge-amber'}`} style={{ fontSize: '11px' }}>
                      {prod.stock === 0 ? 'Out of Stock' : `Only ${prod.stock} units left`}
                    </span>
                  </div>
                </div>
                <button
                  className="btn btn-sm btn-primary"
                  style={{ padding: '6px 10px', fontSize: '11px' }}
                  disabled={restockingId === prod.id}
                  onClick={() => handleQuickRestock(prod.id, 20)}
                >
                  <Plus size={12} /> {restockingId === prod.id ? 'Adding...' : '+20 Stock'}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Top 5 Best-Selling Products Leaderboard */}
      <div className="card" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Award size={22} color="var(--accent)" />
            <div>
              <h4 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: 'var(--secondary)' }}>Top Selling Products Leaderboard</h4>
              <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: 'var(--text-muted)' }}>Highest volume order drivers with atomic stock meters</p>
            </div>
          </div>
          <button className="btn btn-secondary btn-sm" onClick={() => onNavigate('products')}>Catalogue Control</button>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--border)', textAlign: 'left', color: 'var(--text-muted)' }}>
                <th style={{ padding: '10px' }}>Rank & Product</th>
                <th style={{ padding: '10px' }}>SKU</th>
                <th style={{ padding: '10px' }}>Unit Price</th>
                <th style={{ padding: '10px' }}>Units Sold</th>
                <th style={{ padding: '10px' }}>Total Revenue</th>
                <th style={{ padding: '10px' }}>Available Stock</th>
              </tr>
            </thead>
            <tbody>
              {data.topSellingProducts && data.topSellingProducts.length > 0 ? (
                data.topSellingProducts.map((p, idx) => (
                  <tr key={p.productId} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '12px 10px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{
                        width: '24px', height: '24px', borderRadius: '50%',
                        background: idx === 0 ? 'var(--gold)' : idx === 1 ? '#94a3b8' : idx === 2 ? '#d97706' : '#e2e8f0',
                        color: idx < 3 ? '#ffffff' : '#475569', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '11px', fontWeight: 800
                      }}>
                        {idx + 1}
                      </span>
                      {p.imageUrl && <img src={p.imageUrl} alt={p.title} style={{ width: '34px', height: '34px', borderRadius: '8px', objectFit: 'cover' }} />}
                      <span style={{ fontWeight: 600, color: 'var(--secondary)' }}>{p.title}</span>
                    </td>
                    <td style={{ padding: '12px 10px', fontFamily: 'monospace', fontSize: '12px' }}>{p.sku}</td>
                    <td style={{ padding: '12px 10px' }}>{formatINR(p.price)}</td>
                    <td style={{ padding: '12px 10px', fontWeight: 700, color: 'var(--primary)' }}>{p.unitsSold} units</td>
                    <td style={{ padding: '12px 10px', fontWeight: 700 }}>{formatINR(p.totalRevenue)}</td>
                    <td style={{ padding: '12px 10px' }}>
                      <span className={`badge ${p.currentStock <= 5 ? 'badge-rose' : 'badge-emerald'}`}>
                        {p.currentStock} in reserve
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)' }}>No sales recorded yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// ─── TAB 2: PRODUCTS & INVENTORY COMMAND CENTER ───────────────────────────────
const ProductsTab: React.FC = () => {
  const { showSuccess, showError } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [stockFilter, setStockFilter] = useState<'ALL' | 'IN_STOCK' | 'LOW_STOCK' | 'OUT_OF_STOCK'>('ALL');
  const [showCreate, setShowCreate] = useState(false);
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [adjustingId, setAdjustingId] = useState<number | null>(null);

  const blankForm = (): CreateProductPayload => ({
    sku: '', title: '', description: '', price: 999, stock: 25, imageUrl: '', categoryId: 1, active: true,
  });
  const [form, setForm] = useState<CreateProductPayload>(blankForm());

  const load = useCallback(async () => {
    try {
      const [page, cats] = await Promise.all([
        adminApi.getProducts(0, 100),
        adminApi.getCategories().catch(() => [])
      ]);
      setProducts(page.content);
      setCategories(cats);
    } catch {
      showError('Failed to load products');
    } finally {
      setLoading(false);
    }
  }, [showError]);

  useEffect(() => { load(); }, [load]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await adminApi.createProduct(form);
      showSuccess('Product added to catalogue!');
      setShowCreate(false); setForm(blankForm()); load();
    } catch (err: any) { showError(err?.response?.data?.message || 'Failed to create product'); }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editProduct) return;
    try {
      await adminApi.updateProduct(editProduct.id, form);
      showSuccess('Product catalogue updated!');
      setEditProduct(null); setForm(blankForm()); load();
    } catch (err: any) { showError(err?.response?.data?.message || 'Failed to update product'); }
  };

  const handleDeactivate = async (id: number) => {
    if (!confirm('Deactivate this product from public catalogue?')) return;
    try {
      await adminApi.deactivateProduct(id);
      showSuccess('Product deactivated');
      load();
    } catch { showError('Failed to deactivate'); }
  };

  const handleInlineStockAdjust = async (id: number, delta: number) => {
    setAdjustingId(id);
    try {
      const updated = await adminApi.adjustStock(id, delta);
      setProducts(prev => prev.map(p => p.id === id ? updated : p));
      showSuccess(`Stock adjusted: ${updated.stock} units`);
    } catch (err: any) {
      showError(err?.response?.data?.message || 'Failed to adjust stock');
    } finally {
      setAdjustingId(null);
    }
  };

  const openEdit = (p: Product) => {
    setEditProduct(p);
    setForm({
      sku: p.sku, title: p.title, description: p.description || '',
      price: p.price, stock: p.stock, imageUrl: p.imageUrl || '',
      categoryId: p.categoryId, active: p.active
    });
  };

  const filteredProducts = products.filter(p => {
    const matchesSearch = !search ||
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.sku.toLowerCase().includes(search.toLowerCase());

    if (!matchesSearch) return false;
    if (stockFilter === 'IN_STOCK') return p.stock > 5;
    if (stockFilter === 'LOW_STOCK') return p.stock > 0 && p.stock <= 5;
    if (stockFilter === 'OUT_OF_STOCK') return p.stock === 0;
    return true;
  });

  if (loading) return <LoadingSpinner />;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Search & Actions Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, maxWidth: '500px' }}>
          <input
            className="form-input"
            placeholder="Search by title or SKU..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {(['ALL', 'IN_STOCK', 'LOW_STOCK', 'OUT_OF_STOCK'] as const).map(f => (
            <button
              key={f}
              onClick={() => setStockFilter(f)}
              className={`pill-tab ${stockFilter === f ? 'active' : ''}`}
              style={{ fontSize: '12px', padding: '6px 12px' }}
            >
              {f === 'ALL' ? 'All' : f === 'IN_STOCK' ? 'In Stock' : f === 'LOW_STOCK' ? 'Low Stock (≤5)' : 'Out of Stock'}
            </button>
          ))}
          <button className="btn btn-primary" onClick={() => { setForm(blankForm()); setShowCreate(true); }}>
            <Plus size={16} /> Add Product
          </button>
        </div>
      </div>

      {/* Product Form Modal */}
      {(showCreate || editProduct) && (
        <Modal
          title={showCreate ? 'Create New Catalog Product' : `Edit Product #${editProduct?.id}`}
          onClose={() => { setShowCreate(false); setEditProduct(null); }}
        >
          <form onSubmit={showCreate ? handleCreate : handleUpdate} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">SKU Identifier</label>
                <input className="form-input" value={form.sku} onChange={e => setForm(f => ({ ...f, sku: e.target.value }))} required placeholder="LAP-M3-PRO" />
              </div>
              <div className="form-group">
                <label className="form-label">Category</label>
                <select className="form-input" value={form.categoryId} onChange={e => setForm(f => ({ ...f, categoryId: parseInt(e.target.value) || 1 }))}>
                  {categories.length > 0 ? (
                    categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)
                  ) : (
                    <>
                      <option value={1}>Electronics</option>
                      <option value={2}>Audio & Sound</option>
                      <option value={3}>Computers & Laptops</option>
                      <option value={4}>Wearables</option>
                      <option value={5}>Accessories</option>
                    </>
                  )}
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Product Title</label>
              <input className="form-input" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} required />
            </div>

            <div className="form-group">
              <label className="form-label">Description</label>
              <textarea className="form-input" rows={3} value={form.description || ''} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
            </div>

            <div className="form-group">
              <label className="form-label">Image URL</label>
              <input className="form-input" value={form.imageUrl || ''} onChange={e => setForm(f => ({ ...f, imageUrl: e.target.value }))} placeholder="https://images.unsplash.com/..." />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Price (₹)</label>
                <input className="form-input" type="number" step="0.01" min="0" value={form.price} onChange={e => setForm(f => ({ ...f, price: parseFloat(e.target.value) || 0 }))} required />
              </div>
              <div className="form-group">
                <label className="form-label">Stock Quantity</label>
                <input className="form-input" type="number" min="0" value={form.stock} onChange={e => setForm(f => ({ ...f, stock: parseInt(e.target.value) || 0 }))} required />
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '8px 0' }}>
              <input type="checkbox" id="active-chk" checked={form.active ?? true} onChange={e => setForm(f => ({ ...f, active: e.target.checked }))} style={{ width: '18px', height: '18px' }} />
              <label htmlFor="active-chk" style={{ fontWeight: 600, fontSize: '14px' }}>Active in Storefront</label>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1rem' }}>
              <button type="button" className="btn btn-secondary" onClick={() => { setShowCreate(false); setEditProduct(null); }}>Cancel</button>
              <button type="submit" className="btn btn-primary">{showCreate ? 'Create Product' : 'Save Changes'}</button>
            </div>
          </form>
        </Modal>
      )}

      {/* Products Table with Inline Quick-Stock Adjusters */}
      <div style={{ overflowX: 'auto', background: '#ffffff', borderRadius: '16px', border: '1px solid var(--border)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid var(--border)', background: '#f8fafc' }}>
              <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 700, color: 'var(--text-muted)' }}>Product</th>
              <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 700, color: 'var(--text-muted)' }}>SKU</th>
              <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 700, color: 'var(--text-muted)' }}>Price</th>
              <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 700, color: 'var(--text-muted)' }}>Inventory Status</th>
              <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 700, color: 'var(--text-muted)' }}>Quick Restock</th>
              <th style={{ padding: '12px 16px', textAlign: 'center', fontWeight: 700, color: 'var(--text-muted)' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.map(p => (
              <tr key={p.id} style={{ borderBottom: '1px solid var(--border)', opacity: p.active ? 1 : 0.65 }}>
                <td style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                  {p.imageUrl ? (
                    <img src={p.imageUrl} alt={p.title} style={{ width: '42px', height: '42px', borderRadius: '10px', objectFit: 'cover', border: '1px solid var(--border)' }} />
                  ) : (
                    <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Box size={20} color="#94a3b8" />
                    </div>
                  )}
                  <div>
                    <div style={{ fontWeight: 700, color: 'var(--secondary)' }}>{p.title}</div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>ID #{p.id}</div>
                  </div>
                </td>
                <td style={{ padding: '12px 16px', fontFamily: 'monospace', fontWeight: 600 }}>{p.sku}</td>
                <td style={{ padding: '12px 16px', fontWeight: 700 }}>{formatINR(p.price)}</td>
                <td style={{ padding: '12px 16px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <span className={`badge ${p.stock === 0 ? 'badge-rose' : p.stock <= 5 ? 'badge-amber' : 'badge-emerald'}`} style={{ width: 'fit-content' }}>
                      {p.stock === 0 ? '0 Out of Stock' : `${p.stock} units`}
                    </span>
                    <span style={{ fontSize: '11px', color: p.active ? '#059669' : '#dc2626', fontWeight: 600 }}>
                      {p.active ? '● Active' : '○ Inactive'}
                    </span>
                  </div>
                </td>
                <td style={{ padding: '12px 16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <button
                      className="btn btn-secondary btn-sm"
                      style={{ padding: '3px 8px', fontSize: '11px' }}
                      title="Decrease by 1"
                      disabled={adjustingId === p.id || p.stock <= 0}
                      onClick={() => handleInlineStockAdjust(p.id, -1)}
                    >
                      -1
                    </button>
                    <button
                      className="btn btn-secondary btn-sm"
                      style={{ padding: '3px 8px', fontSize: '11px', fontWeight: 700, color: '#059669' }}
                      title="Add 5 units"
                      disabled={adjustingId === p.id}
                      onClick={() => handleInlineStockAdjust(p.id, 5)}
                    >
                      +5
                    </button>
                    <button
                      className="btn btn-secondary btn-sm"
                      style={{ padding: '3px 8px', fontSize: '11px', fontWeight: 700, color: '#2563eb' }}
                      title="Add 20 units"
                      disabled={adjustingId === p.id}
                      onClick={() => handleInlineStockAdjust(p.id, 20)}
                    >
                      +20
                    </button>
                  </div>
                </td>
                <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                  <div style={{ display: 'flex', justifyContent: 'center', gap: '8px' }}>
                    <button className="btn btn-secondary btn-sm" onClick={() => openEdit(p)} title="Edit Full Details">
                      <Edit2 size={13} />
                    </button>
                    {p.active && (
                      <button className="btn btn-danger btn-sm" onClick={() => handleDeactivate(p.id)} title="Deactivate">
                        <Trash2 size={13} />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// ─── TAB 3: ORDER LIFECYCLE, COURIER SHIPMENT & AUDIT TRAIL ────────────────────
const OrdersTab: React.FC = () => {
  const { showSuccess, showError } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [search, setSearch] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [shipmentModalOrder, setShipmentModalOrder] = useState<Order | null>(null);
  const [transitioningId, setTransitioningId] = useState<number | null>(null);

  // Shipment Form State
  const [shipmentForm, setShipmentForm] = useState({
    carrier: 'BlueDart Express',
    trackingNumber: '',
    estimatedDelivery: '',
    shippingNotes: '',
    shippingAddress: '',
  });

  const load = useCallback(async () => {
    try { setOrders(await adminApi.getOrders()); }
    catch { showError('Failed to load orders'); }
    finally { setLoading(false); }
  }, [showError]);

  useEffect(() => { load(); }, [load]);

  const handleAdvanceStatus = async (orderId: number, nextStatus: OrderStatus, reason?: string) => {
    setTransitioningId(orderId);
    try {
      const updated = await adminApi.updateOrderStatus(orderId, nextStatus, reason);
      showSuccess(`Order #${orderId} transitioned to ${nextStatus}!`);
      setOrders(prev => prev.map(o => o.id === orderId ? updated : o));
      if (selectedOrder && selectedOrder.id === orderId) setSelectedOrder(updated);
    } catch (err: any) {
      showError(err?.response?.data?.message || 'Invalid state transition');
    } finally {
      setTransitioningId(null);
    }
  };

  const openShipmentEditor = (o: Order) => {
    setShipmentModalOrder(o);
    setShipmentForm({
      carrier: o.carrier || 'BlueDart Express',
      trackingNumber: o.trackingNumber || `EXP-${Math.floor(100000 + Math.random() * 900000)}`,
      estimatedDelivery: o.estimatedDelivery || new Date(Date.now() + 4 * 86400000).toISOString().split('T')[0],
      shippingNotes: o.shippingNotes || 'Standard door-to-door courier delivery',
      shippingAddress: o.shippingAddress || '',
    });
  };

  const handleSaveShipment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!shipmentModalOrder) return;
    try {
      const updated = await adminApi.updateShipmentDetails(shipmentModalOrder.id, shipmentForm);
      showSuccess(`Shipment tracking updated for Order #${shipmentModalOrder.id}!`);
      setOrders(prev => prev.map(o => o.id === shipmentModalOrder.id ? updated : o));
      if (selectedOrder && selectedOrder.id === shipmentModalOrder.id) setSelectedOrder(updated);
      setShipmentModalOrder(null);
    } catch (err: any) {
      showError(err?.response?.data?.message || 'Failed to update shipment details');
    }
  };

  const statusBadgeClass = (s: OrderStatus) => {
    switch (s) {
      case 'PLACED': return 'badge-cyan';
      case 'PAID': return 'badge-emerald';
      case 'PACKED': return 'badge-gold';
      case 'SHIPPED': return 'badge-amber';
      case 'DELIVERED': return 'badge-emerald';
      case 'CANCELLED':
      case 'PAYMENT_FAILED': return 'badge-rose';
      default: return 'badge-cyan';
    }
  };

  const filteredOrders = orders.filter(o => {
    const matchesSearch = !search ||
      o.id.toString().includes(search) ||
      o.orderNumber.toLowerCase().includes(search.toLowerCase()) ||
      o.customerEmail.toLowerCase().includes(search.toLowerCase()) ||
      (o.trackingNumber && o.trackingNumber.toLowerCase().includes(search.toLowerCase()));

    if (!matchesSearch) return false;
    if (statusFilter !== 'ALL' && o.status !== statusFilter) return false;
    return true;
  });

  if (loading) return <LoadingSpinner />;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Search & Filter Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <input
          className="form-input"
          style={{ maxWidth: '400px' }}
          placeholder="Search by order #, tracking #, or customer..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <div style={{ display: 'flex', gap: '6px', overflowX: 'auto' }}>
          {['ALL', 'PLACED', 'PAID', 'PACKED', 'SHIPPED', 'DELIVERED', 'CANCELLED'].map(s => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`pill-tab ${statusFilter === s ? 'active' : ''}`}
              style={{ fontSize: '11px', padding: '6px 12px' }}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Orders Table with Courier Shipment Actions */}
      <div style={{ overflowX: 'auto', background: '#ffffff', borderRadius: '16px', border: '1px solid var(--border)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid var(--border)', background: '#f8fafc' }}>
              <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 700, color: 'var(--text-muted)' }}>Order Details</th>
              <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 700, color: 'var(--text-muted)' }}>Customer</th>
              <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 700, color: 'var(--text-muted)' }}>Amount</th>
              <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 700, color: 'var(--text-muted)' }}>Fulfillment & Logistics</th>
              <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 700, color: 'var(--text-muted)' }}>Advance State</th>
              <th style={{ padding: '12px 16px', textAlign: 'center', fontWeight: 700, color: 'var(--text-muted)' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.map(o => (
              <tr key={o.id} style={{ borderBottom: '1px solid var(--border)' }}>
                <td style={{ padding: '12px 16px' }}>
                  <div style={{ fontWeight: 800, color: 'var(--secondary)' }}>#{o.id}</div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'monospace' }}>{o.orderNumber}</div>
                  <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '2px' }}>
                    {o.items?.length || 0} items • {o.createdAt ? new Date(o.createdAt).toLocaleDateString() : 'Recent'}
                  </div>
                </td>
                <td style={{ padding: '12px 16px' }}>
                  <div style={{ fontWeight: 600 }}>{o.customerName || 'Customer'}</div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{o.customerEmail}</div>
                </td>
                <td style={{ padding: '12px 16px' }}>
                  <div style={{ fontWeight: 800, color: 'var(--secondary)' }}>{formatINR(o.totalAmount)}</div>
                  {o.discountAmount > 0 && (
                    <div style={{ fontSize: '11px', color: '#059669', fontWeight: 600 }}>
                      - {formatINR(o.discountAmount)} coupon
                    </div>
                  )}
                </td>
                <td style={{ padding: '12px 16px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <span className={`badge ${statusBadgeClass(o.status)}`} style={{ width: 'fit-content' }}>
                      {o.status}
                    </span>
                    {o.carrier ? (
                      <div style={{ fontSize: '11px', color: '#2563eb', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Truck size={12} /> {o.carrier} ({o.trackingNumber})
                      </div>
                    ) : (
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>No courier assigned</span>
                    )}
                  </div>
                </td>
                <td style={{ padding: '12px 16px' }}>
                  {/* Contextual Action Buttons */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    {o.status === 'PLACED' && (
                      <button
                        className="btn btn-sm"
                        style={{ background: '#ecfdf5', color: '#059669', border: '1px solid #a7f3d0', fontSize: '11px' }}
                        disabled={transitioningId === o.id}
                        onClick={() => handleAdvanceStatus(o.id, 'PAID', 'Payment verified by administrator')}
                      >
                        ✓ Mark Paid
                      </button>
                    )}
                    {o.status === 'PAID' && (
                      <button
                        className="btn btn-sm"
                        style={{ background: '#ecfeff', color: '#0891b2', border: '1px solid #a5f3fc', fontSize: '11px' }}
                        disabled={transitioningId === o.id}
                        onClick={() => handleAdvanceStatus(o.id, 'PACKED', 'Items picked and packed in warehouse')}
                      >
                        📦 Pack Items
                      </button>
                    )}
                    {o.status === 'PACKED' && (
                      <button
                        className="btn btn-sm"
                        style={{ background: '#fffbeb', color: '#d97706', border: '1px solid #fde68a', fontSize: '11px' }}
                        disabled={transitioningId === o.id}
                        onClick={() => handleAdvanceStatus(o.id, 'SHIPPED', 'Dispatched with courier carrier')}
                      >
                        🚚 Dispatch & Ship
                      </button>
                    )}
                    {o.status === 'SHIPPED' && (
                      <button
                        className="btn btn-sm"
                        style={{ background: '#ecfdf5', color: '#059669', border: '1px solid #a7f3d0', fontSize: '11px' }}
                        disabled={transitioningId === o.id}
                        onClick={() => handleAdvanceStatus(o.id, 'DELIVERED', 'Delivered to customer doorstep')}
                      >
                        ★ Mark Delivered
                      </button>
                    )}
                    {o.status !== 'DELIVERED' && o.status !== 'CANCELLED' && (
                      <button
                        className="btn btn-sm"
                        style={{ background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca', fontSize: '11px', padding: '4px 8px' }}
                        disabled={transitioningId === o.id}
                        onClick={() => {
                          const reason = prompt('Cancellation reason:', 'Customer requested cancellation');
                          if (reason) handleAdvanceStatus(o.id, 'CANCELLED', reason);
                        }}
                      >
                        Cancel
                      </button>
                    )}
                    {o.status === 'DELIVERED' && (
                      <span style={{ fontSize: '11px', color: '#059669', fontWeight: 600 }}>Fulfilled Complete</span>
                    )}
                  </div>
                </td>
                <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                  <div style={{ display: 'flex', justifyContent: 'center', gap: '6px' }}>
                    <button
                      className="btn btn-sm"
                      style={{ background: '#eff6ff', color: '#2563eb', border: '1px solid #bfdbfe', fontSize: '11px', padding: '4px 8px' }}
                      onClick={() => openShipmentEditor(o)}
                      title="Edit Courier & Tracking Details"
                    >
                      <Truck size={12} /> Logistics
                    </button>
                    <button className="btn btn-secondary btn-sm" onClick={() => setSelectedOrder(o)} title="Inspect Timeline & Items">
                      <Eye size={13} /> View
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Shipment & Logistics Editor Modal */}
      {shipmentModalOrder && (
        <Modal title={`Logistics & Shipment Details — Order #${shipmentModalOrder.id}`} onClose={() => setShipmentModalOrder(null)}>
          <form onSubmit={handleSaveShipment} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Courier Carrier</label>
                <select
                  className="form-input"
                  value={shipmentForm.carrier}
                  onChange={e => setShipmentForm(f => ({ ...f, carrier: e.target.value }))}
                >
                  <option value="BlueDart Express">BlueDart Express</option>
                  <option value="Delhivery Logistics">Delhivery Logistics</option>
                  <option value="DHL Express">DHL Express</option>
                  <option value="FedEx India">FedEx India</option>
                  <option value="DTDC Air">DTDC Air Express</option>
                  <option value="India Post Speed Post">India Post Speed Post</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Tracking / AWB Number</label>
                <input
                  className="form-input"
                  value={shipmentForm.trackingNumber}
                  onChange={e => setShipmentForm(f => ({ ...f, trackingNumber: e.target.value }))}
                  required
                  placeholder="AWB-882910399"
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Estimated Delivery Date</label>
              <input
                className="form-input"
                type="date"
                value={shipmentForm.estimatedDelivery}
                onChange={e => setShipmentForm(f => ({ ...f, estimatedDelivery: e.target.value }))}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Shipping / Courier Notes</label>
              <input
                className="form-input"
                value={shipmentForm.shippingNotes}
                onChange={e => setShipmentForm(f => ({ ...f, shippingNotes: e.target.value }))}
                placeholder="Fragile hardware, call customer on arrival"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Customer Delivery Address</label>
              <textarea
                className="form-input"
                rows={2}
                value={shipmentForm.shippingAddress}
                onChange={e => setShipmentForm(f => ({ ...f, shippingAddress: e.target.value }))}
              />
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1rem' }}>
              <button type="button" className="btn btn-secondary" onClick={() => setShipmentModalOrder(null)}>Cancel</button>
              <button type="submit" className="btn btn-primary">Save Shipment Tracking</button>
            </div>
          </form>
        </Modal>
      )}

      {/* Detailed Order Timeline & Audit Modal */}
      {selectedOrder && (
        <Modal title={`Order Audit Trail #${selectedOrder.id}`} onClose={() => setSelectedOrder(null)} maxWidth="720px">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc', padding: '14px 18px', borderRadius: '12px' }}>
              <div>
                <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Order Identifier</span>
                <div style={{ fontWeight: 800, fontSize: '16px', color: 'var(--secondary)' }}>{selectedOrder.orderNumber}</div>
              </div>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <button className="btn btn-secondary btn-sm" onClick={() => openShipmentEditor(selectedOrder)}>
                  <Truck size={13} /> Edit Shipment
                </button>
                <span className={`badge ${statusBadgeClass(selectedOrder.status)}`} style={{ fontSize: '13px', padding: '6px 14px' }}>
                  {selectedOrder.status}
                </span>
              </div>
            </div>

            {/* Courier Tracking Highlight if set */}
            {selectedOrder.carrier && (
              <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '12px', padding: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: '12px', fontWeight: 700, color: '#1e40af' }}>Carrier: {selectedOrder.carrier}</div>
                  <div style={{ fontSize: '13px', fontFamily: 'monospace', color: '#1d4ed8', fontWeight: 600 }}>AWB Tracking: {selectedOrder.trackingNumber}</div>
                </div>
                {selectedOrder.estimatedDelivery && (
                  <span style={{ fontSize: '12px', color: '#1e40af', fontWeight: 600 }}>Est. Arrival: {selectedOrder.estimatedDelivery}</span>
                )}
              </div>
            )}

            {/* Stepper Visualizer */}
            <div>
              <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>State Machine Workflow Progress</span>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '12px', position: 'relative' }}>
                {(['PLACED', 'PAID', 'PACKED', 'SHIPPED', 'DELIVERED'] as OrderStatus[]).map((st, i) => {
                  const statuses = ['PLACED', 'PAID', 'PACKED', 'SHIPPED', 'DELIVERED'];
                  const currentIndex = statuses.indexOf(selectedOrder.status);
                  const isDone = currentIndex >= i && selectedOrder.status !== 'CANCELLED';
                  const isCurrent = selectedOrder.status === st;

                  return (
                    <div key={st} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 1, flex: 1 }}>
                      <div style={{
                        width: '32px', height: '32px', borderRadius: '50%',
                        background: isCurrent ? 'var(--primary)' : isDone ? '#059669' : '#e2e8f0',
                        color: isDone || isCurrent ? '#ffffff' : '#64748b',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontWeight: 800, fontSize: '12px',
                        boxShadow: isCurrent ? '0 0 0 4px rgba(17, 75, 58, 0.2)' : 'none'
                      }}>
                        {isDone ? '✓' : i + 1}
                      </div>
                      <span style={{ fontSize: '10px', fontWeight: isCurrent ? 800 : 600, color: isCurrent ? 'var(--primary)' : 'var(--text-muted)', marginTop: '6px' }}>
                        {st}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Items Purchased */}
            <div>
              <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Items ({selectedOrder.items?.length || 0})</span>
              <div style={{ border: '1px solid var(--border)', borderRadius: '10px', marginTop: '8px', overflow: 'hidden' }}>
                {selectedOrder.items?.map(it => (
                  <div key={it.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 14px', borderBottom: '1px solid var(--border)' }}>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '13px' }}>{it.productTitle}</div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Qty: {it.quantity} × {formatINR(it.unitPrice)}</div>
                    </div>
                    <div style={{ fontWeight: 700 }}>{formatINR(it.subtotal)}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Audit History Log */}
            <div>
              <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Audit History Trail (order_status_history)</span>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '8px' }}>
                {selectedOrder.statusHistory && selectedOrder.statusHistory.length > 0 ? (
                  selectedOrder.statusHistory.map(h => (
                    <div key={h.id} style={{ background: '#f8fafc', padding: '10px 14px', borderRadius: '8px', fontSize: '12px', borderLeft: '3px solid var(--primary)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 600 }}>
                        <span>Transition: {h.previousStatus ? `${h.previousStatus} ➔ ` : ''}{h.newStatus}</span>
                        <span style={{ color: 'var(--text-muted)', fontSize: '11px' }}>{h.createdAt ? new Date(h.createdAt).toLocaleString() : ''}</span>
                      </div>
                      <div style={{ color: 'var(--text-muted)', marginTop: '2px', fontSize: '11px' }}>
                        By: <span style={{ fontWeight: 600, color: 'var(--secondary)' }}>{h.changedBy}</span> {h.reason ? `• "${h.reason}"` : ''}
                      </div>
                    </div>
                  ))
                ) : (
                  <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Created initially at {selectedOrder.createdAt}</p>
                )}
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

// ─── TAB 4: COUPONS & PROMOTION ENGINE ─────────────────────────────────────────
const CouponsTab: React.FC = () => {
  const { showSuccess, showError } = useToast();
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);

  const futureDate = (days: number) => new Date(Date.now() + days * 86400000).toISOString().split('T')[0];

  const blankForm = (): CreateCouponPayload => ({
    code: '', discountType: 'PERCENTAGE', discountValue: 10,
    minOrderValue: 0, usageLimit: 100,
    expiresAt: futureDate(30) + 'T23:59:59',
    active: true,
  });
  const [form, setForm] = useState<CreateCouponPayload>(blankForm());
  const [expiresDate, setExpiresDate] = useState(futureDate(30));

  const load = useCallback(async () => {
    try { setCoupons(await adminApi.getCoupons()); }
    catch { showError('Failed to load coupons'); }
    finally { setLoading(false); }
  }, [showError]);

  useEffect(() => { load(); }, [load]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await adminApi.createCoupon({ ...form, expiresAt: expiresDate ? expiresDate + 'T23:59:59' : null });
      showSuccess('Coupon created and active!');
      setShowCreate(false); setForm(blankForm()); setExpiresDate(futureDate(30)); load();
    } catch (err: any) { showError(err?.response?.data?.message || 'Failed to create coupon'); }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 800 }}>Promotional Coupons & Rules ({coupons.length})</h3>
          <p style={{ margin: '2px 0 0 0', fontSize: '13px', color: 'var(--text-muted)' }}>Enforces atomic usage limits, discount rules, and server-side validation</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowCreate(true)}>
          <Plus size={16} /> Create Coupon
        </button>
      </div>

      {showCreate && (
        <Modal title="Create Promotional Coupon" onClose={() => setShowCreate(false)}>
          <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Coupon Code (Uppercase)</label>
              <input className="form-input" value={form.code} onChange={e => setForm(f => ({ ...f, code: e.target.value.toUpperCase() }))} required placeholder="FESTIVE30" />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Discount Type</label>
                <select className="form-input" value={form.discountType} onChange={e => setForm(f => ({ ...f, discountType: e.target.value as 'PERCENTAGE' | 'FIXED' }))}>
                  <option value="PERCENTAGE">PERCENTAGE (%)</option>
                  <option value="FIXED">FIXED AMOUNT (₹)</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">{form.discountType === 'PERCENTAGE' ? 'Discount %' : 'Discount (₹)'}</label>
                <input className="form-input" type="number" min="0" step="0.01" value={form.discountValue} onChange={e => setForm(f => ({ ...f, discountValue: parseFloat(e.target.value) || 0 }))} required />
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Min Order Value (₹)</label>
                <input className="form-input" type="number" min="0" step="0.01" value={form.minOrderValue} onChange={e => setForm(f => ({ ...f, minOrderValue: parseFloat(e.target.value) || 0 }))} />
              </div>
              <div className="form-group">
                <label className="form-label">Max Usage Limit</label>
                <input className="form-input" type="number" min="1" value={form.usageLimit} onChange={e => setForm(f => ({ ...f, usageLimit: parseInt(e.target.value) || 1 }))} required />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Expiration Date</label>
              <input className="form-input" type="date" value={expiresDate} onChange={e => setExpiresDate(e.target.value)} />
            </div>
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1rem' }}>
              <button type="button" className="btn btn-secondary" onClick={() => setShowCreate(false)}>Cancel</button>
              <button type="submit" className="btn btn-primary">Publish Coupon</button>
            </div>
          </form>
        </Modal>
      )}

      <div style={{ overflowX: 'auto', background: '#ffffff', borderRadius: '16px', border: '1px solid var(--border)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid var(--border)', background: '#f8fafc' }}>
              <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 700, color: 'var(--text-muted)' }}>Code</th>
              <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 700, color: 'var(--text-muted)' }}>Discount Value</th>
              <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 700, color: 'var(--text-muted)' }}>Min Order</th>
              <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 700, color: 'var(--text-muted)' }}>Usage Capacity</th>
              <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 700, color: 'var(--text-muted)' }}>Expires</th>
              <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 700, color: 'var(--text-muted)' }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {coupons.map(c => {
              const usagePercent = Math.min(100, Math.round((c.timesUsed / c.usageLimit) * 100));
              const isExpired = c.expiresAt ? new Date(c.expiresAt) < new Date() : false;
              const isDepleted = c.timesUsed >= c.usageLimit;

              return (
                <tr key={c.id} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ fontFamily: 'monospace', fontWeight: 800, fontSize: '15px', color: 'var(--primary)' }}>
                      {c.code}
                    </div>
                  </td>
                  <td style={{ padding: '12px 16px', fontWeight: 700 }}>
                    {c.discountType === 'PERCENTAGE' ? `${c.discountValue}% OFF` : `${formatINR(c.discountValue)} FLAT OFF`}
                  </td>
                  <td style={{ padding: '12px 16px' }}>{formatINR(c.minOrderValue)}</td>
                  <td style={{ padding: '12px 16px', minWidth: '160px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', fontWeight: 600, marginBottom: '4px' }}>
                      <span>{c.timesUsed} used</span>
                      <span>{c.usageLimit} max</span>
                    </div>
                    <div style={{ width: '100%', height: '6px', background: '#f1f5f9', borderRadius: '999px', overflow: 'hidden' }}>
                      <div style={{ width: `${usagePercent}%`, height: '100%', background: usagePercent > 90 ? '#dc2626' : 'var(--primary)' }} />
                    </div>
                  </td>
                  <td style={{ padding: '12px 16px', fontSize: '12px' }}>
                    {c.expiresAt ? new Date(c.expiresAt).toLocaleDateString() : 'No expiry'}
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <span className={`badge ${isExpired ? 'badge-rose' : isDepleted ? 'badge-amber' : c.active ? 'badge-emerald' : 'badge-rose'}`}>
                      {isExpired ? 'Expired' : isDepleted ? 'Exhausted' : c.active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// ─── TAB 5: CUSTOMER & USER DIRECTORY ─────────────────────────────────────────
const UsersTab: React.FC = () => {
  const { showSuccess, showError } = useToast();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [togglingId, setTogglingId] = useState<number | null>(null);

  const load = useCallback(async () => {
    try { setUsers(await adminApi.getUsers()); }
    catch { showError('Failed to load user directory'); }
    finally { setLoading(false); }
  }, [showError]);

  useEffect(() => { load(); }, [load]);

  const handleToggle = async (userId: number) => {
    setTogglingId(userId);
    try {
      const updated = await adminApi.toggleUserStatus(userId);
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, enabled: updated.enabled } : u));
      showSuccess(`Account #${userId} status updated!`);
    } catch (err: any) {
      showError(err?.response?.data?.message || 'Failed to update user status');
    } finally {
      setTogglingId(null);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div>
        <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 800 }}>Registered Users & Customer Accounts ({users.length})</h3>
        <p style={{ margin: '2px 0 0 0', fontSize: '13px', color: 'var(--text-muted)' }}>Role-based access oversight and account permission controls</p>
      </div>

      <div style={{ overflowX: 'auto', background: '#ffffff', borderRadius: '16px', border: '1px solid var(--border)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid var(--border)', background: '#f8fafc' }}>
              <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 700, color: 'var(--text-muted)' }}>User</th>
              <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 700, color: 'var(--text-muted)' }}>Role</th>
              <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 700, color: 'var(--text-muted)' }}>Orders Placed</th>
              <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 700, color: 'var(--text-muted)' }}>Lifetime Spend</th>
              <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 700, color: 'var(--text-muted)' }}>Registered</th>
              <th style={{ padding: '12px 16px', textAlign: 'center', fontWeight: 700, color: 'var(--text-muted)' }}>Account Access</th>
            </tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u.id} style={{ borderBottom: '1px solid var(--border)' }}>
                <td style={{ padding: '12px 16px' }}>
                  <div style={{ fontWeight: 700, color: 'var(--secondary)' }}>{u.firstName} {u.lastName}</div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{u.email}</div>
                </td>
                <td style={{ padding: '12px 16px' }}>
                  <span className={`badge ${u.role === 'ROLE_ADMIN' ? 'badge-gold' : 'badge-cyan'}`}>
                    {u.role === 'ROLE_ADMIN' ? '★ Administrator' : 'Customer'}
                  </span>
                </td>
                <td style={{ padding: '12px 16px', fontWeight: 700 }}>{u.orderCount} orders</td>
                <td style={{ padding: '12px 16px', fontWeight: 700 }}>{formatINR(u.totalSpent || 0)}</td>
                <td style={{ padding: '12px 16px', fontSize: '12px' }}>
                  {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : '—'}
                </td>
                <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                  {u.role !== 'ROLE_ADMIN' ? (
                    <button
                      className={`btn btn-sm ${u.enabled ? 'btn-secondary' : 'btn-primary'}`}
                      style={{ fontSize: '11px', padding: '4px 10px' }}
                      disabled={togglingId === u.id}
                      onClick={() => handleToggle(u.id)}
                    >
                      {u.enabled ? 'Suspend Account' : 'Reactivate'}
                    </button>
                  ) : (
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600 }}>System Protected</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// ─── MAIN ADMIN DASHBOARD PAGE CONTAINER ──────────────────────────────────────
type Tab = 'overview' | 'products' | 'orders' | 'coupons' | 'users';

export const AdminDashboardPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('overview');

  const tabs: { id: Tab; label: string; icon: React.ReactNode; badge?: string }[] = [
    { id: 'overview', label: 'Executive Intelligence', icon: <BarChart3 size={17} /> },
    { id: 'products', label: 'Inventory & Catalogue', icon: <Package size={17} /> },
    { id: 'orders', label: 'Order Workflow', icon: <ShoppingBag size={17} /> },
    { id: 'coupons', label: 'Coupons & Promos', icon: <Tag size={17} /> },
    { id: 'users', label: 'Customer Directory', icon: <Users size={17} /> },
  ];

  return (
    <div className="container" style={{ paddingTop: '2.5rem', paddingBottom: '3.5rem' }}>
      {/* Executive Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <span className="badge badge-gold" style={{ fontSize: '11px', padding: '3px 10px' }}>
              <ShieldCheck size={13} style={{ marginRight: '4px' }} /> Restricted Administrator Console
            </span>
          </div>
          <h1 style={{ fontSize: '28px', fontWeight: 800, margin: 0, color: 'var(--secondary)', letterSpacing: '-0.5px' }}>
            ShopSphere Enterprise Control Center
          </h1>
          <p style={{ color: 'var(--text-muted)', margin: '4px 0 0 0', fontSize: '14px' }}>
            Master orchestrator for stock concurrency, pricing rules, promotions, and status transitions
          </p>
        </div>
      </div>

      {/* Modern Pill Navigation Tabs */}
      <div style={{
        display: 'flex', gap: '8px', background: '#ffffff', padding: '6px',
        borderRadius: '16px', border: '1px solid var(--border)', marginBottom: '2rem',
        overflowX: 'auto', boxShadow: 'var(--shadow-sm)'
      }}>
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`pill-tab ${activeTab === tab.id ? 'active' : ''}`}
            style={{ flex: 1, justifyContent: 'center', whiteSpace: 'nowrap' }}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab Panels */}
      <div>
        {activeTab === 'overview' && <OverviewTab onNavigate={setActiveTab} />}
        {activeTab === 'products' && <ProductsTab />}
        {activeTab === 'orders' && <OrdersTab />}
        {activeTab === 'coupons' && <CouponsTab />}
        {activeTab === 'users' && <UsersTab />}
      </div>
    </div>
  );
};

export default AdminDashboardPage;
