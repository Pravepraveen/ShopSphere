import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  CheckCircle2, XCircle, AlertTriangle, ArrowRight, ShieldCheck,
  CreditCard, Smartphone, Building2, Calendar, QrCode, Lock,
  Sparkles, RefreshCw, ChevronRight, Zap
} from 'lucide-react';
import { orderApi } from '../api/orderApi';
import { checkoutApi } from '../api/checkoutApi';
import { Order } from '../types';
import { useToast } from '../components/common/Toast';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { formatINR } from '../utils/currency';

type PaymentMethod = 'UPI' | 'CARD' | 'NETBANKING' | 'EMI' | 'COD';

export const MockPaymentPage: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const { showSuccess, showError } = useToast();

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>('UPI');

  // Card details state
  const [cardNumber, setCardNumber] = useState('4532 8920 1192 4892');
  const [cardHolder, setCardHolder] = useState('PRAVEEN AK');
  const [cardExpiry, setCardExpiry] = useState('08/28');
  const [cardCvv, setCardCvv] = useState('382');
  const [isCardFlipped, setIsCardFlipped] = useState(false);

  // UPI details state
  const [upiId, setUpiId] = useState('customer@okaxis');
  const [selectedUpiApp, setSelectedUpiApp] = useState('GPay');

  // Bank details state
  const [selectedBank, setSelectedBank] = useState('HDFC');

  useEffect(() => {
    if (orderId) {
      orderApi.getOrderById(Number(orderId))
        .then(setOrder)
        .catch((err) => {
          showError('Failed to load order for payment');
          navigate('/orders');
        })
        .finally(() => setLoading(false));
    }
  }, [orderId, navigate, showError]);

  const handleSimulatePayment = async (action: 'SIMULATE_SUCCESS' | 'SIMULATE_FAILURE') => {
    if (!order) return;
    setIsProcessing(true);
    try {
      // Simulate realistic payment gateway network latency
      await new Promise(r => setTimeout(r, 1200));

      const res = await checkoutApi.mockPayment({
        orderId: order.id,
        action,
      });

      if (res.paymentSuccessful) {
        showSuccess(res.message);
        navigate(`/orders/${order.id}`);
      } else {
        showError(res.message);
        navigate(`/orders/${order.id}`);
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Payment simulation failed';
      showError(msg);
    } finally {
      setIsProcessing(false);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Securing connection with Payment Gateway Sandbox..." />;
  }

  if (!order) return null;

  return (
    <div className="container" style={{ padding: '40px 24px', maxWidth: '880px' }}>
      {/* Simulation Advisory Banner */}
      <div style={{
        backgroundColor: '#fffbeb', border: '1px solid #fde68a', borderRadius: '16px',
        padding: '14px 20px', marginBottom: '24px', display: 'flex', gap: '14px', alignItems: 'center'
      }}>
        <AlertTriangle size={22} color="#d97706" style={{ flexShrink: 0 }} />
        <div style={{ fontSize: '13px', color: '#92400e' }}>
          <strong>Interactive Payment Simulation Sandbox:</strong> Test multiple payment flows with verified atomic stock reservation. Choose an instrument below and authorize or test simulated decline.
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '24px', alignItems: 'start' }}>
        {/* Left: Payment Method Terminal */}
        <div style={{
          backgroundColor: '#ffffff', borderRadius: '20px', border: '1px solid var(--border)',
          padding: '28px', boxShadow: '0 4px 20px -2px rgba(15, 23, 42, 0.06)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: 'var(--secondary)' }}>
              Select Payment Instrument
            </h3>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: '#059669', fontWeight: 700, background: '#ecfdf5', padding: '3px 8px', borderRadius: '6px' }}>
              <ShieldCheck size={13} /> 256-Bit SSL
            </span>
          </div>

          {/* Instrument Selector Tabs */}
          <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', overflowX: 'auto', paddingBottom: '4px' }}>
            {[
              { id: 'UPI', label: 'UPI / QR', icon: <Smartphone size={15} /> },
              { id: 'CARD', label: 'Debit & Credit Card', icon: <CreditCard size={15} /> },
              { id: 'NETBANKING', label: 'Net Banking', icon: <Building2 size={15} /> },
              { id: 'EMI', label: '0% EMI', icon: <Calendar size={15} /> },
            ].map(m => (
              <button
                key={m.id}
                onClick={() => setSelectedMethod(m.id as PaymentMethod)}
                className={`pill-tab ${selectedMethod === m.id ? 'active' : ''}`}
                style={{ fontSize: '12px', padding: '8px 14px' }}
              >
                {m.icon} <span>{m.label}</span>
              </button>
            ))}
          </div>

          {/* METHOD 1: UPI / QR CODE */}
          {selectedMethod === 'UPI' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* Dynamic QR Code Simulator */}
              <div style={{
                background: '#f8fafc', border: '1px dashed #cbd5e1', borderRadius: '16px',
                padding: '20px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px'
              }}>
                <div style={{
                  width: '140px', height: '140px', background: '#ffffff', borderRadius: '12px',
                  padding: '12px', border: '2px solid var(--primary)', display: 'flex', flexDirection: 'column',
                  alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(17, 75, 58, 0.1)'
                }}>
                  <QrCode size={90} color="var(--primary)" />
                  <span style={{ fontSize: '9px', fontWeight: 800, color: 'var(--secondary)', marginTop: '4px' }}>SCAN & PAY VIA UPI</span>
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                  Scan with any UPI app to pay <strong>{formatINR(order.totalAmount)}</strong>
                </div>
              </div>

              {/* Quick UPI Apps Grid */}
              <div>
                <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Popular Apps</span>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px', marginTop: '8px' }}>
                  {['GPay', 'PhonePe', 'Paytm', 'CRED'].map(app => (
                    <button
                      key={app}
                      type="button"
                      onClick={() => setSelectedUpiApp(app)}
                      style={{
                        padding: '10px', borderRadius: '10px', fontSize: '12px', fontWeight: 700,
                        border: selectedUpiApp === app ? '2px solid var(--primary)' : '1px solid var(--border)',
                        background: selectedUpiApp === app ? '#ecfdf5' : '#ffffff',
                        color: selectedUpiApp === app ? 'var(--primary)' : 'var(--text-main)',
                        cursor: 'pointer', transition: 'all 0.15s ease'
                      }}
                    >
                      {app}
                    </button>
                  ))}
                </div>
              </div>

              {/* UPI ID input */}
              <div className="form-group">
                <label className="form-label">Or enter your UPI VPA ID</label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input
                    className="form-input"
                    value={upiId}
                    onChange={e => setUpiId(e.target.value)}
                    placeholder="name@okaxis"
                  />
                  <button type="button" className="btn btn-secondary btn-sm" onClick={() => showSuccess('UPI ID verified!')}>
                    Verify
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* METHOD 2: DEBIT & CREDIT CARD */}
          {selectedMethod === 'CARD' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              {/* Holographic 3D Card Preview */}
              <div
                style={{
                  background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #114b3a 100%)',
                  borderRadius: '16px', padding: '22px 26px', color: '#ffffff',
                  boxShadow: '0 12px 24px -6px rgba(15, 23, 42, 0.3)', position: 'relative', overflow: 'hidden'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                  <span style={{ fontSize: '12px', fontWeight: 700, letterSpacing: '2px', color: '#94a3b8' }}>SHOPSPHERE PLATINUM</span>
                  <span style={{ fontWeight: 800, fontSize: '16px', color: '#fde68a' }}>VISA</span>
                </div>
                <div style={{ fontSize: '18px', fontFamily: 'monospace', letterSpacing: '3px', fontWeight: 600, marginBottom: '20px' }}>
                  {cardNumber || '•••• •••• •••• ••••'}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                  <div>
                    <span style={{ fontSize: '9px', textTransform: 'uppercase', color: '#94a3b8', display: 'block' }}>Cardholder</span>
                    <span style={{ fontSize: '13px', fontWeight: 700, textTransform: 'uppercase' }}>{cardHolder || 'CARDHOLDER NAME'}</span>
                  </div>
                  <div>
                    <span style={{ fontSize: '9px', textTransform: 'uppercase', color: '#94a3b8', display: 'block' }}>Expires</span>
                    <span style={{ fontSize: '13px', fontWeight: 700 }}>{cardExpiry || 'MM/YY'}</span>
                  </div>
                </div>
              </div>

              {/* Card Inputs */}
              <div className="form-group">
                <label className="form-label">Card Number</label>
                <input className="form-input" value={cardNumber} onChange={e => setCardNumber(e.target.value)} maxLength={19} />
              </div>
              <div className="form-group">
                <label className="form-label">Cardholder Name</label>
                <input className="form-input" value={cardHolder} onChange={e => setCardHolder(e.target.value.toUpperCase())} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-group">
                  <label className="form-label">Expires</label>
                  <input className="form-input" value={cardExpiry} onChange={e => setCardExpiry(e.target.value)} placeholder="MM/YY" maxLength={5} />
                </div>
                <div className="form-group">
                  <label className="form-label">CVV</label>
                  <input className="form-input" type="password" value={cardCvv} onChange={e => setCardCvv(e.target.value)} maxLength={4} />
                </div>
              </div>
            </div>
          )}

          {/* METHOD 3: NET BANKING */}
          {selectedMethod === 'NETBANKING' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Select Your Bank</span>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                {['HDFC Bank', 'ICICI Bank', 'State Bank of India', 'Axis Bank', 'Kotak Bank'].map(b => (
                  <button
                    key={b}
                    type="button"
                    onClick={() => setSelectedBank(b)}
                    style={{
                      padding: '12px', borderRadius: '12px', fontSize: '13px', fontWeight: 600,
                      border: selectedBank === b ? '2px solid var(--primary)' : '1px solid var(--border)',
                      background: selectedBank === b ? '#ecfdf5' : '#ffffff',
                      color: selectedBank === b ? 'var(--primary)' : 'var(--text-main)',
                      cursor: 'pointer', textAlign: 'left'
                    }}
                  >
                    {b}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* METHOD 4: EMI */}
          {selectedMethod === 'EMI' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>No Cost EMI Options</span>
              {[
                { months: 3, perMonth: Math.round(order.totalAmount / 3) },
                { months: 6, perMonth: Math.round(order.totalAmount / 6) },
                { months: 12, perMonth: Math.round(order.totalAmount / 12) },
              ].map(plan => (
                <div key={plan.months} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 16px', borderRadius: '10px', border: '1px solid var(--border)' }}>
                  <div>
                    <strong>{plan.months} Months</strong>
                    <div style={{ fontSize: '11px', color: '#059669', fontWeight: 700 }}>Zero Interest</div>
                  </div>
                  <div style={{ fontWeight: 800 }}>{formatINR(plan.perMonth)}/mo</div>
                </div>
              ))}
            </div>
          )}

          {/* Action Trigger Buttons */}
          <div style={{ marginTop: '28px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <button
              onClick={() => handleSimulatePayment('SIMULATE_SUCCESS')}
              disabled={isProcessing}
              className="btn btn-primary btn-lg full-width"
              style={{ fontWeight: 800, fontSize: '15px', borderRadius: '12px' }}
            >
              <Zap size={18} />
              {isProcessing ? 'Securing Transaction...' : `Pay ${formatINR(order.totalAmount)} Securely`}
            </button>

            <button
              onClick={() => handleSimulatePayment('SIMULATE_FAILURE')}
              disabled={isProcessing}
              className="btn btn-outline full-width"
              style={{ fontSize: '12px', color: '#dc2626', borderColor: '#fecaca' }}
            >
              Simulate Bank Decline (Test Stock Rollback)
            </button>
          </div>
        </div>

        {/* Right: Order Summary Card */}
        <div style={{
          backgroundColor: '#ffffff', borderRadius: '20px', border: '1px solid var(--border)',
          padding: '24px', boxShadow: 'var(--shadow-sm)'
        }}>
          <h3 style={{ fontSize: '16px', fontWeight: 800, marginBottom: '16px', color: 'var(--secondary)' }}>
            Order Summary
          </h3>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '16px' }}>
            Order Number: <strong style={{ color: 'var(--secondary)', fontFamily: 'monospace' }}>{order.orderNumber}</strong>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', borderBottom: '1px solid var(--border)', paddingBottom: '16px', marginBottom: '16px' }}>
            {order.items?.map(item => (
              <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                <span style={{ color: 'var(--text-main)', fontWeight: 500 }}>
                  {item.productTitle} × {item.quantity}
                </span>
                <span style={{ fontWeight: 700 }}>{formatINR(item.subtotal)}</span>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
              <span>Items Subtotal:</span>
              <span>{formatINR(order.subtotal)}</span>
            </div>
            {order.discountAmount > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#059669', fontWeight: 700 }}>
                <span>Coupon Discount:</span>
                <span>-{formatINR(order.discountAmount)}</span>
              </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
              <span>Delivery Fee:</span>
              <span style={{ color: '#059669', fontWeight: 700 }}>FREE</span>
            </div>
            <div style={{ borderTop: '2px dashed var(--border)', paddingTop: '12px', marginTop: '4px', display: 'flex', justifyContent: 'space-between', fontSize: '18px', fontWeight: 800, color: 'var(--secondary)' }}>
              <span>Total Payable:</span>
              <span style={{ color: 'var(--primary)' }}>{formatINR(order.totalAmount)}</span>
            </div>
          </div>

          <div style={{ marginTop: '20px', background: '#f8fafc', padding: '14px', borderRadius: '12px', fontSize: '12px', color: 'var(--text-muted)' }}>
            <strong>Shipping to:</strong>
            <p style={{ margin: '4px 0 0 0', lineHeight: 1.5 }}>{order.shippingAddress}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
