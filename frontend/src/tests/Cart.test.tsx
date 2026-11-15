import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { CartPage } from '../pages/CartPage';
import { AuthProvider } from '../context/AuthContext';
import { CartProvider } from '../context/CartContext';
import { ToastProvider } from '../components/common/Toast';

describe('Cart and Checkout Flow', () => {
  it('renders empty cart state when no items are present', () => {
    render(
      <BrowserRouter>
        <AuthProvider>
          <CartProvider>
            <ToastProvider>
              <CartPage />
            </ToastProvider>
          </CartProvider>
        </AuthProvider>
      </BrowserRouter>
    );

    expect(screen.getByText(/Your Cart is Empty/i)).toBeInTheDocument();
    expect(screen.getByText(/Explore Products/i)).toBeInTheDocument();
  });
});
