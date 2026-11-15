import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ShoppingBag, ShoppingCart, User as UserIcon, Shield,
  LogOut, Search, Menu, X, ChevronDown, Sparkles, Tag,
  Headphones, Camera, Laptop, Home, ArrowRight
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';

export const Navbar: React.FC = () => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { totalItems, openDrawer } = useCart();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [megaMenuOpen, setMegaMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  // Scroll detection to transition header from transparent to glassmorphic dark emerald
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 30) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?query=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate('/products');
    }
    setMegaMenuOpen(false);
    setMobileMenuOpen(false);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
    setMobileMenuOpen(false);
  };

  return (
    <>
      {/* Top Promotional Ribbon Ticker */}
      <div className="promo-ribbon">
        <Sparkles size={14} color="#fef08a" />
        <span>
          <strong>MEGA SHOPPING FESTIVAL</strong> • Use Code <span style={{ color: '#ffffff', textDecoration: 'underline' }}>WELCOME10</span> for 10% OFF • Free Insured Delivery on orders over ₹2,000
        </span>
      </div>

      {/* Main Navbar */}
      <header
        className={`navbar ${isScrolled ? 'glass-nav-scrolled' : ''}`}
        style={{
          transition: 'all 0.3s ease',
          background: isScrolled ? 'rgba(4, 28, 20, 0.94)' : 'rgba(3, 23, 16, 0.85)',
          backdropFilter: 'blur(16px)',
          borderBottom: '1px solid rgba(212, 175, 55, 0.2)',
          color: '#ffffff'
        }}
      >
        <div className="navbar-container">
          {/* Brand Logo */}
          <Link to="/" className="navbar-brand" style={{ color: '#ffffff' }}>
            <div className="brand-icon" style={{
              background: 'linear-gradient(135deg, #114b3a, #d4af37)',
              boxShadow: '0 0 12px rgba(212, 175, 55, 0.35)'
            }}>
              <ShoppingBag size={22} color="#ffffff" />
            </div>
            <span className="brand-text" style={{ fontSize: '22px', fontWeight: 900, letterSpacing: '-0.5px' }}>
              <span>Shop</span><span className="gold-gradient-text">Sphere</span>
            </span>
          </Link>

          {/* Interactive Category Trigger with Mega-Menu */}
          <div
            style={{ position: 'relative' }}
            onMouseEnter={() => setMegaMenuOpen(true)}
            onMouseLeave={() => setMegaMenuOpen(false)}
          >
            <button
              onClick={() => setMegaMenuOpen(!megaMenuOpen)}
              style={{
                background: 'none',
                border: 'none',
                color: '#ffffff',
                fontSize: '14px',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 12px',
                borderRadius: '8px'
              }}
            >
              <span>Categories</span>
              <ChevronDown size={15} style={{ transform: megaMenuOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
            </button>

            {/* Mega-Menu Dropdown */}
            {megaMenuOpen && (
              <div className="mega-menu-dropdown">
                <div className="mega-menu-grid">
                  {/* Category 1: Audio */}
                  <div className="mega-category-col">
                    <h4><Headphones size={16} /> Audio & Sound</h4>
                    <Link to="/products?query=headphones" className="mega-category-link" onClick={() => setMegaMenuOpen(false)}>
                      Noise Cancelling
                    </Link>
                    <Link to="/products?query=earbuds" className="mega-category-link" onClick={() => setMegaMenuOpen(false)}>
                      True Wireless Earbuds
                    </Link>
                    <Link to="/products?query=sonos" className="mega-category-link" onClick={() => setMegaMenuOpen(false)}>
                      Spatial Dolby Atmos
                    </Link>
                  </div>

                  {/* Category 2: Cameras */}
                  <div className="mega-category-col">
                    <h4><Camera size={16} /> Drones & Cameras</h4>
                    <Link to="/products?query=camera" className="mega-category-link" onClick={() => setMegaMenuOpen(false)}>
                      Full-Frame Cameras
                    </Link>
                    <Link to="/products?query=drone" className="mega-category-link" onClick={() => setMegaMenuOpen(false)}>
                      Aerial Cinema Drones
                    </Link>
                    <Link to="/products?query=mavic" className="mega-category-link" onClick={() => setMegaMenuOpen(false)}>
                      Hasselblad Optics
                    </Link>
                  </div>

                  {/* Category 3: Computing */}
                  <div className="mega-category-col">
                    <h4><Laptop size={16} /> Smart Computing</h4>
                    <Link to="/products?query=pad" className="mega-category-link" onClick={() => setMegaMenuOpen(false)}>
                      Ultra Retina OLED Tablets
                    </Link>
                    <Link to="/products?query=pro" className="mega-category-link" onClick={() => setMegaMenuOpen(false)}>
                      M-Series Flagships
                    </Link>
                    <Link to="/products?query=accessory" className="mega-category-link" onClick={() => setMegaMenuOpen(false)}>
                      Luxury Desk Accessories
                    </Link>
                  </div>

                  {/* Category 4: Luxury Living */}
                  <div className="mega-category-col">
                    <h4><Home size={16} /> Luxury Living</h4>
                    <Link to="/products?query=dyson" className="mega-category-link" onClick={() => setMegaMenuOpen(false)}>
                      Laser Vacuum Filtration
                    </Link>
                    <Link to="/products?query=sound" className="mega-category-link" onClick={() => setMegaMenuOpen(false)}>
                      Hi-Fi Smart Acoustics
                    </Link>
                    <Link to="/products" className="mega-category-link" onClick={() => setMegaMenuOpen(false)}>
                      All Verified Catalog ➔
                    </Link>
                  </div>

                  {/* Featured Promotional Tile */}
                  <div className="mega-featured-card">
                    <div>
                      <span style={{ fontSize: '11px', fontWeight: 800, color: '#fef08a', textTransform: 'uppercase' }}>
                        Curator's Choice
                      </span>
                      <h5 style={{ fontSize: '15px', color: '#ffffff', fontWeight: 800, margin: '6px 0' }}>
                        Sony Alpha 7 IV + DJI Mavic 3
                      </h5>
                      <p style={{ fontSize: '12px', color: '#cbd5e1', lineHeight: 1.4 }}>
                        Save flat ₹500 with instant coupon FLAT50 on flagship setups.
                      </p>
                    </div>
                    <Link
                      to="/products"
                      onClick={() => setMegaMenuOpen(false)}
                      className="btn btn-shimmer-gold btn-sm"
                      style={{ marginTop: '12px' }}
                    >
                      <span>Explore Bundle</span>
                      <ArrowRight size={14} />
                    </Link>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Global Search Bar */}
          <form onSubmit={handleSearchSubmit} className="navbar-search">
            <Search size={18} className="search-icon" style={{ color: '#d4af37' }} />
            <input
              type="text"
              placeholder="Search flagship audio, drones, cameras, laptops..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
              style={{
                background: 'rgba(255, 255, 255, 0.08)',
                borderColor: 'rgba(212, 175, 55, 0.3)',
                color: '#ffffff'
              }}
            />
          </form>

          {/* Desktop Navigation Links */}
          <nav className="navbar-links">
            <Link to="/products" className="nav-link" style={{ color: '#cbd5e1' }}>Catalog</Link>

            <Link to="/products" className="nav-link" style={{ color: '#fef08a', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Tag size={14} />
              <span>Offers</span>
            </Link>

            {isAdmin && (
              <Link
                to="/admin"
                className="badge badge-gold"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '6px 14px',
                  borderRadius: '999px',
                  textDecoration: 'none',
                  fontSize: '13px'
                }}
              >
                <Shield size={14} />
                <span>Admin Console</span>
              </Link>
            )}

            {isAuthenticated && (
              <Link to="/orders" className="nav-link" style={{ color: '#cbd5e1' }}>
                <span>My Orders</span>
              </Link>
            )}

            {/* Shopping Bag Button (Triggers Slide-Out Drawer) */}
            <button
              onClick={openDrawer}
              className="cart-button"
              title="Open Shopping Bag"
              style={{
                background: 'rgba(255, 255, 255, 0.08)',
                borderColor: 'rgba(212, 175, 55, 0.35)',
                color: '#ffffff',
                cursor: 'pointer'
              }}
            >
              <ShoppingCart size={20} />
              {totalItems > 0 && (
                <span className="cart-badge" style={{
                  background: 'linear-gradient(135deg, #d4af37, #92400e)',
                  boxShadow: '0 0 8px rgba(212, 175, 55, 0.6)'
                }}>
                  {totalItems}
                </span>
              )}
            </button>

            {/* User Profile / Auth State */}
            {isAuthenticated ? (
              <div className="user-menu" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Link
                  to="/profile"
                  className="user-profile-badge"
                  title="My Profile"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    background: 'rgba(255, 255, 255, 0.08)',
                    borderColor: 'rgba(255, 255, 255, 0.15)',
                    color: '#ffffff'
                  }}
                >
                  <UserIcon size={16} color="#d4af37" />
                  <span>{user?.firstName}</span>
                  <span className={`badge ${isAdmin ? 'badge-gold' : 'badge-cyan'}`} style={{ fontSize: '10px', padding: '2px 6px' }}>
                    {isAdmin ? 'Admin' : 'Customer'}
                  </span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="logout-button"
                  title="Log Out"
                  style={{ color: '#94a3b8' }}
                >
                  <LogOut size={16} />
                </button>
              </div>
            ) : (
              <div className="auth-buttons">
                <Link
                  to="/login"
                  className="btn btn-outline"
                  style={{
                    background: 'rgba(255, 255, 255, 0.05)',
                    borderColor: 'rgba(255, 255, 255, 0.2)',
                    color: '#ffffff'
                  }}
                >
                  Sign In
                </Link>
                <Link to="/register" className="btn btn-shimmer-gold">Register</Link>
              </div>
            )}
          </nav>

          {/* Mobile Menu Hamburger */}
          <button
            className="mobile-menu-toggle"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle Menu"
            style={{ color: '#ffffff' }}
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Full Drawer */}
        {mobileMenuOpen && (
          <div className="mobile-menu" style={{
            background: '#072a1e',
            borderBottom: '1px solid rgba(212, 175, 55, 0.25)',
            color: '#ffffff'
          }}>
            <form onSubmit={handleSearchSubmit} className="mobile-search">
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input"
                style={{ background: 'rgba(255, 255, 255, 0.1)', color: '#ffffff' }}
              />
            </form>
            <Link to="/products" className="mobile-link" onClick={() => setMobileMenuOpen(false)}>Catalog</Link>
            <button
              onClick={() => { setMobileMenuOpen(false); openDrawer(); }}
              className="mobile-link"
              style={{ background: 'none', border: 'none', color: '#ffffff', textAlign: 'left', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
            >
              <span>Shopping Bag</span>
              <span className="badge badge-gold">{totalItems}</span>
            </button>
            {isAuthenticated ? (
              <>
                {isAdmin && (
                  <Link to="/admin" className="mobile-link admin-pill" onClick={() => setMobileMenuOpen(false)}>
                    <Shield size={16} /> Admin Console
                  </Link>
                )}
                <Link to="/orders" className="mobile-link" onClick={() => setMobileMenuOpen(false)}>My Orders</Link>
                <Link to="/profile" className="mobile-link" onClick={() => setMobileMenuOpen(false)}>Profile</Link>
                <button onClick={handleLogout} className="mobile-link logout-link" style={{ color: '#ef4444' }}>Log Out</button>
              </>
            ) : (
              <div className="mobile-auth-actions" style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                <Link to="/login" className="btn btn-outline full-width" onClick={() => setMobileMenuOpen(false)}>Sign In</Link>
                <Link to="/register" className="btn btn-shimmer-gold full-width" onClick={() => setMobileMenuOpen(false)}>Register</Link>
              </div>
            )}
          </div>
        )}
      </header>
    </>
  );
};
