import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { X, ShoppingBag, Trash2, Plus, Minus, ArrowRight, ShieldCheck, Tag, Sparkles } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { formatINR } from '../../utils/currency';
import { useToast } from '../common/Toast';

export const CartDrawer: React.FC = () => {
  const { cart, items, totalItems, subtotal, isDrawerOpen, closeDrawer, updateQuantity, removeItem } = useCart();
  const navigate = useNavigate();
  const { showSuccess, showError } = useToast();
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discountPct?: number; flatDiscount?: number } | null>(null);

  if (!isDrawerOpen) return null;

  // Free shipping threshold at INR 2,000
  const freeShippingThreshold = 2000;
  const progressPercent = Math.min(100, Math.round((subtotal / freeShippingThreshold) * 100));
  const amountToFreeShipping = Math.max(0, freeShippingThreshold - subtotal);

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    const code = couponCode.trim().toUpperCase();
    if (!code) return;

    if (code === 'WELCOME10') {
      if (subtotal < 500) {
        showError('WELCOME10 requires a minimum order of ₹500');
        return;
      }
      setAppliedCoupon({ code, discountPct: 10 });
      showSuccess('Coupon WELCOME10 applied: 10% OFF!');
    } else if (code === 'FLAT50') {
      if (subtotal < 2000) {
        showError('FLAT50 requires a minimum order of ₹2,000');
        return;
      }
      setAppliedCoupon({ code, flatDiscount: 500 });
      showSuccess('Coupon FLAT50 applied: Flat ₹500 OFF!');
    } else if (code === 'FLASH1') {
      setAppliedCoupon({ code, discountPct: 50 });
      showSuccess('Coupon FLASH1 applied: 50% Flash Discount!');
    } else {
      showError('Invalid promotional voucher code');
    }
  };

  const discountAmount = appliedCoupon?.discountPct
    ? (subtotal * appliedCoupon.discountPct) / 100
    : appliedCoupon?.flatDiscount || 0;
  const finalTotal = Math.max(0, subtotal - discountAmount);

  const handleCheckout = () => {
    closeDrawer();
    navigate('/checkout');
  };

  return (
    <div className="cart-drawer-backdrop" onClick={closeDrawer}>
      <div className="cart-drawer" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div style={{
          padding: '20px 24px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'rgba(4, 28, 20, 0.95)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              background: 'linear-gradient(135deg, #114b3a, #d4af37)',
              padding: '8px',
              borderRadius: '8px',
              display: 'flex'
            }}>
              <ShoppingBag size={20} color="#ffffff" />
            </div>
            <div>
              <h3 style={{ fontSize: '18px', fontWeight: 700, margin: 0, color: '#ffffff' }}>Your Shopping Bag</h3>
              <span style={{ fontSize: '12px', color: '#94a3b8' }}>{totalItems} {totalItems === 1 ? 'item' : 'items'} reserved</span>
            </div>
          </div>
          <button
            onClick={closeDrawer}
            style={{
              background: 'rgba(255, 255, 255, 0.08)',
              border: 'none',
              borderRadius: '50%',
              width: '36px',
              height: '36px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Free Shipping Meter */}
        <div style={{
          padding: '14px 24px',
          background: 'rgba(7, 42, 30, 0.5)',
          borderBottom: '1px solid rgba(212, 175, 55, 0.15)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: 600 }}>
            <span style={{ color: amountToFreeShipping === 0 ? '#34d399' : '#fef08a' }}>
              {amountToFreeShipping === 0
                ? '🎉 Congratulations! Free Insured Priority Shipping Unlocked'
                : `Add ${formatINR(amountToFreeShipping)} more for Free Priority Shipping`}
            </span>
            <span style={{ color: '#94a3b8' }}>{progressPercent}%</span>
          </div>
          <div className="free-shipping-progress">
            <div className="free-shipping-bar" style={{ width: `${progressPercent}%` }} />
          </div>
        </div>

        {/* Cart Items List */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 24px' }}>
          {items.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 0', color: '#94a3b8' }}>
              <div style={{
                width: '72px',
                height: '72px',
                borderRadius: '50%',
                background: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px auto'
              }}>
                <ShoppingBag size={32} color="#64748b" />
              </div>
              <h4 style={{ color: '#ffffff', fontSize: '18px', marginBottom: '8px' }}>Your bag is empty</h4>
              <p style={{ fontSize: '13px', marginBottom: '24px' }}>Discover our extraordinary collection of luxury technology and gadgets.</p>
              <button
                onClick={() => { closeDrawer(); navigate('/products'); }}
                className="btn btn-shimmer-gold"
                style={{ padding: '10px 24px' }}
              >
                Explore Collection
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {items.map((item) => (
                <div
                  key={item.id}
                  style={{
                    display: 'flex',
                    gap: '14px',
                    padding: '14px',
                    background: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: '12px'
                  }}
                >
                  <img
                    src={item.productImageUrl || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80'}
                    alt={item.productTitle}
                    style={{
                      width: '70px',
                      height: '70px',
                      borderRadius: '8px',
                      objectFit: 'cover',
                      background: '#1e293b'
                    }}
                  />
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <Link
                          to={`/products/${item.productId}`}
                          onClick={closeDrawer}
                          style={{
                            fontSize: '14px',
                            fontWeight: 600,
                            color: '#ffffff',
                            lineHeight: 1.3,
                            textDecoration: 'none'
                          }}
                        >
                          {item.productTitle}
                        </Link>
                        <button
                          onClick={() => removeItem(item.id)}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: '#ef4444',
                            cursor: 'pointer',
                            padding: '2px',
                            opacity: 0.8
                          }}
                          title="Remove item"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                      <div style={{ fontSize: '13px', fontWeight: 700, color: '#fef08a', marginTop: '4px' }}>
                        {formatINR(item.unitPrice)}
                      </div>
                    </div>

                    {/* Quantity controls */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '10px' }}>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        background: 'rgba(255, 255, 255, 0.08)',
                        borderRadius: '6px',
                        border: '1px solid rgba(255, 255, 255, 0.12)'
                      }}>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          disabled={item.quantity <= 1}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: '#ffffff',
                            padding: '4px 8px',
                            cursor: 'pointer',
                            opacity: item.quantity <= 1 ? 0.3 : 1
                          }}
                        >
                          <Minus size={12} />
                        </button>
                        <span style={{ fontSize: '12px', fontWeight: 700, minWidth: '24px', textAlign: 'center' }}>
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: '#ffffff',
                            padding: '4px 8px',
                            cursor: 'pointer'
                          }}
                        >
                          <Plus size={12} />
                        </button>
                      </div>

                      <span style={{ fontSize: '14px', fontWeight: 800, color: '#ffffff' }}>
                        {formatINR(item.itemSubtotal)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer / Summary */}
        {items.length > 0 && (
          <div style={{
            padding: '20px 24px',
            background: 'rgba(4, 28, 20, 0.98)',
            borderTop: '1px solid rgba(212, 175, 55, 0.25)'
          }}>
            {/* Promo Code Form */}
            <form onSubmit={handleApplyCoupon} style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
              <div style={{ position: 'relative', flex: 1 }}>
                <Tag size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                <input
                  type="text"
                  placeholder="Promo code (WELCOME10, FLAT50)"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 10px 8px 30px',
                    borderRadius: '8px',
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    color: '#ffffff',
                    fontSize: '12px',
                    textTransform: 'uppercase'
                  }}
                />
              </div>
              <button
                type="submit"
                style={{
                  padding: '8px 14px',
                  borderRadius: '8px',
                  background: 'rgba(212, 175, 55, 0.15)',
                  border: '1px solid rgba(212, 175, 55, 0.35)',
                  color: '#fef08a',
                  fontWeight: 600,
                  fontSize: '12px',
                  cursor: 'pointer'
                }}
              >
                Apply
              </button>
            </form>

            {/* Calculations */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '13px', marginBottom: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#94a3b8' }}>
                <span>Subtotal</span>
                <span>{formatINR(subtotal)}</span>
              </div>
              {discountAmount > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#34d399' }}>
                  <span>Voucher Discount ({appliedCoupon?.code})</span>
                  <span>-{formatINR(discountAmount)}</span>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#94a3b8' }}>
                <span>Insured Express Shipping</span>
                <span>{amountToFreeShipping === 0 ? <span style={{ color: '#34d399' }}>FREE</span> : '₹99'}</span>
              </div>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                color: '#ffffff',
                fontSize: '16px',
                fontWeight: 800,
                paddingTop: '8px',
                borderTop: '1px solid rgba(255, 255, 255, 0.1)'
              }}>
                <span>Estimated Total</span>
                <span className="gold-gradient-text">{formatINR(finalTotal + (amountToFreeShipping === 0 ? 0 : 99))}</span>
              </div>
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <button
                onClick={handleCheckout}
                className="btn btn-shimmer-gold full-width"
                style={{ padding: '14px', fontSize: '15px' }}
              >
                <span>Proceed to Checkout</span>
                <ArrowRight size={18} />
              </button>
              <button
                onClick={() => { closeDrawer(); navigate('/cart'); }}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#94a3b8',
                  fontSize: '12px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  textAlign: 'center',
                  padding: '4px'
                }}
              >
                View Full Detailed Cart ➔
              </button>
            </div>

            {/* Security Notice */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', marginTop: '12px', color: '#64748b', fontSize: '11px' }}>
              <ShieldCheck size={14} color="#34d399" />
              <span>Mathematical Stock Reservation Guaranteed</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
