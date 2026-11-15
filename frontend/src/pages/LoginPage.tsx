import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { LogIn, User, Lock, Mail, Eye, EyeOff, Shield, Sparkles, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/common/Toast';

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { showSuccess, showError } = useToast();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [showStaffPortal, setShowStaffPortal] = useState(false);

  const redirectPath = new URLSearchParams(location.search).get('redirect') || '/';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      showError('Please enter both email and password');
      return;
    }

    setLoading(true);
    try {
      await login(email.trim(), password);
      showSuccess('Welcome back! Signed in successfully.');
      navigate(redirectPath, { replace: true });
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Invalid email or password';
      showError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickCustomer = () => {
    setEmail('customer@shopsphere.com');
    setPassword('customer123');
    showSuccess('Customer demo credentials filled!');
  };

  const handleQuickAdmin = () => {
    setEmail('admin@shopsphere.com');
    setPassword('admin123');
    showSuccess('Staff / Admin credentials filled!');
  };

  return (
    <div className="container" style={{ padding: '60px 24px', maxWidth: '480px' }}>
      <div style={{
        backgroundColor: '#ffffff', borderRadius: '24px', border: '1px solid var(--border)',
        padding: '40px', boxShadow: '0 20px 40px -15px rgba(15, 23, 42, 0.08)'
      }}>
        {/* Brand & Heading */}
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div style={{
            width: '52px', height: '52px', borderRadius: '16px',
            background: 'linear-gradient(135deg, var(--primary) 0%, #1e293b 100%)',
            color: '#ffffff', display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            marginBottom: '16px', boxShadow: '0 8px 16px rgba(17, 75, 58, 0.2)'
          }}>
            <User size={26} />
          </div>
          <h1 style={{ fontSize: '26px', fontWeight: 800, color: 'var(--secondary)', letterSpacing: '-0.5px' }}>
            Customer Sign In
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginTop: '6px' }}>
            Access your personalized bag, tracked deliveries & orders
          </p>
        </div>

        {/* 1-Click Fast Customer Demo Fill */}
        <div style={{
          background: 'linear-gradient(135deg, #f0fdf4 0%, #e0f2fe 100%)',
          border: '1px solid #bbf7d0', borderRadius: '14px', padding: '12px 16px',
          marginBottom: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Sparkles size={16} color="#059669" />
            <span style={{ fontSize: '12px', fontWeight: 700, color: '#166534' }}>
              One-Click Shopper Demo
            </span>
          </div>
          <button
            type="button"
            onClick={handleQuickCustomer}
            className="btn btn-sm"
            style={{
              background: '#059669', color: '#ffffff', border: 'none',
              fontSize: '11px', fontWeight: 700, padding: '5px 12px', borderRadius: '8px'
            }}
          >
            Auto-Fill Customer
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="form-group">
            <label className="form-label" htmlFor="email-input">Email Address</label>
            <div style={{ position: 'relative' }}>
              <input
                id="email-input"
                type="email"
                placeholder="you@domain.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="form-input"
                style={{ paddingLeft: '38px' }}
                required
              />
              <Mail size={16} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
            </div>
          </div>

          <div className="form-group">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <label className="form-label" htmlFor="password-input" style={{ margin: 0 }}>Password</label>
            </div>
            <div style={{ position: 'relative' }}>
              <input
                id="password-input"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="form-input"
                style={{ paddingLeft: '38px', paddingRight: '38px' }}
                required
              />
              <Lock size={16} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Remember me option */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '13px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', color: 'var(--text-muted)' }}>
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                style={{ width: '16px', height: '16px', borderRadius: '4px' }}
              />
              Remember on this device
            </label>
            <span style={{ color: 'var(--text-muted)', fontSize: '12px' }}>Standard 24h Session</span>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary btn-lg full-width"
            style={{ marginTop: '8px', borderRadius: '12px', fontWeight: 700 }}
          >
            <LogIn size={18} />
            {loading ? 'Verifying Securely...' : 'Sign In as Customer'}
          </button>
        </form>

        {/* Security Trust Badges */}
        <div style={{
          display: 'flex', justifyContent: 'center', gap: '16px',
          marginTop: '24px', paddingTop: '18px', borderTop: '1px solid var(--border)',
          fontSize: '11px', color: 'var(--text-muted)'
        }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <CheckCircle2 size={13} color="#059669" /> 256-Bit SSL
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <CheckCircle2 size={13} color="#059669" /> Real-Time Stock
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <CheckCircle2 size={13} color="#059669" /> Safe Checkout
          </span>
        </div>

        {/* Create account link */}
        <div style={{ marginTop: '20px', textAlign: 'center', fontSize: '14px', color: 'var(--text-muted)' }}>
          New customer?{' '}
          <Link to="/register" style={{ color: 'var(--primary)', fontWeight: 700 }}>
            Create an account
          </Link>
        </div>

        {/* Subtle, Discreet Staff / Admin Link */}
        <div style={{ marginTop: '24px', textAlign: 'center', borderTop: '1px dashed var(--border)', paddingTop: '16px' }}>
          {!showStaffPortal ? (
            <button
              type="button"
              onClick={() => setShowStaffPortal(true)}
              style={{ background: 'none', border: 'none', color: '#94a3b8', fontSize: '12px', cursor: 'pointer', textDecoration: 'underline' }}
            >
              Enterprise Staff & Administrator Portal ➔
            </button>
          ) : (
            <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '12px', border: '1px solid #e2e8f0', animation: 'slideIn 0.2s ease' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--secondary)' }}>Staff Credentials Fast-Fill:</span>
                <button type="button" onClick={() => setShowStaffPortal(false)} style={{ background: 'none', border: 'none', fontSize: '11px', color: '#94a3b8', cursor: 'pointer' }}>Hide</button>
              </div>
              <button
                type="button"
                onClick={handleQuickAdmin}
                className="btn btn-sm btn-outline full-width"
                style={{ fontSize: '11px', padding: '6px' }}
              >
                <Shield size={12} /> Fill Admin (admin@shopsphere.com)
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
