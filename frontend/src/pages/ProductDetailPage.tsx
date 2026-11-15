import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ShoppingCart, ShieldCheck, ArrowLeft, Check, AlertTriangle, Truck,
  Star, Heart, Share2, Award, ShieldAlert, Zap, Box, CheckCircle2, RefreshCw
} from 'lucide-react';
import { productApi } from '../api/productApi';
import { Product } from '../types';
import { useCart } from '../context/CartContext';
import { useToast } from '../components/common/Toast';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { formatINR } from '../utils/currency';

export const ProductDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [quantity, setQuantity] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<'specs' | 'shipping' | 'invariants'>('specs');
  const [isWishlisted, setIsWishlisted] = useState<boolean>(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState<number>(0);
  const navigate = useNavigate();
  const { addToCart, openDrawer } = useCart();
  const { showSuccess, showError } = useToast();

  useEffect(() => {
    if (id) {
      setLoading(true);
      productApi.getProductById(Number(id))
        .then((prod) => {
          setProduct(prod);
          // Fetch related products from same category or general catalog
          productApi.getProducts({ size: 4, categoryId: prod.categoryId })
            .then((res) => setRelatedProducts(res.content.filter((p) => p.id !== prod.id)))
            .catch(() => {});
        })
        .catch((err) => {
          console.error('Failed to load product', err);
          showError('Product not found');
        })
        .finally(() => setLoading(false));
    }
  }, [id, showError]);

  const handleAddToCart = async (showCartDrawer = true) => {
    if (!product) return;
    try {
      await addToCart(product.id, quantity, showCartDrawer);
      showSuccess(`Added ${quantity} × "${product.title}" to your shopping bag`);
    } catch (err: any) {
      showError(err.message || 'Failed to add item to bag');
    }
  };

  const handleBuyNow = async () => {
    if (!product) return;
    try {
      await addToCart(product.id, quantity, false);
      navigate('/checkout');
    } catch (err: any) {
      showError(err.message || 'Failed to initialize instant purchase');
    }
  };

  if (loading) {
    return <LoadingSpinner message="Retrieving certified product specifications..." />;
  }

  if (!product) {
    return (
      <div className="container" style={{ padding: '80px 24px', textAlign: 'center' }}>
        <h2 style={{ fontSize: '28px', fontWeight: 800 }}>Masterpiece Not Located</h2>
        <p style={{ color: 'var(--text-muted)', margin: '16px 0 28px 0' }}>The product you are requesting is either not yet catalogued or archived.</p>
        <Link to="/products" className="btn btn-shimmer-gold" style={{ padding: '12px 28px' }}>
          <ArrowLeft size={16} /> Return to Certified Catalog
        </Link>
      </div>
    );
  }

  const originalMSRP = Math.round(product.price * 1.18);
  const savedAmount = originalMSRP - product.price;

  // Multi-angle gallery simulation for luxury feel
  const galleryImages = [
    product.imageUrl || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800&auto=format&fit=crop&q=80'
  ];

  return (
    <div style={{ background: '#fbfbfa', minHeight: '100vh', padding: '32px 0 80px 0' }}>
      <div className="container">
        {/* Breadcrumb Navigation */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
          <Link to="/products" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#64748b', fontWeight: 600 }}>
            <ArrowLeft size={16} /> Back to Certified Catalog
          </Link>
          <span style={{ fontSize: '12px', color: '#94a3b8' }}>
            SKU: <strong style={{ color: '#0f172a' }}>{product.sku}</strong>
          </span>
        </div>

        {/* Main Product Showcase Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1.1fr',
          gap: '48px',
          backgroundColor: '#ffffff',
          borderRadius: '24px',
          border: '1px solid #e2e8f0',
          padding: '40px',
          boxShadow: '0 4px 25px -4px rgba(15, 23, 42, 0.05)',
          marginBottom: '48px'
        }}>
          {/* Left Column: Interactive Multi-Image Gallery */}
          <div>
            <div style={{
              width: '100%',
              height: '420px',
              borderRadius: '20px',
              backgroundColor: '#f8fafc',
              border: '1px solid #f1f5f9',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden',
              position: 'relative',
              marginBottom: '16px'
            }}>
              <img
                src={galleryImages[selectedImageIndex]}
                alt={product.title}
                style={{ width: '100%', height: '100%', objectFit: 'contain', padding: '20px' }}
              />
              <span style={{
                position: 'absolute',
                top: '16px',
                left: '16px',
                background: 'linear-gradient(135deg, #114b3a, #072a1e)',
                color: '#fef08a',
                fontSize: '11px',
                fontWeight: 800,
                padding: '4px 12px',
                borderRadius: '999px',
                letterSpacing: '0.5px'
              }}>
                SAVE 15%
              </span>
            </div>

            {/* Gallery Thumbnails */}
            <div style={{ display: 'flex', gap: '12px' }}>
              {galleryImages.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImageIndex(idx)}
                  style={{
                    width: '74px',
                    height: '74px',
                    borderRadius: '12px',
                    border: selectedImageIndex === idx ? '2px solid #059669' : '1px solid #e2e8f0',
                    background: '#f8fafc',
                    padding: '4px',
                    cursor: 'pointer',
                    outline: 'none',
                    overflow: 'hidden'
                  }}
                >
                  <img src={img} alt="Thumbnail" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                </button>
              ))}
            </div>
          </div>

          {/* Right Column: Meta & Transaction Console */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ fontSize: '12px', fontWeight: 800, color: '#059669', textTransform: 'uppercase', letterSpacing: '1.5px' }}>
                {product.categoryName || 'Flagship Edition'}
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#f59e0b', fontSize: '13px', fontWeight: 700 }}>
                <Star size={14} fill="#f59e0b" />
                <span>4.9 (128 Verified Reviews)</span>
              </div>
            </div>

            <h1 style={{ fontSize: '32px', fontWeight: 900, color: '#0f172a', lineHeight: 1.2, marginBottom: '16px' }}>
              {product.title}
            </h1>

            {/* Price Presentation */}
            <div style={{
              display: 'flex',
              alignItems: 'baseline',
              gap: '14px',
              paddingBottom: '20px',
              borderBottom: '1px solid #f1f5f9',
              marginBottom: '20px'
            }}>
              <span style={{ fontSize: '36px', fontWeight: 900, color: '#0f172a' }}>
                {formatINR(product.price)}
              </span>
              <span style={{ fontSize: '18px', color: '#94a3b8', textDecoration: 'line-through' }}>
                {formatINR(originalMSRP)}
              </span>
              <span style={{ fontSize: '13px', fontWeight: 800, color: '#059669', background: '#ecfdf5', padding: '3px 8px', borderRadius: '6px' }}>
                Save {formatINR(savedAmount)}
              </span>
            </div>

            {/* Live Inventory Status Meter */}
            <div style={{
              padding: '16px',
              borderRadius: '14px',
              background: product.stock > 3 ? '#f0fdf4' : product.stock > 0 ? '#fffbeb' : '#fef2f2',
              border: `1px solid ${product.stock > 3 ? '#bbf7d0' : product.stock > 0 ? '#fde68a' : '#fecaca'}`,
              marginBottom: '24px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span style={{
                  fontSize: '13px',
                  fontWeight: 800,
                  color: product.stock > 3 ? '#166534' : product.stock > 0 ? '#92400e' : '#991b1b',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}>
                  {product.stock > 3 ? <CheckCircle2 size={16} /> : <AlertTriangle size={16} />}
                  {product.stock > 3 ? `Ready to Ship • ${product.stock} units reserved in Mumbai Fulfillment Center` : product.stock > 0 ? `High Demand • Only ${product.stock} units remaining!` : 'Sold Out • Backorder Queue Active'}
                </span>
                <span style={{ fontSize: '11px', color: '#64748b' }}>Atomic Row Protected</span>
              </div>
            </div>

            {/* Description */}
            <p style={{ color: '#475569', fontSize: '15px', lineHeight: 1.6, marginBottom: '28px' }}>
              {product.description || 'Masterpiece engineering crafted with aerospace-grade materials, zero-tolerance precision, and official multi-year warranty coverage.'}
            </p>

            {/* Quantity Selector & Action CTAs */}
            <div style={{
              padding: '24px',
              borderRadius: '16px',
              backgroundColor: '#f8fafc',
              border: '1px solid #e2e8f0',
              marginBottom: '28px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
                <span style={{ fontSize: '14px', fontWeight: 700, color: '#334155' }}>Select Quantity:</span>
                <div style={{ display: 'flex', alignItems: 'center', background: '#ffffff', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
                  <button
                    type="button"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1 || product.stock <= 0}
                    style={{ width: '38px', height: '38px', background: 'none', border: 'none', fontWeight: 800, cursor: 'pointer', color: '#0f172a' }}
                  >
                    -
                  </button>
                  <span style={{ width: '48px', textAlign: 'center', fontWeight: 800, fontSize: '15px' }}>
                    {quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                    disabled={quantity >= product.stock || product.stock <= 0}
                    style={{ width: '38px', height: '38px', background: 'none', border: 'none', fontWeight: 800, cursor: 'pointer', color: '#0f172a' }}
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '12px' }}>
                <button
                  onClick={() => handleAddToCart(true)}
                  disabled={product.stock <= 0}
                  className="btn btn-primary btn-lg"
                  style={{ borderRadius: '12px', padding: '14px', fontWeight: 800 }}
                >
                  <ShoppingCart size={18} />
                  <span>{product.stock > 0 ? `Add ${quantity} to Bag` : 'Sold Out'}</span>
                </button>

                <button
                  onClick={handleBuyNow}
                  disabled={product.stock <= 0}
                  className="btn btn-shimmer-gold btn-lg"
                  style={{ borderRadius: '12px', padding: '14px', fontWeight: 800 }}
                >
                  <Zap size={18} />
                  <span>Instant Checkout</span>
                </button>
              </div>
            </div>

            {/* Trust highlights */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', fontSize: '13px', color: '#475569' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ShieldCheck size={18} color="#059669" />
                <span>2-Year Official Brand Warranty</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Truck size={18} color="#38bdf8" />
                <span>Free 48h Insured Express Delivery</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Award size={18} color="#d4af37" />
                <span>100% Authentic Guaranteed</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <RefreshCw size={18} color="#6366f1" />
                <span>Easy 30-Day Replacement Window</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tabbed In-Depth Information */}
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '24px',
          border: '1px solid #e2e8f0',
          padding: '36px',
          boxShadow: '0 4px 20px -2px rgba(15, 23, 42, 0.04)',
          marginBottom: '56px'
        }}>
          {/* Tab Navigation */}
          <div style={{ display: 'flex', gap: '12px', borderBottom: '1px solid #e2e8f0', paddingBottom: '16px', marginBottom: '24px' }}>
            <button
              onClick={() => setActiveTab('specs')}
              className={`pill-tab ${activeTab === 'specs' ? 'active' : ''}`}
            >
              Technical Specifications
            </button>
            <button
              onClick={() => setActiveTab('shipping')}
              className={`pill-tab ${activeTab === 'shipping' ? 'active' : ''}`}
            >
              Shipping & Packaging
            </button>
            <button
              onClick={() => setActiveTab('invariants')}
              className={`pill-tab ${activeTab === 'invariants' ? 'active' : ''}`}
            >
              Mathematical Concurrency Verification
            </button>
          </div>

          {/* Tab Content */}
          {activeTab === 'specs' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
              <div style={{ padding: '16px', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                <span style={{ fontSize: '12px', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>SKU Identifier</span>
                <div style={{ fontSize: '15px', fontWeight: 800, color: '#0f172a', marginTop: '4px' }}>{product.sku}</div>
              </div>
              <div style={{ padding: '16px', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                <span style={{ fontSize: '12px', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>Department</span>
                <div style={{ fontSize: '15px', fontWeight: 800, color: '#0f172a', marginTop: '4px' }}>{product.categoryName || 'Consumer Electronics'}</div>
              </div>
              <div style={{ padding: '16px', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                <span style={{ fontSize: '12px', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>Stock Verification</span>
                <div style={{ fontSize: '15px', fontWeight: 800, color: '#059669', marginTop: '4px' }}>{product.stock} units locked in database</div>
              </div>
            </div>
          )}

          {activeTab === 'shipping' && (
            <div style={{ color: '#475569', fontSize: '14px', lineHeight: 1.7 }}>
              <p style={{ marginBottom: '12px' }}>
                All ShopSphere shipments are handled via tier-1 insured express partners (BlueDart, FedEx, Delhivery).
                Packages are inspected under dual-camera supervision in our fulfillment centers and dispatched within 24 hours.
              </p>
              <ul style={{ paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <li>Air Cargo Priority Dispatch with live GPS tracking</li>
                <li>Tamper-evident anti-counterfeit holographic seal</li>
                <li>Carbon-neutral certified protective packaging</li>
              </ul>
            </div>
          )}

          {activeTab === 'invariants' && (
            <div style={{ color: '#475569', fontSize: '14px', lineHeight: 1.7 }}>
              <p style={{ marginBottom: '12px' }}>
                This product is bound by ShopSphere’s transactional concurrency model:
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: '#f0fdf4', padding: '10px 14px', borderRadius: '8px', border: '1px solid #bbf7d0' }}>
                  <CheckCircle2 size={16} color="#16a34a" />
                  <span><strong>Atomic Decrement:</strong> <code>UPDATE products SET stock = stock - ? WHERE id = ? AND stock &gt;= ?</code> ensures zero overselling.</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: '#f0fdf4', padding: '10px 14px', borderRadius: '8px', border: '1px solid #bbf7d0' }}>
                  <CheckCircle2 size={16} color="#16a34a" />
                  <span><strong>Deadlock Prevention:</strong> Products are ordered deterministically by ID before obtaining row locks.</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Related Products Section */}
        {relatedProducts.length > 0 && (
          <div>
            <h3 style={{ fontSize: '24px', fontWeight: 800, color: '#0f172a', marginBottom: '24px' }}>
              Frequently Paired Flagships
            </h3>
            <div className="products-grid">
              {relatedProducts.map((rel) => (
                <div key={rel.id} className="product-card" style={{ borderRadius: '16px' }}>
                  <Link to={`/products/${rel.id}`} className="product-image-wrap" style={{ height: '180px' }}>
                    <img src={rel.imageUrl || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80'} alt={rel.title} className="product-image" />
                  </Link>
                  <div className="product-info" style={{ padding: '16px' }}>
                    <Link to={`/products/${rel.id}`}>
                      <h4 style={{ fontSize: '14px', fontWeight: 700, color: '#0f172a', marginBottom: '8px' }}>{rel.title}</h4>
                    </Link>
                    <div style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a' }}>{formatINR(rel.price)}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductDetailPage;
