# ShopSphere Database Design & Schema

## 1. Schema Design Principles
- **Authoritative Data Types:** Financial calculations use `DECIMAL(10,2)` rather than floating-point approximations to eliminate IEEE 754 precision errors.
- **Relational Integrity:** Foreign keys enforce cascading constraints and prevent orphan rows across orders and cart items.
- **Auditing & Invariant Tracking:** Order status updates are permanently recorded in `order_status_history` alongside timestamps and acting user identifiers.
- **Idempotency Guarantees:** A compound unique index `uk_orders_user_idempotency (user_id, idempotency_key)` guarantees that repeat checkout requests never duplicate orders.

## 2. Table Specifications

### `users`
- `id` (BIGINT, PK, AUTO_INCREMENT)
- `email` (VARCHAR(255), UNIQUE, NOT NULL)
- `password_hash` (VARCHAR(255), NOT NULL)
- `first_name` (VARCHAR(100), NOT NULL)
- `last_name` (VARCHAR(100), NOT NULL)
- `role` (VARCHAR(50), NOT NULL) — `ROLE_CUSTOMER`, `ROLE_ADMIN`
- `enabled` (BOOLEAN, NOT NULL DEFAULT TRUE)
- `created_at`, `updated_at` (TIMESTAMP)

### `categories`
- `id` (BIGINT, PK, AUTO_INCREMENT)
- `name` (VARCHAR(100), NOT NULL)
- `slug` (VARCHAR(120), UNIQUE, NOT NULL)
- `description` (TEXT)
- `parent_id` (BIGINT, FK -> categories.id)

### `products`
- `id` (BIGINT, PK, AUTO_INCREMENT)
- `sku` (VARCHAR(100), UNIQUE, NOT NULL)
- `title` (VARCHAR(255), NOT NULL)
- `description` (TEXT)
- `price` (DECIMAL(10,2), NOT NULL)
- `stock` (INT, NOT NULL, CHECK stock >= 0)
- `image_url` (VARCHAR(1024))
- `category_id` (BIGINT, FK -> categories.id)
- `active` (BOOLEAN, NOT NULL DEFAULT TRUE)
- `version` (BIGINT, NOT NULL DEFAULT 0)

### `carts` & `cart_items`
- `carts.id` (BIGINT, PK, AUTO_INCREMENT), `user_id` (BIGINT, UNIQUE, FK -> users.id)
- `cart_items.id` (BIGINT, PK, AUTO_INCREMENT), `cart_id` (FK), `product_id` (FK), `quantity` (INT)

### `coupons`
- `id` (BIGINT, PK, AUTO_INCREMENT)
- `code` (VARCHAR(50), UNIQUE, NOT NULL)
- `discount_type` (VARCHAR(20), NOT NULL) — `PERCENTAGE`, `FIXED`
- `discount_value` (DECIMAL(10,2), NOT NULL)
- `min_order_value` (DECIMAL(10,2), NOT NULL DEFAULT 0.00)
- `usage_limit` (INT, NOT NULL DEFAULT 1)
- `times_used` (INT, NOT NULL DEFAULT 0)
- `expires_at` (DATETIME, NOT NULL)
- `active` (BOOLEAN, NOT NULL DEFAULT TRUE)

### `orders` & `order_items`
- `orders.id` (BIGINT, PK, AUTO_INCREMENT), `order_number` (VARCHAR(64), UNIQUE)
- `orders.user_id` (BIGINT, FK), `orders.idempotency_key` (VARCHAR(255))
- `orders.status` (VARCHAR(30)) — `PLACED`, `PAID`, `PACKED`, `SHIPPED`, `DELIVERED`, `PAYMENT_FAILED`, `CANCELLED`
- `orders.subtotal`, `orders.discount_amount`, `orders.total_amount` (DECIMAL(10,2))
- `orders.shipping_address` (TEXT)
- `order_items.id` (BIGINT, PK), `order_id` (FK), `product_id` (FK), `product_title` (VARCHAR), `unit_price` (DECIMAL), `quantity` (INT), `subtotal` (DECIMAL)

### `order_status_history`
- `id` (BIGINT, PK, AUTO_INCREMENT), `order_id` (FK -> orders.id)
- `previous_status` (VARCHAR(30)), `new_status` (VARCHAR(30)), `changed_by` (VARCHAR(100)), `reason` (VARCHAR(255)), `created_at` (TIMESTAMP)

