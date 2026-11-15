import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Package, ArrowRight, Clock, Calendar, Truck, ShieldCheck, ChevronRight } from 'lucide-react';
import { orderApi } from '../api/orderApi';
import { Order } from '../types';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { formatINR } from '../utils/currency';

export const OrdersPage: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    orderApi.getMyOrders()
      .then(setOrders)
      .catch((err) => console.error('Failed to load orders', err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <LoadingSpinner message="Retrieving order history & fulfillment telemetry..." />;
  }

  if (orders.length === 0) {
    return (
      <div style={{ background: '#fbfbfa', minHeight: '80vh', padding: '80px 24px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center', maxWidth: '440px' }}>
          <div style={{
            width: '80px',
            height: '80px',
            borderRadius: '50%',
            backgroundColor: '#ffffff',
            border: '1px solid #e2e8f0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 24px auto',
            boxShadow: '0 4px 20px -2px rgba(15, 23, 42, 0.05)'
          }}>
            <Package size={36} color="#64748b" />
          </div>
          <h2 style={{ fontSize: '26px', fontWeight: 900, color: '#0f172a', marginBottom: '8px' }}>No Orders Placed Yet</h2>
          <p style={{ color: '#64748b', fontSize: '14px', lineHeight: 1.5, marginBottom: '28px' }}>
            When you acquire items from our collection, your live fulfillment telemetry and waypoint tracking will appear here.
          </p>
          <Link to="/products" className="btn btn-shimmer-gold btn-lg" style={{ borderRadius: '999px', padding: '12px 32px' }}>
            <span>Explore Collection</span>
            <ArrowRight size={18} />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: '#fbfbfa', minHeight: '100vh', padding: '40px 0 80px 0' }}>
      <div className="container">
        {/* Header */}
        <div style={{ marginBottom: '32px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <h1 style={{ fontSize: '32px', fontWeight: 900, color: '#0f172a' }}>My Orders & Deliveries</h1>
              <p style={{ color: '#64748b', fontSize: '14px', marginTop: '4px' }}>
                Real-time 5-stage fulfillment status transitions and shipment tracking records.
              </p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(5, 150, 105, 0.1)', padding: '6px 14px', borderRadius: '999px', border: '1px solid rgba(5, 150, 105, 0.2)' }}>
              <ShieldCheck size={16} color="#059669" />
              <span style={{ fontSize: '12px', fontWeight: 700, color: '#065f46' }}>State Machine Telemetry Active</span>
            </div>
          </div>
        </div>

        {/* Order Cards List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {orders.map((order) => (
            <div
              key={order.id}
              style={{
                backgroundColor: '#ffffff',
                borderRadius: '20px',
                border: '1px solid #e2e8f0',
                padding: '28px 32px',
                boxShadow: '0 4px 20px -2px rgba(15, 23, 42, 0.04)',
                display: 'flex',
                flexWrap: 'wrap',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: '24px',
                transition: 'all 0.2s ease'
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                  <span style={{ fontSize: '18px', fontWeight: 900, color: '#0f172a' }}>{order.orderNumber}</span>
                  <span className={`badge badge-${order.status}`} style={{ fontSize: '12px', padding: '4px 12px' }}>
                    {order.status}
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '13px', color: '#64748b', flexWrap: 'wrap' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <Calendar size={14} /> {new Date(order.createdAt).toLocaleDateString()}
                  </span>
                  <span>•</span>
                  <span>{order.items?.length || 0} {(order.items?.length || 0) === 1 ? 'item' : 'items'}</span>
                  {order.carrier && (
                    <>
                      <span>•</span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#059669', fontWeight: 600 }}>
                        <Truck size={14} /> {order.carrier} ({order.trackingNumber || 'In transit'})
                      </span>
                    </>
                  )}
                  {order.couponCode && (
                    <>
                      <span>•</span>
                      <span style={{ color: '#d97706', fontWeight: 700 }}>Voucher: {order.couponCode}</span>
                    </>
                  )}
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ display: 'block', fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700 }}>Total Settled</span>
                  <span style={{ fontSize: '22px', fontWeight: 900, color: '#0f172a' }}>
                    {formatINR(order.totalAmount)}
                  </span>
                </div>

                <Link
                  to={`/orders/${order.id}`}
                  className="btn btn-outline"
                  style={{
                    borderRadius: '10px',
                    padding: '10px 20px',
                    fontWeight: 700,
                    fontSize: '13px',
                    borderColor: '#cbd5e1'
                  }}
                >
                  <span>Track Telemetry</span>
                  <ChevronRight size={16} />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default OrdersPage;
