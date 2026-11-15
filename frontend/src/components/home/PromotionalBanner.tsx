import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Sparkles, Tag, ArrowRight, Clock, ShieldCheck } from 'lucide-react';

interface PromoCampaign {
  id: string;
  badge: string;
  title: string;
  subtitle: string;
  discountHighlight: string;
  code?: string;
  ctaText: string;
  ctaLink: string;
  bgGradient: string;
  accentColor: string;
  imageUrl: string;
}

const CAMPAIGNS: PromoCampaign[] = [
  {
    id: 'mega-festival',
    badge: 'ANNUAL FLAGSHIP EVENT',
    title: 'MEGA SHOPPING FESTIVAL',
    subtitle: 'Unrivalled discounts on cutting-edge audio, drones, computing, and smart living.',
    discountHighlight: 'UP TO 40% OFF',
    code: 'WELCOME10',
    ctaText: 'Shop Festival Deals',
    ctaLink: '/products',
    bgGradient: 'linear-gradient(135deg, #041c14 0%, #0d3829 50%, #080c14 100%)',
    accentColor: '#d4af37',
    imageUrl: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=800&auto=format&fit=crop&q=80',
  },
  {
    id: 'weekend-deals',
    badge: '48-HOUR FLASH ACCESS',
    title: 'EXCLUSIVE WEEKEND DEALS',
    subtitle: 'Free Priority Insured Air Delivery on all technology orders above ₹2,000.',
    discountHighlight: 'FLAT ₹500 OFF',
    code: 'FLAT50',
    ctaText: 'Claim Weekend Voucher',
    ctaLink: '/products',
    bgGradient: 'linear-gradient(135deg, #091326 0%, #172554 50%, #080c14 100%)',
    accentColor: '#38bdf8',
    imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80',
  },
  {
    id: 'new-arrivals',
    badge: 'CERTIFIED LUXURY RELEASE',
    title: 'NEW ARRIVALS HAVE LANDED',
    subtitle: 'Introducing DJI Mavic 3 Pro Cine, Sony Alpha 7 IV, and Apple M4 Flagship Devices.',
    discountHighlight: 'SPECIAL PRIVILEGE',
    code: 'FLASH1',
    ctaText: 'Explore New Arrivals',
    ctaLink: '/products?sortBy=id&sortDirection=DESC',
    bgGradient: 'linear-gradient(135deg, #1c1917 0%, #292524 50%, #041c14 100%)',
    accentColor: '#34d399',
    imageUrl: 'https://images.unsplash.com/photo-1527977966376-1c8408f9f108?w=800&auto=format&fit=crop&q=80',
  },
];

export const PromotionalBanner: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // Auto-rotate every 5.5 seconds unless hovered
  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % CAMPAIGNS.length);
    }, 5500);
    return () => clearInterval(timer);
  }, [isPaused]);

  const current = CAMPAIGNS[currentIndex];

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + CAMPAIGNS.length) % CAMPAIGNS.length);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % CAMPAIGNS.length);
  };

  return (
    <section
      id="campaign-offers"
      style={{
        margin: '40px auto 64px auto',
        maxWidth: '1280px',
        padding: '0 24px',
        position: 'relative'
      }}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div
        style={{
          borderRadius: '24px',
          background: current.bgGradient,
          border: '1px solid rgba(212, 175, 55, 0.25)',
          boxShadow: '0 20px 40px -15px rgba(0, 0, 0, 0.4)',
          overflow: 'hidden',
          position: 'relative',
          transition: 'background 0.6s ease'
        }}
      >
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1.2fr 0.8fr',
          gap: '32px',
          alignItems: 'center',
          padding: '48px',
          minHeight: '340px'
        }}>
          {/* Offer Details */}
          <div style={{ zIndex: 2 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
              <span style={{
                background: 'rgba(255, 255, 255, 0.1)',
                border: `1px solid ${current.accentColor}`,
                color: current.accentColor,
                fontSize: '11px',
                fontWeight: 800,
                padding: '4px 12px',
                borderRadius: '999px',
                letterSpacing: '1px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px'
              }}>
                <Sparkles size={12} />
                {current.badge}
              </span>
              <span style={{
                color: '#94a3b8',
                fontSize: '12px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px'
              }}>
                <Clock size={13} />
                Live Campaign
              </span>
            </div>

            <h2 style={{
              fontSize: '36px',
              fontWeight: 900,
              color: '#ffffff',
              lineHeight: 1.15,
              marginBottom: '10px'
            }}>
              {current.title}
            </h2>

            <div style={{
              fontSize: '22px',
              fontWeight: 800,
              color: current.accentColor,
              marginBottom: '12px'
            }}>
              {current.discountHighlight}
            </div>

            <p style={{
              fontSize: '15px',
              color: '#cbd5e1',
              maxWidth: '520px',
              lineHeight: 1.5,
              marginBottom: '24px'
            }}>
              {current.subtitle}
            </p>

            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
              <Link
                to={current.ctaLink}
                className="btn btn-shimmer-gold"
                style={{ padding: '12px 26px', fontSize: '14px' }}
              >
                <span>{current.ctaText}</span>
                <ArrowRight size={16} />
              </Link>

              {current.code && (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  background: 'rgba(0, 0, 0, 0.4)',
                  padding: '8px 14px',
                  borderRadius: '10px',
                  border: '1px dashed rgba(255, 255, 255, 0.25)',
                  color: '#ffffff',
                  fontSize: '13px'
                }}>
                  <Tag size={14} color={current.accentColor} />
                  <span>Use Code:</span>
                  <strong style={{ color: current.accentColor, letterSpacing: '1px' }}>{current.code}</strong>
                </div>
              )}
            </div>
          </div>

          {/* Promotional Visual */}
          <div style={{ position: 'relative', height: '240px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{
              width: '280px',
              height: '240px',
              borderRadius: '20px',
              overflow: 'hidden',
              boxShadow: '0 20px 30px rgba(0, 0, 0, 0.5)',
              border: '2px solid rgba(255, 255, 255, 0.15)',
              transform: 'perspective(1000px) rotateY(-8deg) rotateX(4deg)',
              transition: 'transform 0.4s ease'
            }}>
              <img
                src={current.imageUrl}
                alt={current.title}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>
          </div>
        </div>

        {/* Carousel Navigation Arrows & Indicators */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '12px 24px',
          background: 'rgba(0, 0, 0, 0.4)',
          borderTop: '1px solid rgba(255, 255, 255, 0.08)'
        }}>
          {/* Slide dots */}
          <div style={{ display: 'flex', gap: '8px' }}>
            {CAMPAIGNS.map((c, i) => (
              <button
                key={c.id}
                onClick={() => setCurrentIndex(i)}
                style={{
                  width: i === currentIndex ? '28px' : '8px',
                  height: '8px',
                  borderRadius: '4px',
                  background: i === currentIndex ? '#d4af37' : 'rgba(255, 255, 255, 0.2)',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
                aria-label={`Go to slide ${i + 1}`}
              />
            ))}
          </div>

          {/* Manual Arrows */}
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={handlePrev}
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                background: 'rgba(255, 255, 255, 0.1)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer'
              }}
              title="Previous campaign"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              onClick={handleNext}
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                background: 'rgba(255, 255, 255, 0.1)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer'
              }}
              title="Next campaign"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
