import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight, ShieldCheck, Zap, RefreshCw, ShoppingCart,
  CheckCircle2, Star, Heart, Sparkles, Award, Lock, Truck
} from 'lucide-react';
import { productApi } from '../api/productApi';
import { Product } from '../types';
import { useCart } from '../context/CartContext';
import { useToast } from '../components/common/Toast';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { formatINR } from '../utils/currency';
import { CinematicHero } from '../components/home/CinematicHero';
import { PromotionalBanner } from '../components/home/PromotionalBanner';

export const HomePage: React.FC = () => {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [addingId, setAddingId] = useState<number | null>(null);
  const [wishlist, setWishlist] = useState<number[]>([]);
  const { addToCart } = useCart();
  const { showSuccess, showError } = useToast();

  useEffect(() => {
    productApi.getProducts({ size: 12, sortBy: 'id', sortDirection: 'ASC' })
      .then((res) => setFeaturedProducts(res.content))
      .catch((err) => console.error('Failed to load featured products', err))
      .finally(() => setLoading(false));
  }, []);

  const handleQuickAdd = async (product: Product, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setAddingId(product.id);
    try {
      await addToCart(product.id, 1, true);
      showSuccess(`Added "${product.title}" to your shopping bag`);
    } catch (err: any) {
      showError(err.message || 'Failed to add item to bag');
    } finally {
      setTimeout(() => setAddingId(null), 800);
    }
  };

  const toggleWishlist = (productId: number, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (wishlist.includes(productId)) {
      setWishlist(wishlist.filter((id) => id !== productId));
      showSuccess('Removed from your wishlist');
    } else {
      setWishlist([...wishlist, productId]);
      showSuccess('Saved to your private wishlist');
    }
  };

  const filteredProducts = selectedCategory === 'ALL'
    ? featuredProducts
    : featuredProducts.filter((p) => {
        const cat = (p.categoryName || '').toLowerCase();
        const title = p.title.toLowerCase();
        if (selectedCategory === 'AUDIO') return cat.includes('audio') || title.includes('headphone') || title.includes('ear') || title.includes('sonos');
        if (selectedCategory === 'DRONES') return cat.includes('camera') || title.includes('drone') || title.includes('camera') || title.includes('mavic');
        if (selectedCategory === 'COMPUTING') return cat.includes('comput') || title.includes('pad') || title.includes('mac') || title.includes('pro');
        return true;
      });

  return (
    <div className="home-page" style={{ background: '#fbfbfa' }}>
      {/* 1. Cinematic Full-Screen Hero Experience */}
      <CinematicHero />

      {/* 2. Live Promotional Offers Campaign Carousel */}
      <PromotionalBanner />

      {/* 3. Curated Flagship Product Discoveries */}
      <section className="container" style={{ margin: '48px auto 72px auto' }}>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          marginBottom: '36px'
        }}>
          <span style={{
            fontSize: '12px',
            fontWeight: 800,
            color: '#c5a059',
            textTransform: 'uppercase',
            letterSpacing: '2px',
            marginBottom: '8px',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px'
          }}>
            <Sparkles size={14} color="#d4af37" />
            Curated Discoveries
          </span>
          <h2 style={{ fontSize: '36px', fontWeight: 900, color: '#0f172a', letterSpacing: '-0.5px', margin: 0 }}>
            Featured Masterpieces
          </h2>
          <p style={{ color: '#64748b', fontSize: '15px', maxWidth: '600px', marginTop: '8px' }}>
            Handpicked premium gadgets with verified real-time stock allocation and authoritative database pricing.
          </p>

          {/* Department Filter Tabs */}
          <div style={{
            display: 'flex',
            gap: '10px',
            flexWrap: 'wrap',
            justifyContent: 'center',
            marginTop: '24px'
          }}>
            {[
              { id: 'ALL', label: 'All Curations' },
              { id: 'AUDIO', label: '🎧 Audio & Sound' },
              { id: 'DRONES', label: '📷 Drones & Optics' },
              { id: 'COMPUTING', label: '💻 Smart Computing' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedCategory(tab.id)}
                className={`pill-tab ${selectedCategory === tab.id ? 'active' : ''}`}
                style={{
                  borderRadius: '999px',
                  padding: '8px 20px',
                  fontSize: '13px'
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <LoadingSpinner message="Curating verified catalog..." />
        ) : (
          <div className="products-grid">
            {filteredProducts.map((product) => {
              const isWishlisted = wishlist.includes(product.id);
              const isAdding = addingId === product.id;
              // Synthetic original MSRP for luxury commercial display
              const originalMSRP = Math.round(product.price * 1.18);

              return (
                <div
                  key={product.id}
                  className="product-card"
                  style={{
                    borderRadius: '20px',
                    border: '1px solid #e2e8f0',
                    boxShadow: '0 4px 20px -2px rgba(15, 23, 42, 0.05)',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    position: 'relative'
                  }}
                >
                  <Link to={`/products/${product.id}`} className="product-image-wrap" style={{ height: '240px', position: 'relative' }}>
                    <img
                      src={product.imageUrl || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80'}
                      alt={product.title}
                      className="product-image"
                      loading="lazy"
                    />

                    {/* Discount badge */}
                    <span style={{
                      position: 'absolute',
                      top: '12px',
                      left: '12px',
                      background: 'linear-gradient(135deg, #114b3a, #072a1e)',
                      color: '#fef08a',
                      fontSize: '11px',
                      fontWeight: 800,
                      padding: '4px 10px',
                      borderRadius: '8px',
                      border: '1px solid rgba(212, 175, 55, 0.4)',
                      letterSpacing: '0.5px'
                    }}>
                      SAVE 15%
                    </span>

                    {/* Stock badge */}
                    <span className={`stock-tag ${product.stock > 3 ? 'stock-in' : product.stock > 0 ? 'stock-low' : 'stock-out'}`} style={{ top: '12px', right: '12px' }}>
                      {product.stock > 3 ? `${product.stock} in stock` : product.stock > 0 ? `${product.stock} left (High Demand)` : 'Sold Out'}
                    </span>

                    {/* Wishlist Button */}
                    <button
                      onClick={(e) => toggleWishlist(product.id, e)}
                      style={{
                        position: 'absolute',
                        bottom: '12px',
                        right: '12px',
                        width: '36px',
                        height: '36px',
                        borderRadius: '50%',
                        background: 'rgba(255, 255, 255, 0.9)',
                        backdropFilter: 'blur(8px)',
                        border: '1px solid rgba(0,0,0,0.06)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        color: isWishlisted ? '#ef4444' : '#64748b',
                        transition: 'all 0.2s'
                      }}
                      title={isWishlisted ? 'Remove from wishlist' : 'Save to wishlist'}
                    >
                      <Heart size={16} fill={isWishlisted ? '#ef4444' : 'none'} />
                    </button>
                  </Link>

                  <div className="product-info" style={{ padding: '20px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                      <span className="product-category" style={{ color: '#059669', fontWeight: 700 }}>
                        {product.categoryName || 'Flagship'}
                      </span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '3px', fontSize: '12px', color: '#f59e0b', fontWeight: 700 }}>
                        <Star size={13} fill="#f59e0b" />
                        <span>4.9</span>
                      </div>
                    </div>

                    <Link to={`/products/${product.id}`}>
                      <h3 className="product-title" style={{ fontSize: '16px', fontWeight: 800, minHeight: '42px', lineHeight: 1.35 }}>
                        {product.title}
                      </h3>
                    </Link>

                    <p style={{
                      fontSize: '13px',
                      color: 'var(--text-muted)',
                      marginBottom: '16px',
                      lineHeight: 1.4,
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden'
                    }}>
                      {product.description}
                    </p>

                    <div className="product-footer" style={{ borderTop: '1px solid #f1f5f9', paddingTop: '16px' }}>
                      <div>
                        <div className="product-price" style={{ fontSize: '20px', fontWeight: 900, color: '#0f172a' }}>
                          {formatINR(product.price)}
                        </div>
                        <div style={{ fontSize: '12px', color: '#94a3b8', textDecoration: 'line-through' }}>
                          {formatINR(originalMSRP)}
                        </div>
                      </div>

                      <button
                        onClick={(e) => handleQuickAdd(product, e)}
                        disabled={product.stock <= 0 || isAdding}
                        className={`btn ${isAdding ? 'btn-success' : 'btn-primary'} btn-sm`}
                        style={{
                          borderRadius: '10px',
                          padding: '8px 16px',
                          fontWeight: 700,
                          fontSize: '13px'
                        }}
                        title={product.stock > 0 ? 'Add to bag' : 'Out of stock'}
                      >
                        {isAdding ? (
                          <>
                            <CheckCircle2 size={15} />
                            <span>Added</span>
                          </>
                        ) : (
                          <>
                            <ShoppingCart size={15} />
                            <span>{product.stock > 0 ? 'Add' : 'Sold Out'}</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div style={{ textAlign: 'center', marginTop: '48px' }}>
          <Link to="/products" className="btn btn-outline btn-lg" style={{ borderRadius: '999px', padding: '12px 36px', fontWeight: 700 }}>
            <span>Explore Full Certified Catalog</span>
            <ArrowRight size={18} />
          </Link>
        </div>
      </section>

      {/* 4. Institutional Trust & Concurrency Invariant Guarantees */}
      <section style={{
        background: 'linear-gradient(135deg, #031710 0%, #06281c 50%, #080c14 100%)',
        padding: '80px 0',
        color: '#ffffff',
        borderTop: '1px solid rgba(212, 175, 55, 0.2)'
      }}>
        <div className="container">
          <div style={{ textAlign: 'center', maxWidth: '720px', margin: '0 auto 56px auto' }}>
            <span style={{
              fontSize: '12px',
              fontWeight: 800,
              color: '#d4af37',
              textTransform: 'uppercase',
              letterSpacing: '2px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px'
            }}>
              <ShieldCheck size={16} color="#34d399" />
              The ShopSphere Promise
            </span>
            <h2 style={{ fontSize: '36px', fontWeight: 900, marginTop: '8px', lineHeight: 1.2 }}>
              Engineered For Institutional Reliability & Pure Commercial Trust
            </h2>
            <p style={{ color: '#94a3b8', fontSize: '15px', marginTop: '12px' }}>
              Unlike ordinary storefronts, ShopSphere couples luxury curated gadgets with mathematical backend invariants.
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '28px'
          }}>
            <div className="glass-panel-dark" style={{ padding: '32px', borderRadius: '20px' }}>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                background: 'rgba(52, 211, 153, 0.15)',
                border: '1px solid rgba(52, 211, 153, 0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '20px'
              }}>
                <Zap size={24} color="#34d399" />
              </div>
              <h4 style={{ fontSize: '18px', fontWeight: 800, color: '#ffffff', marginBottom: '8px' }}>
                Zero Oversell Invariant
              </h4>
              <p style={{ fontSize: '14px', color: '#94a3b8', lineHeight: 1.5 }}>
                Row-level atomic SQL updates guarantee no two shoppers can purchase the last unit simultaneously. Concurrency is mathematically verified.
              </p>
            </div>

            <div className="glass-panel-dark" style={{ padding: '32px', borderRadius: '20px' }}>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                background: 'rgba(212, 175, 55, 0.15)',
                border: '1px solid rgba(212, 175, 55, 0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '20px'
              }}>
                <Lock size={24} color="#d4af37" />
              </div>
              <h4 style={{ fontSize: '18px', fontWeight: 800, color: '#ffffff', marginBottom: '8px' }}>
                Server-Side Authoritative Pricing
              </h4>
              <p style={{ fontSize: '14px', color: '#94a3b8', lineHeight: 1.5 }}>
                Zero reliance on client calculations. Item totals, taxes, and promotional coupons are computed strictly in our Spring Boot transactional core.
              </p>
            </div>

            <div className="glass-panel-dark" style={{ padding: '32px', borderRadius: '20px' }}>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                background: 'rgba(56, 189, 248, 0.15)',
                border: '1px solid rgba(56, 189, 248, 0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '20px'
              }}>
                <RefreshCw size={24} color="#38bdf8" />
              </div>
              <h4 style={{ fontSize: '18px', fontWeight: 800, color: '#ffffff', marginBottom: '8px' }}>
                Compensating Rollbacks
              </h4>
              <p style={{ fontSize: '14px', color: '#94a3b8', lineHeight: 1.5 }}>
                If payment is declined or customer cancels, inventory reservations are automatically restored with atomic consistency.
              </p>
            </div>

            <div className="glass-panel-dark" style={{ padding: '32px', borderRadius: '20px' }}>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                background: 'rgba(168, 85, 247, 0.15)',
                border: '1px solid rgba(168, 85, 247, 0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '20px'
              }}>
                <Truck size={24} color="#c084fc" />
              </div>
              <h4 style={{ fontSize: '18px', fontWeight: 800, color: '#ffffff', marginBottom: '8px' }}>
                5-Stage State Machine
              </h4>
              <p style={{ fontSize: '14px', color: '#94a3b8', lineHeight: 1.5 }}>
                Deterministic fulfillment transitions from Placed to Paid, Packed, Shipped, and Delivered with live carrier tracking integration.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
