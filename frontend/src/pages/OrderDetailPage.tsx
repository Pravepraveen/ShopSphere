import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft, Clock, CheckCircle2, ShieldCheck, CreditCard, Package,
  Truck, Home, AlertCircle, FileText, XCircle, MapPin, Navigation, Calendar, Info
} from 'lucide-react';
import { orderApi } from '../api/orderApi';
import { Order, OrderStatus } from '../types';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { formatINR } from '../utils/currency';
import { useToast } from '../components/common/Toast';

const STEPS: { status: OrderStatus; label: string; desc: string; icon: React.ReactNode }[] = [
  { status: 'PLACED', label: 'Order Placed', desc: 'Idempotent stock reserved', icon: <Clock size={16} /> },
  { status: 'PAID', label: 'Payment Confirmed', desc: 'Zero overselling confirmed', icon: <CreditCard size={16} /> },
  { status: 'PACKED', label: 'Order Packed', desc: 'Quality verified at center', icon: <Package size={16} /> },
  { status: 'SHIPPED', label: 'In Transit', desc: 'Dispatched via express air', icon: <Truck size={16} /> },
  { status: 'DELIVERED', label: 'Delivered', desc: 'Securely received by client', icon: <Home size={16} /> },
];

export const OrderDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isCancelling, setIsCancelling] = useState<boolean>(false);
  const { showSuccess, showError } = useToast();

  useEffect(() => {
    if (id) {
      orderApi.getOrderById(Number(id))
        .then(setOrder)
        .catch((err) => console.error('Failed to load order', err))
        .finally(() => setLoading(false));
    }
  }, [id]);

  const handleCancelOrder = async () => {
    if (!order) return;
    const reason = prompt('Please specify reason for cancellation:', 'Changed my mind');
    if (!reason) return;

    setIsCancelling(true);
    try {
      const updated = await orderApi.cancelOrder(order.id, reason);
      setOrder(updated);
      showSuccess('Order cancelled. Reserved inventory and coupon limits have been atomically restored.');
    } catch (err: any) {
      showError(err?.response?.data?.message || 'Failed to cancel order');
    } finally {
      setIsCancelling(false);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Retrieving real-time fulfillment telemetry..." />;
  }

  if (!order) {
    return (
      <div className="container" style={{ padding: '80px 24px', textAlign: 'center' }}>
        <h2 style={{ fontSize: '28px', fontWeight: 800 }}>Order Record Not Found</h2>
        <p style={{ color: 'var(--text-muted)', margin: '16px 0 28px 0' }}>The requested order ID does not exist in our fulfillment registry.</p>
        <Link to="/orders" className="btn btn-primary" style={{ borderRadius: '999px', padding: '10px 24px' }}>
          <ArrowLeft size={16} /> Return to Orders
        </Link>
      </div>
    );
  }

  const isFailedOrCancelled = order.status === 'PAYMENT_FAILED' || order.status === 'CANCELLED';
  const currentStepIdx = STEPS.findIndex((s) => s.status === order.status);

  // Delivery progress percentage calculation for moving truck
  let progressPct = 10;
  if (order.status === 'PAID') progressPct = 30;
  else if (order.status === 'PACKED') progressPct = 55;
  else if (order.status === 'SHIPPED') progressPct = 80;
  else if (order.status === 'DELIVERED') progressPct = 100;

  return (
    <div style={{ background: '#fbfbfa', minHeight: '100vh', padding: '40px 0 80px 0' }}>
      <div className="container">
        {/* Breadcrumb Navigation */}
        <div style={{ marginBottom: '24px' }}>
          <Link to="/orders" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#64748b', fontWeight: 600 }}>
            <ArrowLeft size={16} /> Back to My Orders
          </Link>
        </div>

        {/* Fulfillment Command Card */}
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '24px',
          border: '1px solid #e2e8f0',
          padding: '36px',
          boxShadow: '0 4px 20px -2px rgba(15, 23, 42, 0.05)',
          marginBottom: '36px'
        }}>
          {/* Top row */}
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '16px', marginBottom: '32px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                <h1 style={{ fontSize: '28px', fontWeight: 900, color: '#0f172a' }}>
                  Fulfillment Telemetry #{order.id}
                </h1>
                <span className={`badge badge-${order.status}`} style={{ fontSize: '13px', padding: '6px 14px' }}>
                  {order.status}
                </span>
              </div>
              <p style={{ color: '#64748b', fontSize: '13px' }}>
                Registered on {new Date(order.createdAt).toLocaleString()} • Idempotency Reference: <code style={{ color: '#059669', fontWeight: 700 }}>{order.idempotencyKey}</code>
              </p>
            </div>

            <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
              <button
                className="btn btn-outline btn-sm"
                onClick={() => window.print()}
                style={{ borderRadius: '8px' }}
              >
                <FileText size={15} /> Print Official Invoice
              </button>

              {order.status === 'PLACED' && (
                <Link to={`/checkout/payment/${order.id}`} className="btn btn-primary btn-sm" style={{ borderRadius: '8px' }}>
                  <CreditCard size={15} /> Complete Payment
                </Link>
              )}

              {(order.status === 'PLACED' || order.status === 'PAID') && (
                <button
                  className="btn btn-danger btn-sm"
                  style={{ borderRadius: '8px' }}
                  disabled={isCancelling}
                  onClick={handleCancelOrder}
                >
                  <XCircle size={15} />
                  {isCancelling ? 'Restoring Stock...' : 'Cancel Order'}
                </button>
              )}
            </div>
          </div>

          {/* Delivery Route Visualization with Animated Moving Truck */}
          {!isFailedOrCancelled ? (
            <div style={{
              background: 'linear-gradient(135deg, #041c14 0%, #072a1e 100%)',
              borderRadius: '20px',
              padding: '36px 32px 48px 32px',
              color: '#ffffff',
              border: '1px solid rgba(212, 175, 55, 0.25)',
              marginBottom: '36px',
              boxShadow: '0 20px 40px -15px rgba(0, 0, 0, 0.4)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '28px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Navigation size={18} color="#d4af37" />
                  <span style={{ fontSize: '14px', fontWeight: 800, color: '#fef08a', textTransform: 'uppercase', letterSpacing: '1px' }}>
                    Live Delivery Journey
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#94a3b8' }}>
                  <Info size={13} />
                  <span>Real-time logistics route synchronized with backend state machine</span>
                </div>
              </div>

              {/* Animated Road Track & Truck */}
              <div className="delivery-road">
                <div className="delivery-road-progress" style={{ width: `${progressPct}%` }} />
                {/* Moving Truck Illustration */}
                <div className="delivery-truck-indicator" style={{ left: `${progressPct}%` }}>
                  <div className="delivery-truck-svg">
                    <svg width="44" height="28" viewBox="0 0 54 36" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <rect x="2" y="6" width="34" height="22" rx="4" fill="#041c14" stroke="#d4af37" strokeWidth="2" />
                      <rect x="36" y="12" width="14" height="16" rx="3" fill="#114b3a" stroke="#d4af37" strokeWidth="2" />
                      <path d="M40 16 L48 16 L48 22 L40 22 Z" fill="#38bdf8" opacity="0.8" />
                      <circle cx="12" cy="28" r="5" fill="#fef08a" stroke="#041c14" strokeWidth="2" />
                      <circle cx="42" cy="28" r="5" fill="#fef08a" stroke="#041c14" strokeWidth="2" />
                      {/* Headlight beam */}
                      <polygon points="50,20 54,18 54,24" fill="#fde047" opacity="0.9" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* 5-Stage Stepper Nodes */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '12px', textAlign: 'center', marginTop: '24px' }}>
                {STEPS.map((step, idx) => {
                  const isCompleted = currentStepIdx >= idx;
                  const isActive = currentStepIdx === idx;

                  return (
                    <div key={step.status} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      <div style={{
                        width: '38px',
                        height: '38px',
                        borderRadius: '50%',
                        background: isCompleted ? '#059669' : isActive ? 'linear-gradient(135deg, #114b3a, #d4af37)' : 'rgba(255, 255, 255, 0.08)',
                        border: isActive ? '2px solid #fef08a' : '1px solid rgba(255, 255, 255, 0.15)',
                        color: '#ffffff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 800,
                        boxShadow: isActive ? '0 0 15px rgba(212, 175, 55, 0.5)' : 'none',
                        marginBottom: '8px'
                      }}>
                        {isCompleted ? <CheckCircle2 size={18} /> : step.icon}
                      </div>
                      <div style={{ fontSize: '13px', fontWeight: isActive ? 800 : 600, color: isActive ? '#fef08a' : isCompleted ? '#ffffff' : '#94a3b8' }}>
                        {step.label}
                      </div>
                      <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>
                        {step.desc}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
              padding: '24px',
              backgroundColor: '#fef2f2',
              borderRadius: '16px',
              border: '1px solid #fecaca',
              color: '#991b1b',
              marginBottom: '36px'
            }}>
              <AlertCircle size={32} color="#dc2626" />
              <div>
                <h4 style={{ fontSize: '16px', fontWeight: 800 }}>Terminal Lifecycle State: {order.status}</h4>
                <p style={{ fontSize: '13px', marginTop: '4px' }}>
                  This order was concluded. Reserved warehouse inventory and voucher application quotas were returned via database compensating transaction.
                </p>
              </div>
            </div>
          )}

          {/* Courier Dispatch & Logistics Metadata Card */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '20px',
            background: '#f8fafc',
            borderRadius: '16px',
            border: '1px solid #e2e8f0',
            padding: '24px'
          }}>
            <div>
              <span style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>Carrier Partner</span>
              <div style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a', marginTop: '4px' }}>
                {order.carrier || 'Express Air Logistics (Pending Handover)'}
              </div>
            </div>
            <div>
              <span style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>Air Waybill Tracking Number</span>
              <div style={{ fontSize: '16px', fontWeight: 800, color: '#059669', marginTop: '4px', fontFamily: 'monospace' }}>
                {order.trackingNumber || 'TRK-SPH-ALLOCATING'}
              </div>
            </div>
            <div>
              <span style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>Estimated Delivery Window</span>
              <div style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a', marginTop: '4px' }}>
                {order.estimatedDelivery || 'Within 48 Business Hours'}
              </div>
            </div>
            <div>
              <span style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>Logistics Dispatch Notes</span>
              <div style={{ fontSize: '13px', color: '#475569', marginTop: '4px' }}>
                {order.shippingNotes || 'Standard priority insured dispatch with verified tamper seal.'}
              </div>
            </div>
          </div>
        </div>

        {/* Breakdown & Audit History Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 380px', gap: '36px', alignItems: 'start' }}>
          {/* Order Items Table */}
          <div style={{ backgroundColor: '#ffffff', borderRadius: '24px', border: '1px solid #e2e8f0', padding: '32px' }}>
            <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#0f172a', marginBottom: '20px' }}>Purchased Masterpieces</h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {order.items?.map((item) => (
                <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '16px', borderBottom: '1px solid #f1f5f9' }}>
                  <div>
                    <h4 style={{ fontSize: '15px', fontWeight: 700, color: '#0f172a' }}>{item.productTitle}</h4>
                    <span style={{ fontSize: '13px', color: '#64748b' }}>
                      {formatINR(item.unitPrice)} × {item.quantity} unit(s)
                    </span>
                  </div>
                  <span style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a' }}>
                    {formatINR(item.subtotal)}
                  </span>
                </div>
              ))}
            </div>

            {/* Audit History Log */}
            <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a', marginTop: '40px', marginBottom: '16px' }}>
              Fulfillment Audit Trail (Database Telemetry)
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {order.statusHistory?.map((h) => (
                <div key={h.id} style={{ display: 'flex', gap: '12px', fontSize: '13px', padding: '12px 16px', backgroundColor: '#f8fafc', borderRadius: '10px', border: '1px solid #f1f5f9' }}>
                  <Clock size={16} color="#64748b" style={{ flexShrink: 0, marginTop: '2px' }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ color: '#0f172a', fontWeight: 700 }}>
                      {h.previousStatus ? `${h.previousStatus} ➔ ` : ''}{h.newStatus}
                      <span style={{ color: '#64748b', fontWeight: 500, marginLeft: '8px' }}>by {h.changedBy}</span>
                    </div>
                    {h.reason && <p style={{ color: '#64748b', fontSize: '12px', marginTop: '2px' }}>{h.reason}</p>}
                  </div>
                  <span style={{ color: '#94a3b8', fontSize: '11px' }}>
                    {new Date(h.createdAt).toLocaleTimeString()}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Financial Summary & Delivery Destination */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div style={{ backgroundColor: '#ffffff', borderRadius: '24px', border: '1px solid #e2e8f0', padding: '32px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', marginBottom: '16px' }}>Financial Ledger</h3>

              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', fontSize: '14px', color: '#64748b' }}>
                <span>Items Subtotal:</span>
                <span style={{ fontWeight: 700, color: '#0f172a' }}>{formatINR(order.subtotal)}</span>
              </div>

              {order.discountAmount > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', fontSize: '14px', color: '#059669', fontWeight: 700 }}>
                  <span>Voucher Privilege ({order.couponCode}):</span>
                  <span>-{formatINR(order.discountAmount)}</span>
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px', fontSize: '14px', color: '#64748b' }}>
                <span>Insured Express Shipping:</span>
                <span style={{ fontWeight: 700, color: '#059669' }}>FREE</span>
              </div>

              <div style={{ height: '1px', backgroundColor: '#f1f5f9', margin: '16px 0' }} />

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '20px', fontWeight: 900 }}>
                <span>Total Settled:</span>
                <span style={{ color: '#059669' }}>{formatINR(order.totalAmount)}</span>
              </div>
            </div>

            <div style={{ backgroundColor: '#ffffff', borderRadius: '24px', border: '1px solid #e2e8f0', padding: '32px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', marginBottom: '12px' }}>Destination Address</h3>
              <p style={{ fontSize: '14px', color: '#475569', lineHeight: 1.6 }}>
                {order.shippingAddress}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailPage;
