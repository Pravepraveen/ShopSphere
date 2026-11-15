import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ShieldCheck, Tag, ArrowRight, Lock, CheckCircle2,
  AlertCircle, MapPin, PackageCheck, CreditCard, ChevronRight
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { checkoutApi } from '../api/checkoutApi';
import { CouponValidation } from '../types';
import { useToast } from '../components/common/Toast';
import { formatINR } from '../utils/currency';

export const CheckoutPage: React.FC = () => {
  const { cart, items, subtotal } = useCart();
  const navigate = useNavigate();
  const { showSuccess, showError } = useToast();

  const [step, setStep] = useState<number>(1);
  const [recipientName, setRecipientName] = useState<string>('Praveen AK');
  const [phone, setPhone] = useState<string>('+91 98765 43210');
  const [shippingAddress, setShippingAddress] = useState<string>('Penthouse 1402, Signature Towers, Bandra Kurla Complex, Mumbai, MH 400051');
  const [deliveryNotes, setDeliveryNotes] = useState<string>('Leave with building concierge. Ring bell twice.');

  const [couponCode, setCouponCode] = useState<string>('');
  const [couponValidation, setCouponValidation] = useState<CouponValidation | null>(null);
  const [validatingCoupon, setValidatingCoupon] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Generate unique Idempotency-Key per checkout session
  const [idempotencyKey] = useState<string>(() => {
    return 'IDEM-' + Math.random().toString(36).substring(2, 10).toUpperCase() + '-' + Date.now();
  });

  useEffect(() => {
    if (items.length === 0) {
      navigate('/cart');
    }
  }, [items, navigate]);

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCode.trim()) return;

    setValidatingCoupon(true);
    try {
      const res = await checkoutApi.validateCoupon(couponCode.trim(), subtotal);
      setCouponValidation(res);
      showSuccess(`Coupon "${res.code}" applied! You saved ${formatINR(res.discountAmount)}`);
    } catch (err: any) {
      setCouponValidation(null);
      const msg = err.response?.data?.message || err.message || 'Invalid or expired coupon';
      showError(msg);
    } finally {
      setValidatingCoupon(false);
    }
  };

  const handleRemoveCoupon = () => {
    setCouponCode('');
    setCouponValidation(null);
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    const fullAddress = `${recipientName} | Tel: ${phone} | ${shippingAddress} | Notes: ${deliveryNotes}`;
    if (!shippingAddress.trim()) {
      showError('Please enter a valid delivery address');
      return;
    }

    setIsSubmitting(true);
    try {
      const order = await checkoutApi.checkout(idempotencyKey, {
        shippingAddress: fullAddress,
        couponCode: couponValidation ? couponValidation.code : undefined,
      });
      showSuccess(`Order ${order.orderNumber} initialized! Proceeding to Payment.`);
      navigate(`/checkout/payment/${order.id}`);
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Failed to place order';
      showError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const finalDiscount = couponValidation ? couponValidation.discountAmount : 0;
  const finalTotal = Math.max(0, subtotal - finalDiscount);

  return (
    <div style={{ background: '#fbfbfa', minHeight: '100vh', padding: '40px 0 80px 0' }}>
      <div className="container">
        {/* Header & Idempotency Key */}
        <div style={{ marginBottom: '32px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <h1 style={{ fontSize: '32px', fontWeight: 900, color: '#0f172a' }}>256-Bit Encrypted Checkout</h1>
              <p style={{ color: '#64748b', fontSize: '14px', marginTop: '4px' }}>
                Multi-step transactional reservation with mathematical concurrency safety.
              </p>
            </div>
            <div style={{
              background: 'rgba(15, 23, 42, 0.04)',
              padding: '6px 14px',
              borderRadius: '8px',
              border: '1px solid #e2e8f0',
              fontSize: '12px',
              color: '#475569'
            }}>
              Idempotency Key: <code style={{ color: '#059669', fontWeight: 700 }}>{idempotencyKey}</code>
            </div>
          </div>
        </div>

        {/* Visual Progress Stepper */}
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '20px',
          border: '1px solid #e2e8f0',
          padding: '20px 32px',
          boxShadow: '0 4px 15px -2px rgba(15, 23, 42, 0.04)',
          marginBottom: '36px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative' }}>
            {[
              { num: 1, label: 'Delivery Address', icon: MapPin },
              { num: 2, label: 'Items & Review', icon: PackageCheck },
              { num: 3, label: 'Vouchers & Pricing', icon: Tag },
              { num: 4, label: 'Payment Gateway', icon: CreditCard }
            ].map((s, idx) => {
              const Icon = s.icon;
              const isPast = step > s.num;
              const isCurrent = step === s.num;

              return (
                <div
                  key={s.num}
                  onClick={() => s.num < step && setStep(s.num)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    cursor: s.num < step ? 'pointer' : 'default',
                    opacity: s.num > step ? 0.45 : 1
                  }}
                >
                  <div style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    background: isPast
                      ? '#059669'
                      : isCurrent
                      ? 'linear-gradient(135deg, #114b3a, #d4af37)'
                      : '#f1f5f9',
                    color: isPast || isCurrent ? '#ffffff' : '#64748b',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 800,
                    fontSize: '14px',
                    boxShadow: isCurrent ? '0 0 12px rgba(212, 175, 55, 0.4)' : 'none'
                  }}>
                    {isPast ? <CheckCircle2 size={20} /> : <Icon size={18} />}
                  </div>
                  <div>
                    <div style={{ fontSize: '11px', textTransform: 'uppercase', color: '#94a3b8', fontWeight: 700 }}>
                      Step 0{s.num}
                    </div>
                    <div style={{ fontSize: '14px', fontWeight: 800, color: isCurrent ? '#0f172a' : '#64748b' }}>
                      {s.label}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Checkout Main Layout */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 420px', gap: '36px', alignItems: 'start' }}>
          {/* Active Step Panel */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* Step 1: Delivery Address Form */}
            <div style={{
              backgroundColor: '#ffffff',
              borderRadius: '20px',
              border: '1px solid #e2e8f0',
              padding: '32px',
              boxShadow: '0 4px 20px -2px rgba(15, 23, 42, 0.04)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px' }}>
                <div style={{ background: '#ecfdf5', padding: '8px', borderRadius: '10px' }}>
                  <MapPin size={22} color="#059669" />
                </div>
                <div>
                  <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#0f172a', margin: 0 }}>1. Shipping & Delivery Address</h2>
                  <p style={{ fontSize: '13px', color: '#64748b', margin: 0 }}>All parcels are shipped via tamper-evident insured air couriers.</p>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '18px', marginBottom: '18px' }}>
                <div>
                  <label className="form-label">Recipient Full Name</label>
                  <input
                    type="text"
                    value={recipientName}
                    onChange={(e) => setRecipientName(e.target.value)}
                    className="form-input"
                    required
                  />
                </div>
                <div>
                  <label className="form-label">Contact Phone Number</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="form-input"
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Full Street Address, Landmark & Postal Code</label>
                <textarea
                  rows={3}
                  value={shippingAddress}
                  onChange={(e) => setShippingAddress(e.target.value)}
                  className="form-textarea"
                  placeholder="Apartment/Villa, Street, City, State, PIN Code"
                  required
                />
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Delivery Instructions (Optional)</label>
                <input
                  type="text"
                  value={deliveryNotes}
                  onChange={(e) => setDeliveryNotes(e.target.value)}
                  className="form-input"
                  placeholder="e.g. Leave with security, call before arrival"
                />
              </div>
            </div>

            {/* Step 2: Promotional Voucher Application */}
            <div style={{
              backgroundColor: '#ffffff',
              borderRadius: '20px',
              border: '1px solid #e2e8f0',
              padding: '32px',
              boxShadow: '0 4px 20px -2px rgba(15, 23, 42, 0.04)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                <div style={{ background: '#fef3c7', padding: '8px', borderRadius: '10px' }}>
                  <Tag size={22} color="#d97706" />
                </div>
                <div>
                  <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#0f172a', margin: 0 }}>2. Promotional Privileges</h2>
                  <p style={{ fontSize: '13px', color: '#64748b', margin: 0 }}>Discounts validated in real-time against Spring Boot database.</p>
                </div>
              </div>

              <form onSubmit={handleApplyCoupon} style={{ display: 'flex', gap: '12px' }}>
                <input
                  type="text"
                  placeholder="Enter Voucher Code (e.g. WELCOME10, FLAT50)"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  className="form-input"
                  style={{ textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 700 }}
                  disabled={!!couponValidation}
                />
                {couponValidation ? (
                  <button type="button" onClick={handleRemoveCoupon} className="btn btn-outline">
                    Remove
                  </button>
                ) : (
                  <button type="submit" disabled={validatingCoupon || !couponCode.trim()} className="btn btn-primary" style={{ padding: '0 24px' }}>
                    <Tag size={16} /> Apply
                  </button>
                )}
              </form>

              {couponValidation && (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  marginTop: '16px',
                  padding: '12px 18px',
                  backgroundColor: '#ecfdf5',
                  border: '1px solid #a7f3d0',
                  borderRadius: '12px',
                  color: '#065f46',
                  fontSize: '14px',
                  fontWeight: 600
                }}>
                  <CheckCircle2 size={18} color="#059669" />
                  <span>Privilege <strong>{couponValidation.code}</strong> applied: <strong>-{formatINR(couponValidation.discountAmount)}</strong> instant discount!</span>
                </div>
              )}

              <div style={{ marginTop: '16px', fontSize: '12px', color: '#64748b', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <span>Verified demo coupons:</span>
                <span style={{ background: '#f1f5f9', padding: '2px 8px', borderRadius: '6px', color: '#0f172a', fontWeight: 700 }}>WELCOME10</span>
                <span style={{ background: '#f1f5f9', padding: '2px 8px', borderRadius: '6px', color: '#0f172a', fontWeight: 700 }}>FLAT50</span>
                <span style={{ background: '#f1f5f9', padding: '2px 8px', borderRadius: '6px', color: '#0f172a', fontWeight: 700 }}>FLASH1</span>
              </div>
            </div>
          </div>

          {/* Right Column: Order Summary & Placement Console */}
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '24px',
            border: '1px solid #e2e8f0',
            padding: '32px',
            boxShadow: '0 8px 30px -4px rgba(15, 23, 42, 0.08)',
            position: 'sticky',
            top: '90px'
          }}>
            <h3 style={{ fontSize: '20px', fontWeight: 900, color: '#0f172a', marginBottom: '20px' }}>
              Order Review
            </h3>

            {/* Reserved Items List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '24px', maxHeight: '220px', overflowY: 'auto' }}>
              {items.map((item) => (
                <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '13px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <img
                      src={item.productImageUrl || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80'}
                      alt={item.productTitle}
                      style={{ width: '40px', height: '40px', borderRadius: '8px', objectFit: 'cover' }}
                    />
                    <div>
                      <div style={{ fontWeight: 700, color: '#0f172a', maxWidth: '180px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {item.productTitle}
                      </div>
                      <div style={{ fontSize: '11px', color: '#64748b' }}>Qty: {item.quantity}</div>
                    </div>
                  </div>
                  <span style={{ fontWeight: 800, color: '#0f172a' }}>{formatINR(item.itemSubtotal)}</span>
                </div>
              ))}
            </div>

            <div style={{ height: '1px', backgroundColor: '#f1f5f9', margin: '20px 0' }} />

            {/* Calculations */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '14px', marginBottom: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b' }}>
                <span>Items Subtotal</span>
                <span style={{ fontWeight: 700, color: '#0f172a' }}>{formatINR(subtotal)}</span>
              </div>

              {couponValidation && (
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#059669', fontWeight: 700 }}>
                  <span>Coupon Discount ({couponValidation.code})</span>
                  <span>-{formatINR(couponValidation.discountAmount)}</span>
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b' }}>
                <span>Insured Air Dispatch</span>
                <span style={{ fontWeight: 700, color: '#059669' }}>FREE</span>
              </div>

              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                paddingTop: '16px',
                borderTop: '1px solid #f1f5f9',
                fontSize: '22px',
                fontWeight: 900,
                color: '#0f172a'
              }}>
                <span>Total to Pay:</span>
                <span style={{ color: '#059669' }}>{formatINR(finalTotal)}</span>
              </div>
            </div>

            {/* Place Order CTA */}
            <button
              onClick={handlePlaceOrder}
              disabled={isSubmitting}
              className="btn btn-shimmer-gold btn-lg full-width"
              style={{ padding: '16px', fontSize: '16px', borderRadius: '12px' }}
            >
              <Lock size={18} />
              <span>{isSubmitting ? 'Reserving Stock Invariants...' : `Confirm & Proceed to Payment`}</span>
            </button>

            {/* Security Guarantee */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              fontSize: '12px',
              color: '#64748b',
              marginTop: '16px'
            }}>
              <ShieldCheck size={16} color="#059669" />
              <span>Zero Overselling Atomic Stock Guarantee Active</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
