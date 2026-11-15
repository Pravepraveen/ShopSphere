# ShopSphere Demonstration Script for Engineering Panel

**Platform:** ShopSphere High-Concurrency E-Commerce  
**Evaluator Audience:** Ascendion Senior Technical Review Panel  
**Duration:** 5-7 Minutes  

---

## Step 1: Architectural Overview & Luxury Storefront Landing (1 min)
1. Navigate to `http://localhost:8080`.
2. Highlight the **deep forest green and champagne gold** visual identity, clean typography, and responsive header.
3. Point out the **System Invariants Bar** explaining:
   - Atomic conditional updates eliminating race conditions.
   - Deterministic sorting preventing multi-item checkout deadlocks.
   - Idempotency guarantees preventing duplicate charges.
   - Compensating transactions restoring inventory on payment failures.

## Step 2: Customer Authentication & Catalogue Exploration (1 min)
1. Click **Sign In**.
2. Click **Fill Customer** (`customer@shopsphere.com` / `customer123`).
3. View the **Product Catalogue** (`/products`):
   - Filter by Category (e.g. *Audio & Sound*).
   - Sort by *Price: High to Low*.
   - Search for `Sony` or `MacBook`.
   - Point out Indian Rupee (`₹` / INR) formatting across all product cards and stock tags.

## Step 3: Shopping Cart, Coupon Engine & Server-Side Pricing (1.5 min)
1. Add **Sony WH-1000XM5** (Stock = 1) to cart.
2. Navigate to `/cart`:
   - Note live item subtotal calculation.
   - Click **Proceed to Checkout**.
3. On `/checkout`:
   - Enter Shipping Address: `Flat 402, Brigade Gateway, Malleshwaram, Bengaluru, Karnataka 560055`.
   - Test Coupon: Apply `WELCOME10` (10% discount verified server-side).
   - Point out that manipulating the DOM/client code has zero impact because price is computed on the backend using `BigDecimal`.

## Step 4: Idempotency & Stock Reservation (1 min)
1. Click **Place Order**.
2. Observe transition to `/checkout/payment/{orderId}`.
3. Review order details: Status is `PLACED`, stock is decremented atomically.
4. Explain that duplicate submission with the same `Idempotency-Key` returns the existing order rather than creating a second order or decrementing stock again.

## Step 5: Mock Payment & Compensating Stock Restoration (1 min)
1. **Scenario A (Success):** Click **Simulate Successful Payment**.
   - Order transitions to `PAID`.
   - View order tracking timeline showing `PLACED` -> `PAID` with green checkmarks.
2. **Scenario B (Failure & Compensation):**
   - Place an order and click **Simulate Payment Failure**.
   - Order transitions to `PAYMENT_FAILED`.
   - Inventory is immediately restored back to the product via an ACID compensating transaction.

## Step 6: Administrator Console & Order State Transitions (1 min)
1. Sign in as Administrator (`admin@shopsphere.com` / `admin123`).
2. Navigate to **Admin Console** (`/admin`):
   - **Products Tab:** Update product stock or price, toggle active status.
   - **Orders Tab:** View incoming orders and progress status (`PLACED` -> `PAID` -> `PACKED` -> `SHIPPED` -> `DELIVERED`).
   - Note that invalid transitions (e.g. `DELIVERED` -> `PACKED`) are rejected with HTTP 400.
   - **Coupons Tab:** Inspect usage counts, expiry dates, and create new discount codes.

