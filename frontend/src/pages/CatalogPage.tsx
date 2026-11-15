import React, { useEffect, useState, useCallback } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  Filter, ShoppingCart, Search, RefreshCw, ChevronLeft, ChevronRight,
  Star, Heart, Sparkles, CheckCircle2, ShieldCheck, Tag
} from 'lucide-react';
import { productApi, ProductFilterParams } from '../api/productApi';
import { Category, Product, PageResponse } from '../types';
import { useCart } from '../context/CartContext';
import { useToast } from '../components/common/Toast';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { formatINR } from '../utils/currency';

export const CatalogPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [categories, setCategories] = useState<Category[]>([]);
  const [pageData, setPageData] = useState<PageResponse<Product> | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [wishlist, setWishlist] = useState<number[]>([]);
  const [addingId, setAddingId] = useState<number | null>(null);

  // Filters state from URL
  const currentQuery = searchParams.get('query') || '';
  const currentCategory = searchParams.get('categoryId') ? Number(searchParams.get('categoryId')) : undefined;
  const currentSortBy = searchParams.get('sortBy') || 'id';
  const currentSortDir = (searchParams.get('sortDirection') as 'ASC' | 'DESC') || 'ASC';
  const currentPage = searchParams.get('page') ? Number(searchParams.get('page')) : 0;

  const [minPriceInput, setMinPriceInput] = useState<string>(searchParams.get('minPrice') || '');
  const [maxPriceInput, setMaxPriceInput] = useState<string>(searchParams.get('maxPrice') || '');
  const [searchInput, setSearchInput] = useState<string>(currentQuery);

  const { addToCart } = useCart();
  const { showSuccess, showError } = useToast();

  // Load Categories once
  useEffect(() => {
    productApi.getCategories()
      .then(setCategories)
      .catch((err) => console.error('Failed to load categories', err));
  }, []);

  // Sync search input if query param changes
  useEffect(() => {
    setSearchInput(currentQuery);
  }, [currentQuery]);

  // Fetch products based on filters
  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params: ProductFilterParams = {
        query: currentQuery || undefined,
        categoryId: currentCategory,
        minPrice: minPriceInput ? Number(minPriceInput) : undefined,
        maxPrice: maxPriceInput ? Number(maxPriceInput) : undefined,
        page: currentPage,
        size: 9,
        sortBy: currentSortBy,
        sortDirection: currentSortDir,
      };
      const res = await productApi.getProducts(params);
      setPageData(res);
    } catch (err: any) {
      showError('Failed to load products');
    } finally {
      setLoading(false);
    }
  }, [currentQuery, currentCategory, minPriceInput, maxPriceInput, currentPage, currentSortBy, currentSortDir, showError]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const updateParam = (key: string, value?: string) => {
    const newParams = new URLSearchParams(searchParams);
    if (value !== undefined && value !== '') {
      newParams.set(key, value);
    } else {
      newParams.delete(key);
    }
    // reset to page 0 on filter change
    if (key !== 'page') {
      newParams.set('page', '0');
    }
    setSearchParams(newParams);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateParam('query', searchInput.trim());
  };

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
      showSuccess('Removed from wishlist');
    } else {
      setWishlist([...wishlist, productId]);
      showSuccess('Saved to wishlist');
    }
  };

  return (
    <div style={{ background: '#fbfbfa', minHeight: '100vh', padding: '40px 0 80px 0' }}>
      <div className="container">
        {/* Header Breadcrumb & Title */}
        <div style={{ marginBottom: '32px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#64748b', marginBottom: '8px' }}>
            <Link to="/" style={{ color: '#0f172a', fontWeight: 600 }}>Home</Link>
            <span>/</span>
            <span style={{ color: '#059669', fontWeight: 700 }}>Certified Catalog</span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <h1 style={{ fontSize: '36px', fontWeight: 900, color: '#0f172a', letterSpacing: '-0.5px' }}>
                Product Catalogue
              </h1>
              <p style={{ color: '#64748b', fontSize: '15px', marginTop: '4px' }}>
                Discover extraordinary technology with certified stock reservations &amp; authoritative pricing.
              </p>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(5, 150, 105, 0.1)', padding: '6px 14px', borderRadius: '999px', border: '1px solid rgba(5, 150, 105, 0.2)' }}>
              <ShieldCheck size={16} color="#059669" />
              <span style={{ fontSize: '12px', fontWeight: 700, color: '#065f46' }}>Atomic Concurrency Verified</span>
            </div>
          </div>
        </div>

        {/* Filter and Control Toolbar */}
        <div style={{
          backgroundColor: '#ffffff',
          padding: '20px 24px',
          borderRadius: '20px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 4px 20px -2px rgba(15, 23, 42, 0.04)',
          marginBottom: '36px',
          display: 'flex',
          flexDirection: 'column',
          gap: '18px'
        }}>
          {/* Top row: Categories & Search */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', alignItems: 'center', justifyContent: 'space-between' }}>
            {/* Category Pills */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center' }}>
              <button
                onClick={() => updateParam('categoryId', '')}
                className={`pill-tab ${currentCategory === undefined ? 'active' : ''}`}
                style={{ padding: '8px 16px', borderRadius: '999px', fontSize: '13px' }}
              >
                All Products
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => updateParam('categoryId', String(cat.id))}
                  className={`pill-tab ${currentCategory === cat.id ? 'active' : ''}`}
                  style={{ padding: '8px 16px', borderRadius: '999px', fontSize: '13px' }}
                >
                  {cat.name}
                </button>
              ))}
            </div>

            {/* In-page live search */}
            <form onSubmit={handleSearchSubmit} style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: '280px' }}>
              <div style={{ position: 'relative', width: '100%' }}>
                <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                <input
                  type="text"
                  placeholder="Filter by keyword..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 12px 8px 36px',
                    borderRadius: '999px',
                    border: '1px solid #cbd5e1',
                    fontSize: '13px',
                    outline: 'none'
                  }}
                />
              </div>
              <button type="submit" className="btn btn-primary btn-sm" style={{ borderRadius: '999px', padding: '8px 16px' }}>
                Filter
              </button>
            </form>
          </div>

          {/* Bottom row: Price inputs & Sort selector */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '16px',
            paddingTop: '16px',
            borderTop: '1px solid #f1f5f9'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '13px', fontWeight: 700, color: '#475569', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Filter size={14} /> Price Range:
              </span>
              <input
                type="number"
                placeholder="Min ₹"
                value={minPriceInput}
                onChange={(e) => setMinPriceInput(e.target.value)}
                onBlur={() => updateParam('minPrice', minPriceInput)}
                style={{ width: '100px', padding: '6px 10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
              />
              <span style={{ color: '#94a3b8' }}>–</span>
              <input
                type="number"
                placeholder="Max ₹"
                value={maxPriceInput}
                onChange={(e) => setMaxPriceInput(e.target.value)}
                onBlur={() => updateParam('maxPrice', maxPriceInput)}
                style={{ width: '100px', padding: '6px 10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
              />
              {(currentQuery || currentCategory || minPriceInput || maxPriceInput) && (
                <button
                  onClick={() => {
                    setMinPriceInput('');
                    setMaxPriceInput('');
                    setSearchInput('');
                    setSearchParams(new URLSearchParams());
                  }}
                  style={{ background: 'none', border: 'none', color: '#ef4444', fontSize: '12px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                >
                  <RefreshCw size={12} /> Clear Filters
                </button>
              )}
            </div>

            {/* Sorting */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '13px', color: '#64748b' }}>Sort by:</span>
              <select
                value={`${currentSortBy}_${currentSortDir}`}
                onChange={(e) => {
                  const [sb, sd] = e.target.value.split('_');
                  const newParams = new URLSearchParams(searchParams);
                  newParams.set('sortBy', sb);
                  newParams.set('sortDirection', sd);
                  setSearchParams(newParams);
                }}
                className="form-select"
                style={{ width: 'auto', padding: '6px 14px', fontSize: '13px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
              >
                <option value="id_ASC">Featured & Curated</option>
                <option value="price_ASC">Price: Low to High</option>
                <option value="price_DESC">Price: High to Low</option>
                <option value="stock_DESC">Stock: High to Low</option>
                <option value="title_ASC">Title: A-Z</option>
              </select>
            </div>
          </div>
        </div>

        {/* Products Grid */}
        {loading ? (
          <LoadingSpinner message="Querying certified catalog..." />
        ) : !pageData || pageData.content.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '72px 24px',
            backgroundColor: '#ffffff',
            borderRadius: '24px',
            border: '1px solid #e2e8f0',
            boxShadow: '0 4px 20px -2px rgba(15, 23, 42, 0.05)'
          }}>
            <div style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              background: '#f1f5f9',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px auto'
            }}>
              <Search size={32} color="#94a3b8" />
            </div>
            <h3 style={{ fontSize: '20px', fontWeight: 800, color: '#0f172a', marginBottom: '8px' }}>No items match your criteria</h3>
            <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '24px' }}>Try widening your price range or exploring another category.</p>
            <button
              onClick={() => {
                setMinPriceInput('');
                setMaxPriceInput('');
                setSearchInput('');
                setSearchParams(new URLSearchParams());
              }}
              className="btn btn-outline"
              style={{ borderRadius: '999px', padding: '10px 24px' }}
            >
              <RefreshCw size={15} /> Reset All Filters
            </button>
          </div>
        ) : (
          <>
            <div className="products-grid">
              {pageData.content.map((product) => {
                const isWishlisted = wishlist.includes(product.id);
                const isAdding = addingId === product.id;
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

                      {/* Stock badge */}
                      <span className={`stock-tag ${product.stock > 3 ? 'stock-in' : product.stock > 0 ? 'stock-low' : 'stock-out'}`} style={{ top: '12px', right: '12px' }}>
                        {product.stock > 3 ? `${product.stock} in stock` : product.stock > 0 ? `${product.stock} left` : 'Sold Out'}
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
                          color: isWishlisted ? '#ef4444' : '#64748b'
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
                          <span className="product-price" style={{ fontSize: '20px', fontWeight: 900, color: '#0f172a' }}>
                            {formatINR(product.price)}
                          </span>
                          <span style={{ display: 'block', fontSize: '11px', color: 'var(--text-light)' }}>
                            SKU: {product.sku}
                          </span>
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

            {/* Pagination Controls */}
            {pageData.totalPages > 1 && (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '16px', marginTop: '56px' }}>
                <button
                  disabled={pageData.first}
                  onClick={() => updateParam('page', String(currentPage - 1))}
                  className="btn btn-outline btn-sm"
                  style={{ borderRadius: '999px', padding: '8px 18px' }}
                >
                  <ChevronLeft size={16} /> Previous
                </button>
                <span style={{ fontSize: '14px', fontWeight: 700, color: '#475569' }}>
                  Page {pageData.number + 1} of {pageData.totalPages}
                </span>
                <button
                  disabled={pageData.last}
                  onClick={() => updateParam('page', String(currentPage + 1))}
                  className="btn btn-outline btn-sm"
                  style={{ borderRadius: '999px', padding: '8px 18px' }}
                >
                  Next <ChevronRight size={16} />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default CatalogPage;
