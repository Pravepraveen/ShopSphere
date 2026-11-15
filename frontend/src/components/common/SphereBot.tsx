import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  X, Send, Sparkles, ShoppingBag, ArrowRight,
  Search, ShieldCheck, Tag, ExternalLink, Minimize2,
  Check, RefreshCw, Truck, HelpCircle, ChevronRight
} from 'lucide-react';
import { productApi } from '../../api/productApi';
import { orderApi } from '../../api/orderApi';
import { Product, Order } from '../../types';
import { useCart } from '../../context/CartContext';
import { useToast } from './Toast';
import { formatINR } from '../../utils/currency';

interface ChatMessage {
  id: string;
  sender: 'bot' | 'user';
  text: string;
  products?: Product[];
  orderInfo?: Order;
  actionLinks?: { label: string; action: () => void }[];
  timestamp: string;
}

export const SphereBot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [showSpeechBubble, setShowSpeechBubble] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [catalog, setCatalog] = useState<Product[]>([]);
  const navigate = useNavigate();
  const { addToCart, openDrawer } = useCart();
  const { showSuccess, showError } = useToast();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initial welcome message
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'bot',
      text: 'Greetings! I am SPHERE BOT, your intelligent shopping concierge. How may I assist your experience today?',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  // Load catalog in background for instant semantic search
  useEffect(() => {
    productApi.getProducts({ size: 100 })
      .then((res) => setCatalog(res.content))
      .catch(() => {});
  }, []);

  // Entrance sequence: robot appears, waves, and shows speech bubble after 1.5s
  useEffect(() => {
    const bubbleTimer = setTimeout(() => {
      if (!hasInteracted && !isOpen) {
        setShowSpeechBubble(true);
      }
    }, 1500);

    // Auto-collapse speech bubble after 9s so it doesn't obstruct the user
    const collapseTimer = setTimeout(() => {
      setShowSpeechBubble(false);
    }, 10500);

    return () => {
      clearTimeout(bubbleTimer);
      clearTimeout(collapseTimer);
    };
  }, [hasInteracted, isOpen]);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const handleOpenBot = () => {
    setIsOpen(true);
    setIsMinimized(false);
    setShowSpeechBubble(false);
    setHasInteracted(true);
  };

  const handleSendMessage = (textToSend?: string) => {
    const query = (textToSend || input).trim();
    if (!query) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInput('');
    setIsTyping(true);

    setTimeout(() => {
      const lower = query.toLowerCase();
      let botResponse = '';
      let matchedProducts: Product[] = [];
      let links: { label: string; action: () => void }[] = [];

      // 1. Order Tracking / Fulfillment
      if (lower.includes('track') || lower.includes('order') || lower.includes('where is my')) {
        const orderIdMatch = query.match(/\b\d+\b/);
        if (orderIdMatch) {
          const orderId = parseInt(orderIdMatch[0], 10);
          botResponse = `Checking live fulfillment records for Order #${orderId}...`;
          orderApi.getOrderById(orderId)
            .then((order: Order) => {
              setMessages((prev) => [
                ...prev,
                {
                  id: Date.now().toString(),
                  sender: 'bot',
                  text: `Order #${order.id} is currently [${order.status}]. Total: ${formatINR(order.totalAmount)}. Carrier: ${order.carrier || 'Pending Dispatch'}.`,
                  actionLinks: [
                    { label: `📦 View Order #${order.id} Tracking`, action: () => { setIsOpen(false); navigate(`/orders/${order.id}`); } }
                  ],
                  timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                }
              ]);
            })
            .catch(() => {
              setMessages((prev) => [
                ...prev,
                {
                  id: Date.now().toString(),
                  sender: 'bot',
                  text: `I couldn't locate Order #${orderId}. Please check your order history under My Orders.`,
                  actionLinks: [
                    { label: '📦 Go to My Orders', action: () => { setIsOpen(false); navigate('/orders'); } }
                  ],
                  timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                }
              ]);
            });
          setIsTyping(false);
          return;
        } else {
          botResponse = 'You can track all your orders in real-time with our 5-stage fulfillment stepper (Placed ➔ Paid ➔ Packed ➔ Shipped ➔ Delivered) under My Orders!';
          links = [
            { label: '📦 Open My Orders', action: () => { setIsOpen(false); navigate('/orders'); } }
          ];
        }
      }
      // 2. Coupon & Discounts
      else if (lower.includes('coupon') || lower.includes('discount') || lower.includes('promo') || lower.includes('code') || lower.includes('voucher') || lower.includes('offer')) {
        botResponse = 'Here are our verified active promotional codes:\n• WELCOME10: 10% OFF orders over ₹500\n• FLAT50: Flat ₹500 OFF orders over ₹2,000\n• FLASH1: 50% Special savings voucher';
        links = [
          { label: '🛍️ Open Shopping Bag', action: () => { setIsOpen(false); openDrawer(); } }
        ];
      }
      // 3. Cart / Checkout
      else if (lower.includes('cart') || lower.includes('bag') || lower.includes('checkout') || lower.includes('pay')) {
        botResponse = 'You can view your reserved items, apply discount coupons, and proceed to our 256-bit encrypted checkout in your cart drawer.';
        links = [
          { label: '🛒 Open Cart Drawer', action: () => { setIsOpen(false); openDrawer(); } },
          { label: '💳 Proceed to Checkout', action: () => { setIsOpen(false); navigate('/checkout'); } }
        ];
      }
      // 4. Categories & Departments
      else if (lower.includes('category') || lower.includes('audio') || lower.includes('drone') || lower.includes('camera') || lower.includes('phone') || lower.includes('laptop')) {
        botResponse = 'We specialize in luxury certified technology. Which department would you like to explore?';
        links = [
          { label: '🎧 Audio & Sound', action: () => { setIsOpen(false); navigate('/products?query=audio'); } },
          { label: '📷 Photography & Drones', action: () => { setIsOpen(false); navigate('/products?query=drone'); } },
          { label: '💻 Smart Computing', action: () => { setIsOpen(false); navigate('/products?query=pro'); } }
        ];
      }
      // 5. Concurrency / Math Security Guarantee
      else if (lower.includes('safe') || lower.includes('security') || lower.includes('oversell') || lower.includes('race') || lower.includes('guarantee')) {
        botResponse = 'ShopSphere employs strict atomic database invariants: row-level conditional updates (`stock >= quantity`), deterministic sorting to prevent deadlocks, and compensating transactions for complete financial and stock integrity.';
      }
      // 6. Product Search
      else {
        const terms = lower.split(' ').filter((t) => t.length > 2);
        matchedProducts = catalog.filter((p) => {
          const titleLower = p.title.toLowerCase();
          const descLower = (p.description || '').toLowerCase();
          const skuLower = p.sku.toLowerCase();
          return terms.some((t) => titleLower.includes(t) || descLower.includes(t) || skuLower.includes(t));
        }).slice(0, 3);

        if (matchedProducts.length > 0) {
          botResponse = `I found ${matchedProducts.length} verified item(s) matching "${query}". You can review live stock and add directly to your bag:`;
        } else {
          matchedProducts = catalog.slice(0, 2);
          botResponse = `I couldn't locate an exact match for "${query}". Here are some of our most celebrated flagship arrivals:`;
          links = [
            { label: '🔍 Browse Entire Catalog', action: () => { setIsOpen(false); navigate('/products'); } }
          ];
        }
      }

      const botMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'bot',
        text: botResponse,
        products: matchedProducts.length > 0 ? matchedProducts : undefined,
        actionLinks: links.length > 0 ? links : undefined,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, botMsg]);
      setIsTyping(false);
    }, 600);
  };

  const handleQuickAdd = async (product: Product) => {
    try {
      await addToCart(product.id, 1, false);
      showSuccess(`Added "${product.title}" to cart!`);
    } catch (err: any) {
      showError(err.message || 'Failed to add item');
    }
  };

  return (
    <>
      {/* Floating 3D Robot Assistant Trigger & Welcoming Bubble */}
      <div style={{
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        zIndex: 999,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-end',
        pointerEvents: 'none'
      }}>
        {/* Welcoming Speech Bubble */}
        {showSpeechBubble && !isOpen && (
          <div
            className="glass-panel-dark"
            style={{
              pointerEvents: 'auto',
              borderRadius: '16px',
              padding: '14px 18px',
              maxWidth: '300px',
              marginBottom: '12px',
              color: '#ffffff',
              boxShadow: '0 12px 30px rgba(0, 0, 0, 0.4)',
              animation: 'slideInDown 0.3s ease',
              position: 'relative'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#34d399', display: 'inline-block' }} />
                <strong style={{ fontSize: '12px', color: '#fef08a' }}>SPHERE BOT</strong>
              </div>
              <button
                onClick={() => setShowSpeechBubble(false)}
                style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '2px' }}
              >
                <X size={14} />
              </button>
            </div>
            <p style={{ fontSize: '13px', lineHeight: 1.4, margin: '0 0 10px 0' }}>
              Hello! Welcome to ShopSphere. Looking for something extraordinary?
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              <button
                onClick={() => { handleOpenBot(); handleSendMessage('Show me active coupons'); }}
                style={{
                  padding: '4px 10px',
                  borderRadius: '999px',
                  background: 'rgba(212, 175, 55, 0.15)',
                  border: '1px solid rgba(212, 175, 55, 0.3)',
                  color: '#fef08a',
                  fontSize: '11px',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                🎟️ Coupons
              </button>
              <button
                onClick={() => { handleOpenBot(); handleSendMessage('Find headphones'); }}
                style={{
                  padding: '4px 10px',
                  borderRadius: '999px',
                  background: 'rgba(56, 189, 248, 0.15)',
                  border: '1px solid rgba(56, 189, 248, 0.3)',
                  color: '#38bdf8',
                  fontSize: '11px',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                🎧 Headphones
              </button>
              <button
                onClick={() => { handleOpenBot(); handleSendMessage('Where is my order?'); }}
                style={{
                  padding: '4px 10px',
                  borderRadius: '999px',
                  background: 'rgba(52, 211, 153, 0.15)',
                  border: '1px solid rgba(52, 211, 153, 0.3)',
                  color: '#34d399',
                  fontSize: '11px',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                📦 Track Order
              </button>
            </div>
          </div>
        )}

        {/* The 3D Futuristic Robot Body Trigger */}
        {!isOpen && (
          <button
            onClick={handleOpenBot}
            style={{
              pointerEvents: 'auto',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: 0,
              outline: 'none',
              position: 'relative'
            }}
            title="Chat with SphereBot Assistant"
            aria-label="Open SphereBot shopping assistant"
          >
            {/* Ambient halo glow */}
            <div style={{
              position: 'absolute',
              inset: '-6px',
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(212, 175, 55, 0.4) 0%, rgba(17, 75, 58, 0.2) 60%, transparent 80%)',
              filter: 'blur(10px)',
              animation: 'livePulse 3s infinite'
            }} />

            {/* Futuristic 3D SVG Robot Character */}
            <div style={{
              width: '74px',
              height: '74px',
              position: 'relative',
              animation: 'sphereFloat 4s infinite ease-in-out'
            }}>
              <svg width="74" height="74" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                {/* Defs for rich gradients & glows */}
                <defs>
                  <linearGradient id="robotBodyGrad" x1="10" y1="20" x2="90" y2="90" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stopColor="#114b3a" />
                    <stop offset="50%" stopColor="#072a1e" />
                    <stop offset="100%" stopColor="#041c14" />
                  </linearGradient>
                  <linearGradient id="goldTrimGrad" x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stopColor="#fef08a" />
                    <stop offset="50%" stopColor="#d4af37" />
                    <stop offset="100%" stopColor="#aa820a" />
                  </linearGradient>
                  <linearGradient id="visorGrad" x1="20" y1="35" x2="80" y2="65" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stopColor="#080c14" />
                    <stop offset="100%" stopColor="#0f172a" />
                  </linearGradient>
                  <filter id="eyeGlow" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur stdDeviation="2" result="blur" />
                    <feComposite in="SourceGraphic" in2="blur" operator="over" />
                  </filter>
                </defs>

                {/* Floating Shadow */}
                <ellipse cx="50" cy="94" rx="26" ry="5" fill="rgba(0, 0, 0, 0.35)" />

                {/* Robot Floating Propulsion Ring */}
                <ellipse cx="50" cy="82" rx="20" ry="7" fill="url(#goldTrimGrad)" opacity="0.9" />
                <ellipse cx="50" cy="85" rx="14" ry="4" fill="#38bdf8" filter="url(#eyeGlow)" opacity="0.8" />

                {/* Main Orb Body */}
                <rect x="18" y="22" width="64" height="58" rx="29" fill="url(#robotBodyGrad)" stroke="url(#goldTrimGrad)" strokeWidth="2.5" />

                {/* Gold Chest Shield Emblem */}
                <path d="M46 72 L54 72 L50 78 Z" fill="#d4af37" />

                {/* Visor Area */}
                <rect x="26" y="34" width="48" height="26" rx="13" fill="url(#visorGrad)" stroke="rgba(212, 175, 55, 0.4)" strokeWidth="1.5" />

                {/* Animated Glowing Expressive Eyes (Micro-blinking) */}
                <g style={{ transformOrigin: '50% 47px', animation: 'robotBlink 4s infinite' }}>
                  {/* Left Eye */}
                  <ellipse cx="39" cy="47" rx="5.5" ry="5.5" fill="#38bdf8" filter="url(#eyeGlow)" />
                  <ellipse cx="38" cy="45.5" rx="2" ry="2" fill="#ffffff" />

                  {/* Right Eye */}
                  <ellipse cx="61" cy="47" rx="5.5" ry="5.5" fill="#38bdf8" filter="url(#eyeGlow)" />
                  <ellipse cx="60" cy="45.5" rx="2" ry="2" fill="#ffffff" />
                </g>

                {/* Antenna Rod */}
                <line x1="50" y1="22" x2="50" y2="10" stroke="url(#goldTrimGrad)" strokeWidth="3" strokeLinecap="round" />
                {/* Antenna Pulsing Beacon */}
                <circle cx="50" cy="9" r="4.5" fill="#fef08a" filter="url(#eyeGlow)" />

                {/* Articulated Waving Right Arm */}
                <g style={{ transformOrigin: '82px 50px', animation: 'waveArm 3s infinite ease-in-out' }}>
                  <rect x="80" y="44" width="8" height="14" rx="4" fill="url(#goldTrimGrad)" />
                  <circle cx="84" cy="40" r="5" fill="#114b3a" stroke="#d4af37" strokeWidth="1.5" />
                  <path d="M81 37 Q84 32 87 37" stroke="#fef08a" strokeWidth="1.5" strokeLinecap="round" />
                </g>

                {/* Left Stabilizer Wing */}
                <rect x="12" y="46" width="8" height="12" rx="4" fill="url(#goldTrimGrad)" />
              </svg>
            </div>
          </button>
        )}
      </div>

      {/* Expandable Assistant Modal Panel */}
      {isOpen && (
        <div style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          width: '390px',
          height: isMinimized ? '60px' : '620px',
          maxHeight: 'calc(100vh - 48px)',
          background: 'rgba(5, 23, 17, 0.96)',
          backdropFilter: 'blur(24px)',
          border: '1px solid rgba(212, 175, 55, 0.3)',
          borderRadius: '20px',
          boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.7), 0 0 35px -10px rgba(212, 175, 55, 0.3)',
          zIndex: 1050,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          transition: 'height 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
        }}>
          {/* Header */}
          <div style={{
            padding: '14px 18px',
            background: 'linear-gradient(135deg, #072a1e 0%, #041c14 100%)',
            borderBottom: '1px solid rgba(212, 175, 55, 0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexShrink: 0
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #114b3a, #d4af37)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 0 10px rgba(212, 175, 55, 0.4)'
              }}>
                <Sparkles size={16} color="#ffffff" />
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <h4 style={{ fontSize: '15px', fontWeight: 800, color: '#ffffff', margin: 0 }}>SPHERE BOT</h4>
                  <span style={{ fontSize: '10px', background: 'rgba(52, 211, 153, 0.2)', color: '#34d399', padding: '1px 6px', borderRadius: '999px', fontWeight: 700 }}>
                    AI Concierge
                  </span>
                </div>
                <div style={{ fontSize: '11px', color: '#94a3b8' }}>Mathematical Stock & Order Assistance</div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <button
                onClick={() => setIsMinimized(!isMinimized)}
                style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '4px' }}
                title={isMinimized ? 'Expand' : 'Minimize'}
              >
                <Minimize2 size={16} />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '4px' }}
                title="Close"
              >
                <X size={16} />
              </button>
            </div>
          </div>

          {!isMinimized && (
            <>
              {/* Quick Suggestion Chips Bar */}
              <div style={{
                padding: '10px 14px',
                background: 'rgba(255, 255, 255, 0.02)',
                borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
                display: 'flex',
                gap: '6px',
                overflowX: 'auto',
                flexShrink: 0
              }}>
                <button
                  onClick={() => handleSendMessage('Find headphones under ₹25,000')}
                  style={{
                    padding: '5px 10px',
                    borderRadius: '8px',
                    background: 'rgba(212, 175, 55, 0.1)',
                    border: '1px solid rgba(212, 175, 55, 0.25)',
                    color: '#fef08a',
                    fontSize: '11px',
                    whiteSpace: 'nowrap',
                    cursor: 'pointer'
                  }}
                >
                  🎧 Headphones
                </button>
                <button
                  onClick={() => handleSendMessage('What coupons are available?')}
                  style={{
                    padding: '5px 10px',
                    borderRadius: '8px',
                    background: 'rgba(56, 189, 248, 0.1)',
                    border: '1px solid rgba(56, 189, 248, 0.25)',
                    color: '#38bdf8',
                    fontSize: '11px',
                    whiteSpace: 'nowrap',
                    cursor: 'pointer'
                  }}
                >
                  🎟️ Coupons
                </button>
                <button
                  onClick={() => handleSendMessage('Where is my order?')}
                  style={{
                    padding: '5px 10px',
                    borderRadius: '8px',
                    background: 'rgba(52, 211, 153, 0.1)',
                    border: '1px solid rgba(52, 211, 153, 0.25)',
                    color: '#34d399',
                    fontSize: '11px',
                    whiteSpace: 'nowrap',
                    cursor: 'pointer'
                  }}
                >
                  📦 Track Order
                </button>
                <button
                  onClick={() => handleSendMessage('Explain stock concurrency safety')}
                  style={{
                    padding: '5px 10px',
                    borderRadius: '8px',
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    color: '#ffffff',
                    fontSize: '11px',
                    whiteSpace: 'nowrap',
                    cursor: 'pointer'
                  }}
                >
                  🛡️ Concurrency
                </button>
              </div>

              {/* Chat Message Scroll Window */}
              <div style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {messages.map((m) => (
                  <div
                    key={m.id}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: m.sender === 'user' ? 'flex-end' : 'flex-start'
                    }}
                  >
                    <div style={{
                      maxWidth: '85%',
                      padding: '10px 14px',
                      borderRadius: m.sender === 'user' ? '14px 14px 2px 14px' : '14px 14px 14px 2px',
                      background: m.sender === 'user'
                        ? 'linear-gradient(135deg, #114b3a, #072a1e)'
                        : 'rgba(255, 255, 255, 0.05)',
                      border: m.sender === 'user'
                        ? '1px solid rgba(212, 175, 55, 0.3)'
                        : '1px solid rgba(255, 255, 255, 0.1)',
                      color: '#ffffff',
                      fontSize: '13px',
                      lineHeight: 1.45,
                      whiteSpace: 'pre-line'
                    }}>
                      {m.text}

                      {/* Product Recommendations within Chat */}
                      {m.products && m.products.length > 0 && (
                        <div style={{ marginTop: '10px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          {m.products.map((p) => (
                            <div
                              key={p.id}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '10px',
                                background: 'rgba(0, 0, 0, 0.35)',
                                padding: '8px',
                                borderRadius: '10px',
                                border: '1px solid rgba(255, 255, 255, 0.1)'
                              }}
                            >
                              <img
                                src={p.imageUrl || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80'}
                                alt={p.title}
                                style={{ width: '42px', height: '42px', borderRadius: '6px', objectFit: 'cover' }}
                              />
                              <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ fontSize: '12px', fontWeight: 700, color: '#ffffff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                  {p.title}
                                </div>
                                <div style={{ fontSize: '11px', color: '#fef08a', fontWeight: 800 }}>
                                  {formatINR(p.price)} • {p.stock > 0 ? `${p.stock} left` : 'Sold out'}
                                </div>
                              </div>
                              <button
                                onClick={() => handleQuickAdd(p)}
                                disabled={p.stock <= 0}
                                style={{
                                  padding: '5px 10px',
                                  borderRadius: '6px',
                                  background: p.stock > 0 ? '#114b3a' : '#334155',
                                  border: '1px solid rgba(212, 175, 55, 0.4)',
                                  color: '#ffffff',
                                  fontSize: '11px',
                                  fontWeight: 700,
                                  cursor: p.stock > 0 ? 'pointer' : 'not-allowed'
                                }}
                              >
                                + Add
                              </button>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Action Links Buttons */}
                      {m.actionLinks && m.actionLinks.length > 0 && (
                        <div style={{ marginTop: '10px', display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                          {m.actionLinks.map((link, idx) => (
                            <button
                              key={idx}
                              onClick={link.action}
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px',
                                padding: '5px 10px',
                                borderRadius: '6px',
                                background: 'rgba(212, 175, 55, 0.15)',
                                border: '1px solid rgba(212, 175, 55, 0.35)',
                                color: '#fef08a',
                                fontSize: '11px',
                                fontWeight: 600,
                                cursor: 'pointer'
                              }}
                            >
                              <span>{link.label}</span>
                              <ChevronRight size={12} />
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                    <span style={{ fontSize: '10px', color: '#64748b', marginTop: '4px' }}>{m.timestamp}</span>
                  </div>
                ))}

                {isTyping && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#94a3b8', fontSize: '12px' }}>
                    <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#38bdf8', animation: 'livePulse 1s infinite' }} />
                    <span>SPHERE BOT is searching verified catalog...</span>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Chat Input Bar */}
              <div style={{
                padding: '12px 16px',
                background: 'rgba(4, 28, 20, 0.98)',
                borderTop: '1px solid rgba(212, 175, 55, 0.2)'
              }}>
                <form
                  onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }}
                  style={{ display: 'flex', gap: '8px' }}
                >
                  <input
                    type="text"
                    placeholder="Ask SphereBot anything..."
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
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
                  />
                  <button
                    type="submit"
                    disabled={!input.trim()}
                    style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '10px',
                      background: 'linear-gradient(135deg, #114b3a, #d4af37)',
                      border: 'none',
                      color: '#ffffff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: input.trim() ? 'pointer' : 'not-allowed',
                      opacity: input.trim() ? 1 : 0.4
                    }}
                  >
                    <Send size={16} />
                  </button>
                </form>
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
};
