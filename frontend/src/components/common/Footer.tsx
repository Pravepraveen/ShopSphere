import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ShoppingBag, ShieldCheck, Zap, RefreshCw, Lock,
  Mail, ArrowRight, Heart, Sparkles, Truck, Award
} from 'lucide-react';

export const Footer: React.FC = () => {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      setEmail('');
    }
  };

  return (
    <footer style={{
      background: 'linear-gradient(180deg, #072a1e 0%, #041c14 30%, #080c14 100%)',
      color: '#cbd5e1',
      borderTop: '1px solid rgba(212, 175, 55, 0.25)',
      paddingTop: '64px',
      paddingBottom: '32px'
    }}>
      <div className="container">
        {/* Top Feature Pillars */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: '24px',
          paddingBottom: '48px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          marginBottom: '56px'
        }}>
          <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
            <div style={{
              width: '44px',
              height: '44px',
              borderRadius: '12px',
              background: 'rgba(52, 211, 153, 0.12)',
              border: '1px solid rgba(52, 211, 153, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}>
              <Zap size={22} color="#34d399" />
            </div>
            <div>
              <h4 style={{ color: '#ffffff', fontSize: '16px', fontWeight: 800, marginBottom: '4px' }}>
                Atomic Concurrency
              </h4>
              <p style={{ fontSize: '13px', color: '#94a3b8', lineHeight: 1.5 }}>
                Row-level conditional updates eliminate race conditions. Zero overselling.
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
            <div style={{
              width: '44px',
              height: '44px',
              borderRadius: '12px',
              background: 'rgba(212, 175, 55, 0.12)',
              border: '1px solid rgba(212, 175, 55, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}>
              <Lock size={22} color="#d4af37" />
            </div>
            <div>
              <h4 style={{ color: '#ffffff', fontSize: '16px', fontWeight: 800, marginBottom: '4px' }}>
                Idempotent Checkout
              </h4>
              <p style={{ fontSize: '13px', color: '#94a3b8', lineHeight: 1.5 }}>
                Cryptographic session keys ensure orders are never duplicated on retry.
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
            <div style={{
              width: '44px',
              height: '44px',
              borderRadius: '12px',
              background: 'rgba(56, 189, 248, 0.12)',
              border: '1px solid rgba(56, 189, 248, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}>
              <Truck size={22} color="#38bdf8" />
            </div>
            <div>
              <h4 style={{ color: '#ffffff', fontSize: '16px', fontWeight: 800, marginBottom: '4px' }}>
                Insured Express Air
              </h4>
              <p style={{ fontSize: '13px', color: '#94a3b8', lineHeight: 1.5 }}>
                48-hour priority dispatch with real-time waypoint telemetry.
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
            <div style={{
              width: '44px',
              height: '44px',
              borderRadius: '12px',
              background: 'rgba(192, 132, 252, 0.12)',
              border: '1px solid rgba(192, 132, 252, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}>
              <Award size={22} color="#c084fc" />
            </div>
            <div>
              <h4 style={{ color: '#ffffff', fontSize: '16px', fontWeight: 800, marginBottom: '4px' }}>
                2-Year Brand Warranty
              </h4>
              <p style={{ fontSize: '13px', color: '#94a3b8', lineHeight: 1.5 }}>
                100% genuine factory hardware with dedicated concierge coverage.
              </p>
            </div>
          </div>
        </div>

        {/* 4-Column Editorial Links & VIP Newsletter */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1.4fr 1fr 1fr 1.3fr',
          gap: '48px',
          paddingBottom: '56px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
        }}>
          {/* Col 1: Brand & Identity */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
              <div style={{
                background: 'linear-gradient(135deg, #114b3a, #d4af37)',
                padding: '8px',
                borderRadius: '10px'
              }}>
                <ShoppingBag size={22} color="#ffffff" />
              </div>
              <span style={{ fontSize: '22px', fontWeight: 900, color: '#ffffff' }}>
                Shop<span className="gold-gradient-text">Sphere</span>
              </span>
            </div>
            <p style={{ fontSize: '14px', color: '#94a3b8', lineHeight: 1.6, maxWidth: '340px', marginBottom: '20px' }}>
              Discover More. Experience Better. The world’s definitive luxury commerce platform pairing extraordinary industrial design with verified transactional engineering.
            </p>
            <div style={{ fontSize: '12px', color: '#64748b' }}>
              Designed & Engineered for Praveen AK (Ascendion)
            </div>
          </div>

          {/* Col 2: Departments */}
          <div>
            <h5 style={{ fontSize: '14px', fontWeight: 800, color: '#fef08a', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '20px' }}>
              Departments
            </h5>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '14px' }}>
              <Link to="/products?query=audio" style={{ color: '#94a3b8', transition: 'color 0.2s' }}>Spatial Audio & Hi-Fi</Link>
              <Link to="/products?query=drone" style={{ color: '#94a3b8', transition: 'color 0.2s' }}>Drones & Cinematography</Link>
              <Link to="/products?query=pad" style={{ color: '#94a3b8', transition: 'color 0.2s' }}>Computing & Displays</Link>
              <Link to="/products?query=dyson" style={{ color: '#94a3b8', transition: 'color 0.2s' }}>Luxury Smart Living</Link>
              <Link to="/products" style={{ color: '#d4af37', fontWeight: 600 }}>Explore Full Catalog ➔</Link>
            </div>
          </div>

          {/* Col 3: Assistance & Invariants */}
          <div>
            <h5 style={{ fontSize: '14px', fontWeight: 800, color: '#fef08a', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '20px' }}>
              Client Concierge
            </h5>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '14px' }}>
              <Link to="/orders" style={{ color: '#94a3b8' }}>Real-Time Order Tracking</Link>
              <Link to="/cart" style={{ color: '#94a3b8' }}>My Reserved Bag</Link>
              <Link to="/profile" style={{ color: '#94a3b8' }}>Account & Security</Link>
              <Link to="/login" style={{ color: '#94a3b8' }}>Shopper Portal</Link>
              <Link to="/admin" style={{ color: '#fef08a', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <ShieldCheck size={14} color="#d4af37" />
                <span>Executive Admin Console</span>
              </Link>
            </div>
          </div>

          {/* Col 4: VIP Newsletter Subscription */}
          <div>
            <h5 style={{ fontSize: '14px', fontWeight: 800, color: '#fef08a', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '16px' }}>
              The Private Circle
            </h5>
            <p style={{ fontSize: '13px', color: '#94a3b8', lineHeight: 1.5, marginBottom: '16px' }}>
              Receive embargoed product announcements, private discount allocations, and firmware release notes.
            </p>
            {subscribed ? (
              <p style={{ color: '#34d399', fontSize: '13px', fontWeight: 600 }}>
                ✓ Welcome to the ShopSphere Private Circle.
              </p>
            ) : (
              <form onSubmit={handleSubscribe} style={{ display: 'flex', gap: '8px' }}>
                <input
                  type="email"
                  placeholder="Enter email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{
                    flex: 1,
                    padding: '10px 14px',
                    borderRadius: '10px',
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    color: '#ffffff',
                    fontSize: '13px',
                    outline: 'none'
                  }}
                  required
                />
                <button
                  type="submit"
                  className="btn btn-shimmer-gold"
                  style={{ padding: '10px 18px', borderRadius: '10px' }}
                >
                  Join
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Bottom Legal & Copyright Bar */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '16px',
          paddingTop: '32px',
          fontSize: '13px',
          color: '#64748b'
        }}>
          <div>
            &copy; {new Date().getFullYear()} ShopSphere Inc. All global rights reserved.
          </div>
          <div style={{ display: 'flex', gap: '24px' }}>
            <span>Zero Overselling Guarantee</span>
            <span>256-Bit SSL Encrypted</span>
            <span>PCI-DSS Verified Architecture</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
