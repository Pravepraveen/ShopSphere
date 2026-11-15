import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles, ShieldCheck, Zap, Star, Compass } from 'lucide-react';

export const CinematicHero: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Ambient fluid particle mesh animation on HTML5 Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = canvas.parentElement?.clientWidth || window.innerWidth);
    let height = (canvas.height = canvas.parentElement?.clientHeight || 650);

    const handleResize = () => {
      if (!canvas || !canvas.parentElement) return;
      width = canvas.width = canvas.parentElement.clientWidth;
      height = canvas.height = canvas.parentElement.clientHeight;
    };
    window.addEventListener('resize', handleResize);

    // Particles array
    const particles: Array<{
      x: number;
      y: number;
      radius: number;
      vx: number;
      vy: number;
      color: string;
      alpha: number;
    }> = [];

    const colors = ['#d4af37', '#34d399', '#38bdf8', '#c5a059', '#ffffff'];
    for (let i = 0; i < 45; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: Math.random() * 2 + 0.8,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        color: colors[Math.floor(Math.random() * colors.length)],
        alpha: Math.random() * 0.5 + 0.2,
      });
    }

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Deep atmospheric gradient overlay
      const gradient = ctx.createRadialGradient(
        width * 0.5, height * 0.3, 50,
        width * 0.5, height * 0.5, width * 0.8
      );
      gradient.addColorStop(0, 'rgba(7, 42, 30, 0.4)');
      gradient.addColorStop(0.5, 'rgba(4, 28, 20, 0.7)');
      gradient.addColorStop(1, 'rgba(8, 12, 20, 0.95)');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);

      // Draw and connect particles
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.alpha;
        ctx.shadowBlur = 8;
        ctx.shadowColor = p.color;
        ctx.fill();

        // Connect nearby particles with subtle golden/emerald filaments
        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dist = Math.hypot(p.x - p2.x, p.y - p2.y);
          if (dist < 110) {
            ctx.beginPath();
            ctx.strokeStyle = '#d4af37';
            ctx.globalAlpha = (1 - dist / 110) * 0.12;
            ctx.lineWidth = 0.6;
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
          }
        }
      }

      ctx.globalAlpha = 1.0;
      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <section style={{
      position: 'relative',
      minHeight: '640px',
      overflow: 'hidden',
      background: 'linear-gradient(135deg, #031710 0%, #06281c 45%, #080c14 100%)',
      display: 'flex',
      alignItems: 'center',
      borderBottom: '1px solid rgba(212, 175, 55, 0.2)'
    }}>
      {/* Background Interactive Canvas */}
      <canvas
        ref={canvasRef}
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
          zIndex: 1
        }}
      />

      {/* Ambient glowing radial orbs */}
      <div style={{
        position: 'absolute',
        top: '-10%',
        left: '20%',
        width: '500px',
        height: '500px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(212, 175, 55, 0.12) 0%, transparent 70%)',
        filter: 'blur(60px)',
        pointerEvents: 'none',
        zIndex: 2,
        animation: 'sphereFloat 8s infinite ease-in-out'
      }} />

      <div style={{
        position: 'absolute',
        bottom: '-15%',
        right: '15%',
        width: '550px',
        height: '550px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(17, 75, 58, 0.35) 0%, transparent 70%)',
        filter: 'blur(70px)',
        pointerEvents: 'none',
        zIndex: 2,
        animation: 'sphereFloat 10s infinite ease-in-out reverse'
      }} />

      {/* Main Content Container */}
      <div className="container" style={{ position: 'relative', zIndex: 10, padding: '72px 24px' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1.2fr 0.9fr',
          gap: '48px',
          alignItems: 'center'
        }}>
          {/* Left Column: Brand & Editorial Pitch */}
          <div>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '6px 16px',
              borderRadius: '999px',
              background: 'rgba(212, 175, 55, 0.12)',
              border: '1px solid rgba(212, 175, 55, 0.35)',
              marginBottom: '20px'
            }}>
              <Sparkles size={14} color="#fef08a" />
              <span style={{
                fontSize: '12px',
                fontWeight: 700,
                color: '#fef08a',
                letterSpacing: '1.5px',
                textTransform: 'uppercase'
              }}>
                SHOPSPHERE • Discover More. Experience Better.
              </span>
            </div>

            <h1 style={{
              fontSize: '52px',
              fontWeight: 900,
              color: '#ffffff',
              lineHeight: 1.1,
              letterSpacing: '-1px',
              marginBottom: '20px'
            }}>
              Shopping, <span className="gold-gradient-text">Reimagined.</span>
            </h1>

            <p style={{
              fontSize: '18px',
              lineHeight: 1.6,
              color: '#cbd5e1',
              maxWidth: '560px',
              marginBottom: '36px'
            }}>
              Explore a world of extraordinary products, exclusive discoveries, and smarter shopping. Engineered with mathematical concurrency safety for zero overselling.
            </p>

            {/* CTAs */}
            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', marginBottom: '40px' }}>
              <Link to="/products" className="btn btn-shimmer-gold btn-lg">
                <span>EXPLORE COLLECTION</span>
                <ArrowRight size={18} />
              </Link>
              <a
                href="#campaign-offers"
                className="btn btn-outline btn-lg"
                style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  borderColor: 'rgba(212, 175, 55, 0.4)',
                  color: '#ffffff',
                  backdropFilter: 'blur(10px)'
                }}
              >
                <Compass size={18} color="#fef08a" />
                <span>DISCOVER OFFERS</span>
              </a>
            </div>

            {/* Value Highlights */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '16px',
              paddingTop: '24px',
              borderTop: '1px solid rgba(255, 255, 255, 0.1)'
            }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#fef08a', fontWeight: 800, fontSize: '18px' }}>
                  <span>100%</span>
                  <ShieldCheck size={16} color="#34d399" />
                </div>
                <div style={{ fontSize: '12px', color: '#94a3b8' }}>Zero Oversell Stock</div>
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#fef08a', fontWeight: 800, fontSize: '18px' }}>
                  <span>256-Bit</span>
                  <Zap size={16} color="#38bdf8" />
                </div>
                <div style={{ fontSize: '12px', color: '#94a3b8' }}>Encrypted Checkout</div>
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#fef08a', fontWeight: 800, fontSize: '18px' }}>
                  <span>4.9 ★</span>
                  <Star size={16} color="#f59e0b" fill="#f59e0b" />
                </div>
                <div style={{ fontSize: '12px', color: '#94a3b8' }}>Customer Rating</div>
              </div>
            </div>
          </div>

          {/* Right Column: 3D Floating Showcase */}
          <div style={{ position: 'relative' }}>
            {/* Main Featured Showcase Card */}
            <div
              className="glass-panel-dark"
              style={{
                borderRadius: '24px',
                padding: '24px',
                position: 'relative',
                zIndex: 4,
                animation: 'sphereFloat 6s infinite ease-in-out'
              }}
            >
              <div style={{ position: 'relative', overflow: 'hidden', borderRadius: '16px', height: '260px', marginBottom: '18px' }}>
                <img
                  src="https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800&auto=format&fit=crop&q=80"
                  alt="Sony Alpha 7 IV"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
                <div style={{
                  position: 'absolute',
                  top: '12px',
                  left: '12px',
                  background: 'linear-gradient(135deg, #d4af37, #92400e)',
                  color: '#ffffff',
                  fontSize: '11px',
                  fontWeight: 800,
                  padding: '4px 10px',
                  borderRadius: '999px',
                  textTransform: 'uppercase',
                  letterSpacing: '1px'
                }}>
                  Flagship Arrival
                </div>
                <div style={{
                  position: 'absolute',
                  bottom: '12px',
                  right: '12px',
                  background: 'rgba(4, 28, 20, 0.85)',
                  backdropFilter: 'blur(8px)',
                  color: '#34d399',
                  border: '1px solid #059669',
                  fontSize: '12px',
                  fontWeight: 700,
                  padding: '4px 10px',
                  borderRadius: '8px'
                }}>
                  ● In Stock (Verified)
                </div>
              </div>

              <div>
                <span style={{ fontSize: '12px', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 700 }}>
                  Pro Photography & Drones
                </span>
                <h3 style={{ fontSize: '20px', fontWeight: 800, color: '#ffffff', margin: '4px 0 12px 0' }}>
                  Sony Alpha 7 IV Full-Frame Camera
                </h3>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <span style={{ fontSize: '24px', fontWeight: 900, color: '#fef08a' }}>₹2,42,490</span>
                    <span style={{ fontSize: '14px', color: '#64748b', textDecoration: 'line-through', marginLeft: '8px' }}>₹2,69,990</span>
                  </div>
                  <Link
                    to="/products"
                    className="btn btn-shimmer-gold btn-sm"
                    style={{ padding: '8px 16px', borderRadius: '8px' }}
                  >
                    View Device
                  </Link>
                </div>
              </div>
            </div>

            {/* Floating Satellite Card 1: DJI Drone */}
            <div
              className="glass-panel-dark"
              style={{
                position: 'absolute',
                top: '-24px',
                right: '-20px',
                padding: '12px 18px',
                borderRadius: '16px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                zIndex: 5,
                animation: 'sphereFloat 5s infinite ease-in-out reverse'
              }}
            >
              <div style={{
                width: '42px',
                height: '42px',
                borderRadius: '10px',
                background: 'linear-gradient(135deg, #114b3a, #041c14)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Sparkles size={20} color="#fef08a" />
              </div>
              <div>
                <div style={{ fontSize: '11px', color: '#34d399', fontWeight: 700 }}>NEW RELEASE</div>
                <div style={{ fontSize: '13px', color: '#ffffff', fontWeight: 700 }}>DJI Mavic 3 Pro Cine</div>
              </div>
            </div>

            {/* Floating Satellite Card 2: Coupon Voucher */}
            <div
              className="glass-panel-dark"
              style={{
                position: 'absolute',
                bottom: '-28px',
                left: '-24px',
                padding: '14px 20px',
                borderRadius: '16px',
                display: 'flex',
                alignItems: 'center',
                gap: '14px',
                zIndex: 5,
                animation: 'sphereFloat 7s infinite ease-in-out'
              }}
            >
              <div style={{
                padding: '8px 12px',
                borderRadius: '8px',
                background: 'rgba(212, 175, 55, 0.15)',
                border: '1px dashed #d4af37',
                color: '#fef08a',
                fontSize: '12px',
                fontWeight: 800
              }}>
                WELCOME10
              </div>
              <div>
                <div style={{ fontSize: '13px', color: '#ffffff', fontWeight: 700 }}>Special Launch Privilege</div>
                <div style={{ fontSize: '11px', color: '#94a3b8' }}>10% Instant Savings on First Order</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
