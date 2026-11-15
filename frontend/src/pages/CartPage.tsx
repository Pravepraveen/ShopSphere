import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, ShoppingBag, ArrowRight, ShieldCheck, Tag, Plus, Minus, CheckCircle2 } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useToast } from '../components/common/Toast';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { formatINR } from '../utils/currency';

export const CartPage: React.FC = () => {
  const { cart, items, totalItems, subtotal, isLoading, updateQuantity, removeItem, clearCart } = useCart();
  const { showSuccess, showError } = useToast();
  const navigate = useNavigate();

  const handleUpdateQty = async (itemId: number, newQty: number, maxStock: number) => {
    if (newQty < 1) return;
    if (newQty > maxStock) {
      showError(`Only ${maxStock} units available in stock`);
      return;
    }
    try {
      await updateQuantity(itemId, newQty);
    } catch (err: any) {
      showError(err.message || 'Failed to update item quantity');
    }
  };

  const handleRemove = async (itemId: number, title: string) => {
    try {
      await removeItem(itemId);
      showSuccess(`Removed "${title}" from bag`);
    } catch (err: any) {
      showError('Failed to remove item');
    }
  };

  const handleClear = async () => {
    if (window.confirm('Are you sure you want to clear your shopping bag?')) {
      try {
        await clearCart();
        showSuccess('Shopping bag cleared');
      } catch (err) {
        showError('Failed to clear bag');
      }
    }
  };

  if (isLoading && !cart) {
    return <LoadingSpinner message="Retrieving reserved bag items..." />;
  }

  // Free shipping calculation
  const freeShippingThreshold = 2000;
  const progressPercent = Math.min(100, Math.round((subtotal / freeShippingThreshold) * 100));
  const amountToFreeShipping = Math.max(0, freeShippingThreshold - subtotal);

  if (items.length === 0) {
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
            <ShoppingBag size={36} color="#64748b" />
          </div>
          <h2 style={{ fontSize: '26px', fontWeight: 900, color: '#0f172a', marginBottom: '8px' }}>Your Cart is Empty</h2>
          <p style={{ color: '#64748b', fontSize: '14px', lineHeight: 1.5, marginBottom: '28px' }}>
            Discover our collection of verified tech masterpieces, aerial drones, and spatial audio systems.
          </p>
          <Link to="/products" className="btn btn-shimmer-gold btn-lg" style={{ borderRadius: '999px', padding: '12px 32px' }}>
            <span>Explore Products</span>
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
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '32px' }}>
          <div>
            <h1 style={{ fontSize: '32px', fontWeight: 900, color: '#0f172a' }}>Shopping Bag</h1>
            <p style={{ color: '#64748b', fontSize: '14px', marginTop: '4px' }}>
              {totalItems} {totalItems === 1 ? 'item' : 'items'} reserved with mathematical concurrency protection
            </p>
          </div>
          <button onClick={handleClear} className="btn btn-outline btn-sm" style={{ color: '#dc2626', borderColor: '#fecaca', borderRadius: '8px' }}>
            <Trash2 size={14} /> Clear Bag
          </button>
        </div>

        {/* Free Shipping Banner */}
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          border: '1px solid #e2e8f0',
          padding: '18px 24px',
          marginBottom: '32px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.03)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', fontWeight: 700, marginBottom: '8px' }}>
            <span style={{ color: amountToFreeShipping === 0 ? '#059669' : '#0f172a' }}>
              {amountToFreeShipping === 0
                ? '🎉 Free Insured Priority Air Delivery Unlocked for your order!'
                : `Add ${formatINR(amountToFreeShipping)} more to unlock Free Priority Delivery`}
            </span>
            <span style={{ color: '#64748b' }}>{progressPercent}%</span>
          </div>
          <div style={{ height: '8px', background: '#f1f5f9', borderRadius: '999px', overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${progressPercent}%`, background: 'linear-gradient(90deg, #114b3a, #d4af37)', borderRadius: '999px', transition: 'width 0.4s ease' }} />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 380px', gap: '36px', alignItems: 'start' }}>
          {/* Item List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {items.map((item) => (
              <div
                key={item.id}
                style={{
                  backgroundColor: '#ffffff',
                  padding: '24px',
                  borderRadius: '20px',
                  border: '1px solid #e2e8f0',
                  boxShadow: '0 4px 20px -2px rgba(15, 23, 42, 0.04)',
                  display: 'flex',
                  gap: '20px',
                  alignItems: 'center',
                }}
              >
                <img
                  src={item.productImageUrl || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80'}
                  alt={item.productTitle}
                  style={{ width: '84px', height: '84px', objectFit: 'cover', borderRadius: '12px', backgroundColor: '#f1f5f9' }}
                />

                <div style={{ flex: 1 }}>
                  <Link to={`/products/${item.productId}`}>
                    <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a', marginBottom: '4px' }}>{item.productTitle}</h3>
                  </Link>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '13px', color: '#64748b' }}>
                    <span>Unit Price: <strong style={{ color: '#0f172a' }}>{formatINR(item.unitPrice)}</strong></span>
                    <span>•</span>
                    <span>SKU: {item.productSku}</span>
                  </div>
                </div>

                {/* Quantity Controls */}
                <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #cbd5e1', borderRadius: '8px', overflow: 'hidden' }}>
                  <button
                    onClick={() => handleUpdateQty(item.id, item.quantity - 1, item.availableStock)}
                    disabled={item.quantity <= 1}
                    style={{ width: '34px', height: '34px', background: '#f8fafc', border: 'none', fontWeight: 800, cursor: 'pointer' }}
                  >
                    <Minus size={13} />
                  </button>
                  <span style={{ width: '40px', textAlign: 'center', fontWeight: 800, fontSize: '14px' }}>
                    {item.quantity}
                  </span>
                  <button
                    onClick={() => handleUpdateQty(item.id, item.quantity + 1, item.availableStock)}
                    disabled={item.quantity >= item.availableStock}
                    style={{ width: '34px', height: '34px', background: '#f8fafc', border: 'none', fontWeight: 800, cursor: 'pointer' }}
                  >
                    <Plus size={13} />
                  </button>
                </div>

                {/* Line Subtotal */}
                <div style={{ textAlign: 'right', minWidth: '100px' }}>
                  <span style={{ fontSize: '18px', fontWeight: 900, color: '#0f172a' }}>
                    {formatINR(item.itemSubtotal)}
                  </span>
                </div>

                <button
                  onClick={() => handleRemove(item.id, item.productTitle)}
                  style={{ background: 'none', border: 'none', color: '#94a3b8', padding: '6px', cursor: 'pointer' }}
                  title="Remove item"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            ))}
          </div>

          {/* Order Summary Box */}
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '24px',
            border: '1px solid #e2e8f0',
            padding: '32px',
            boxShadow: '0 8px 30px -4px rgba(15, 23, 42, 0.08)'
          }}>
            <h2 style={{ fontSize: '20px', fontWeight: 900, color: '#0f172a', marginBottom: '20px' }}>Order Summary</h2>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', fontSize: '14px', color: '#64748b' }}>
              <span>Items Subtotal</span>
              <span style={{ fontWeight: 700, color: '#0f172a' }}>{formatINR(subtotal)}</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px', fontSize: '14px', color: '#64748b' }}>
              <span>Insured Air Dispatch</span>
              <span style={{ fontWeight: 700, color: '#059669' }}>{amountToFreeShipping === 0 ? 'FREE' : '₹99'}</span>
            </div>

            <div style={{ height: '1px', backgroundColor: '#f1f5f9', margin: '16px 0' }} />

            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px', fontSize: '22px', fontWeight: 900, color: '#0f172a' }}>
              <span>Total:</span>
              <span style={{ color: '#059669' }}>{formatINR(subtotal + (amountToFreeShipping === 0 ? 0 : 99))}</span>
            </div>

            <button
              onClick={() => navigate('/checkout')}
              className="btn btn-shimmer-gold btn-lg full-width"
              style={{ marginBottom: '16px', borderRadius: '12px', padding: '16px' }}
            >
              <span>Proceed to Checkout</span>
              <ArrowRight size={18} />
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#64748b', justifyContent: 'center' }}>
              <ShieldCheck size={16} color="#059669" />
              <span>Prices & stock authoritative on database</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
