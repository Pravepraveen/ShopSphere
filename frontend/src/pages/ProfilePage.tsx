import React from 'react';
import { Link } from 'react-router-dom';
import { User, Mail, Shield, ShoppingBag, LogOut, CheckCircle2, ShieldCheck, Award } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const ProfilePage: React.FC = () => {
  const { user, isAdmin, logout } = useAuth();

  if (!user) {
    return (
      <div className="container" style={{ padding: '60px 24px', textAlign: 'center' }}>
        <p>Loading profile...</p>
      </div>
    );
  }

  return (
    <div style={{ background: '#fbfbfa', minHeight: '100vh', padding: '40px 0 80px 0' }}>
      <div className="container" style={{ maxWidth: '840px' }}>
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '24px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 4px 20px -2px rgba(15, 23, 42, 0.05)',
          overflow: 'hidden'
        }}>
          {/* Header Banner */}
          <div style={{
            background: 'linear-gradient(135deg, #041c14 0%, #072a1e 50%, #0a3d2b 100%)',
            color: '#ffffff',
            padding: '40px 36px',
            display: 'flex',
            alignItems: 'center',
            gap: '24px',
            borderBottom: '1px solid rgba(212, 175, 55, 0.25)'
          }}>
            <div style={{
              width: '72px',
              height: '72px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #114b3a, #d4af37)',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '28px',
              fontWeight: 900,
              boxShadow: '0 0 15px rgba(212, 175, 55, 0.4)'
            }}>
              {user.firstName?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <h1 style={{ fontSize: '26px', fontWeight: 900, margin: 0, color: '#ffffff' }}>
                  {user.firstName} {user.lastName}
                </h1>
                <span className={`badge ${isAdmin ? 'badge-gold' : 'badge-emerald'}`} style={{ fontSize: '11px', padding: '3px 10px' }}>
                  {isAdmin ? 'System Administrator' : 'Verified Shopper'}
                </span>
              </div>
              <p style={{ margin: '6px 0 0 0', opacity: 0.85, fontSize: '14px', color: '#cbd5e1' }}>
                {user.email}
              </p>
            </div>
          </div>

          {/* Details */}
          <div style={{ padding: '36px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 800, marginBottom: '20px', color: '#0f172a' }}>
              Account Credentials & Security
            </h2>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px', marginBottom: '36px' }}>
              <div style={{ padding: '18px', backgroundColor: '#f8fafc', borderRadius: '14px', border: '1px solid #e2e8f0' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#64748b', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', marginBottom: '6px' }}>
                  <User size={15} />
                  <span>Full Legal Name</span>
                </div>
                <p style={{ fontWeight: 800, fontSize: '16px', color: '#0f172a', margin: 0 }}>
                  {user.firstName} {user.lastName}
                </p>
              </div>

              <div style={{ padding: '18px', backgroundColor: '#f8fafc', borderRadius: '14px', border: '1px solid #e2e8f0' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#64748b', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', marginBottom: '6px' }}>
                  <Mail size={15} />
                  <span>Email Identity</span>
                </div>
                <p style={{ fontWeight: 800, fontSize: '16px', color: '#0f172a', margin: 0 }}>
                  {user.email}
                </p>
              </div>

              <div style={{ padding: '18px', backgroundColor: '#f8fafc', borderRadius: '14px', border: '1px solid #e2e8f0' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#64748b', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', marginBottom: '6px' }}>
                  <ShieldCheck size={15} />
                  <span>Role Authorization</span>
                </div>
                <div style={{ marginTop: '4px' }}>
                  <span className={`badge ${isAdmin ? 'badge-gold' : 'badge-emerald'}`}>
                    <CheckCircle2 size={13} /> {isAdmin ? 'ROLE_ADMIN' : 'ROLE_CUSTOMER'}
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '14px', borderTop: '1px solid #f1f5f9', paddingTop: '28px', alignItems: 'center' }}>
              <Link to="/orders" className="btn btn-primary" style={{ borderRadius: '10px', padding: '10px 22px' }}>
                <ShoppingBag size={16} /> View My Orders
              </Link>

              {isAdmin && (
                <Link to="/admin" className="btn btn-shimmer-gold" style={{ borderRadius: '10px', padding: '10px 22px' }}>
                  <Shield size={16} /> Open Admin Console
                </Link>
              )}

              <button
                onClick={logout}
                className="btn btn-danger"
                style={{ borderRadius: '10px', padding: '10px 22px', marginLeft: 'auto' }}
              >
                <LogOut size={16} /> Sign Out
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
