import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { CatalogPage } from '../pages/CatalogPage';
import { AuthProvider } from '../context/AuthContext';
import { CartProvider } from '../context/CartContext';
import { ToastProvider } from '../components/common/Toast';

describe('Product Catalogue Page', () => {
  it('renders catalogue title and filter controls', () => {
    render(
      <BrowserRouter>
        <AuthProvider>
          <CartProvider>
            <ToastProvider>
              <CatalogPage />
            </ToastProvider>
          </CartProvider>
        </AuthProvider>
      </BrowserRouter>
    );

    expect(screen.getByText(/Product Catalogue/i)).toBeInTheDocument();
    expect(screen.getByText(/All Products/i)).toBeInTheDocument();
  });
});
