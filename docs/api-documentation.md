# ShopSphere REST API Specification

Base URI: `/api/v1`

## 1. Authentication (`/api/v1/auth`)
- `POST /auth/register` — Register new customer account
- `POST /auth/login` — Authenticate and receive JWT Bearer token
- `POST /auth/logout` — Invalidate client-side session

## 2. Product Catalogue (`/api/v1/products` & `/api/v1/categories`)
- `GET /products` — Query products with search, category filtering, min/max price, sorting, and pagination
- `GET /products/{id}` — Retrieve detailed product attributes and stock availability
- `GET /categories` — List all top-level and subcategories

## 3. Shopping Cart (`/api/v1/cart`)
- `GET /cart` — Get current customer's persisted shopping cart and items
- `POST /cart/items` — Add an item with validated quantity to cart
- `PUT /cart/items/{itemId}` — Update item quantity in cart
- `DELETE /cart/items/{itemId}` — Remove item from cart

## 4. Coupons (`/api/v1/coupons`)
- `POST /coupons/validate` — Validate coupon against order subtotal and return discount amount

## 5. Checkout & Payments (`/api/v1/checkout`)
- `POST /checkout` — Submit checkout order with required `Idempotency-Key` header
- `POST /checkout/mock-payment` — Execute mock payment (SIMULATE_SUCCESS or SIMULATE_FAILURE)

## 6. Orders (`/api/v1/orders`)
- `GET /orders/me` — Retrieve authenticated customer's order history
- `GET /orders/{id}` — Retrieve detailed order attributes, purchased items, and status history
- `POST /orders/{id}/cancel` — Cancel an unpaid order and release reserved stock

## 7. Administrator APIs (`/api/v1/admin`) — Requires `ROLE_ADMIN`
- `GET /admin/orders` — List all customer orders
- `PATCH /admin/orders/{id}/status` — Execute valid state transition (`PLACED` -> `PAID` -> `PACKED` -> `SHIPPED` -> `DELIVERED`)
- `POST /admin/products` — Create new product
- `PUT /admin/products/{id}` — Update existing product details, price, and stock
- `DELETE /admin/products/{id}` — Deactivate product
- `GET /admin/coupons` — List all coupons
- `POST /admin/coupons` — Create promotional coupon code

