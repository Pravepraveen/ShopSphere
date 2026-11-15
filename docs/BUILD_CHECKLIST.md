# ShopSphere Build Checklist & Verification Tracker

## Project Information
- **Project Name:** ShopSphere (Full-Stack E-Commerce Website with Smart Inventory and Order Tracking)
- **Architect/Developer:** Principal Software Architect & Engineering Team
- **JDK:** Java 21 (Temurin-21.0.11)
- **Maven:** 3.9.9
- **Node.js:** v24.13.1
- **npm:** 11.8.0
- **Database:** MySQL 8 with Flyway Migrations (H2 MySQL-mode for local automated test suites)
- **Frontend:** React 18, TypeScript, Vite, React Router 6, Context API, Modern Responsive CSS
- **Backend:** Spring Boot 3.3.4, Spring Security 6, JWT, Spring Data JPA, Hibernate, Bean Validation, OpenAPI 3.0

---

## Phase 0: Workspace Inspection & Environment Setup
- [x] Inspect workspace and existing files (clean slate verified)
- [x] Verify toolchain: Java 21, Maven 3.9.9, Node.js v24.13.1, npm 11.8.0, Docker
- [x] Initialize `docs/BUILD_CHECKLIST.md`
- [x] Create root project configuration (`.gitignore`, `.editorconfig`, `.env.example`, `docker-compose.yml`, `Jenkinsfile`)
- [x] Create scripts directory (`scripts/health-check.sh`, `scripts/run-tests.sh`)

---

## Phase 1: Project Foundation
- [ ] Create `backend/pom.xml` with dependencies (Spring Boot 3.3.4, Security, JPA, Validation, Flyway, MySQL, JJWT, OpenAPI, Lombok, Test)
- [ ] Configure `backend/src/main/resources/application.yml`
- [ ] Configure `backend/src/main/resources/application-dev.yml`
- [ ] Configure `backend/src/main/resources/application-test.yml`
- [ ] Implement Flyway migrations V1 through V7 in `backend/src/main/resources/db/migration/`
  - [ ] `V1__create_users.sql` (Customer & Admin accounts, roles, BCrypt passwords)
  - [ ] `V2__create_categories.sql` (Parent/subcategories hierarchy)
  - [ ] `V3__create_products.sql` (SKU, title, price DECIMAL, stock INT, version BIGINT for optimistic locking, active)
  - [ ] `V4__create_carts.sql` (Carts and cart_items with quantity and user FK)
  - [ ] `V5__create_coupons.sql` (Coupon engine: PERCENTAGE/FIXED, limits, usage count, min order value, expiry)
  - [ ] `V6__create_orders.sql` (Orders with idempotency key, items, snapshot prices, status PLACED/PAID/PACKED/SHIPPED/DELIVERED/CANCELLED/PAYMENT_FAILED)
  - [ ] `V7__create_order_history.sql` (Audit log of all order transitions, changed_by, timestamp)
- [ ] Initialize `frontend` with Vite, React 18, TypeScript, TailwindCSS/Responsive styles, React Router, Vitest
- [ ] Verify initial backend compilation (`mvn compile`)
- [ ] Verify initial frontend build (`npm run build`)

---

## Phase 2: Backend Core & Security Implementation
- [ ] Create domain entities (`User`, `Role`, `Category`, `Product`, `Cart`, `CartItem`, `Coupon`, `Order`, `OrderItem`, `OrderStatusHistory`, `OrderStatus`, `DiscountType`)
- [ ] Create Spring Data JPA repositories with custom queries
- [ ] Implement security layer:
  - [ ] `JwtService` (JWT creation, claims, expiration, signature verification)
  - [ ] `JwtAuthenticationFilter` (Token extraction, validation, SecurityContext population)
  - [ ] `SecurityConfig` (Stateless session, BCrypt password encoder, URL authorization rules, CORS, unauthorized handler)
  - [ ] `CustomUserDetailsService`
- [ ] Global exception handling & API response wrapper:
  - [ ] `ApiResponse<T>`, `ErrorResponse`, `FieldViolation`
  - [ ] `GlobalExceptionHandler` (`ResourceNotFoundException`, `InsufficientStockException`, `InvalidCouponException`, `IdempotencyConflictException`, `InvalidStateTransitionException`, `UnauthorizedException`)
- [ ] Authentication API:
  - [ ] `POST /api/v1/auth/register` (Customer registration, validation, duplicate email check)
  - [ ] `POST /api/v1/auth/login` (Authentication, JWT issuance, profile info)
- [ ] Catalog API:
  - [ ] `GET /api/v1/products` (Search, category filter, price filter, sorting, pagination)
  - [ ] `GET /api/v1/products/{id}`
  - [ ] `GET /api/v1/categories`

---

## Phase 3: Advanced Business Logic & Invariants
- [ ] Shopping Cart Service & API:
  - [ ] `GET /api/v1/cart`
  - [ ] `POST /api/v1/cart/items`
  - [ ] `PUT /api/v1/cart/items/{itemId}`
  - [ ] `DELETE /api/v1/cart/items/{itemId}`
  - [ ] Cart persistence across customer login/logout
- [ ] Authoritative Server-Side Pricing:
  - [ ] Product price fetched from DB (ignoring frontend-submitted prices)
  - [ ] `BigDecimal` scale and rounding mode (HALF_UP)
  - [ ] Subtotal = $\sum(\text{price} \times \text{quantity})$
  - [ ] Coupon validation and discount computation
  - [ ] Total = $\max(0, \text{Subtotal} - \text{Discount})$
- [ ] Atomic Inventory Management:
  - [ ] Conditional SQL update: `UPDATE products SET stock = stock - :qty, version = version + 1 WHERE id = :id AND stock >= :qty AND active = true`
  - [ ] Deterministic sorting of product IDs during multi-item reservations (prevents deadlocks)
  - [ ] Zero affected rows throws `InsufficientStockException` and triggers transaction rollback
- [ ] Idempotent Checkout Engine:
  - [ ] Header `Idempotency-Key` requirement
  - [ ] Unique constraint on `(user_id, idempotency_key)`
  - [ ] If existing key detected, return existing order safely without duplicate stock deduction
  - [ ] Concurrent duplicate key handling
- [ ] Mock Payment System:
  - [ ] `POST /api/v1/checkout/mock-payment`
  - [ ] SIMULATE_SUCCESS: transition to `PAID`, keep inventory deducted
  - [ ] SIMULATE_FAILURE: transition to `PAYMENT_FAILED`, restore inventory atomically exactly once
- [ ] Order State Machine & Audit History:
  - [ ] Explicit transitions: `PLACED -> PAID -> PACKED -> SHIPPED -> DELIVERED`, or `PLACED -> PAYMENT_FAILED`, `PAID -> CANCELLED`
  - [ ] Reject invalid state transitions
  - [ ] Every transition logged into `order_status_history`
- [ ] Admin APIs:
  - [ ] `POST /api/v1/admin/products`, `PUT /api/v1/admin/products/{id}`, `DELETE /api/v1/admin/products/{id}`
  - [ ] `POST /api/v1/admin/categories`
  - [ ] `GET /api/v1/admin/orders`, `PATCH /api/v1/admin/orders/{id}/status`
  - [ ] `POST /api/v1/admin/coupons`, `PUT /api/v1/admin/coupons/{id}`

---

## Phase 4: Full-Stack React Frontend Application
- [ ] Modern UI setup with responsive navbar, hero banner, toast system, modals, badge indicators
- [ ] State management: `AuthContext`, `CartContext`
- [ ] API Client with Axios / Fetch, automatic JWT Bearer token injection, 401 handling
- [ ] Customer Routes & Pages:
  - [ ] Home / Featured Products (`/`)
  - [ ] Catalog with search, multi-category filters, price range sliders, sorting, pagination (`/products`)
  - [ ] Product Details with real-time stock indicator (`/products/:id`)
  - [ ] Login & Register forms with field validation (`/login`, `/register`)
  - [ ] Shopping Cart with quantity selectors and subtotal calculation (`/cart`)
  - [ ] Checkout page with coupon application, shipping address, Idempotency-Key generation (`/checkout`)
  - [ ] Mock Payment Simulator with Success and Failure triggers (`/checkout/payment/:orderId`)
  - [ ] My Orders & Order Tracking timeline (`/orders`, `/orders/:id`)
  - [ ] Customer Profile (`/profile`)
- [ ] Administrator Routes & Pages (Role Guarded):
  - [ ] Admin Dashboard (`/admin`)
  - [ ] Product Management (add/edit/deactivate/stock adjustments) (`/admin/products`)
  - [ ] Category Management (`/admin/categories`)
  - [ ] Order Management & Status Transition Stepper (`/admin/orders`)
  - [ ] Coupon Management (`/admin/coupons`)
- [ ] Interactive validation, empty states, loading skeletons, error banners

---

## Phase 5: Automated Testing & Verification
- [ ] Backend Unit Tests:
  - [ ] Authentication & password hashing tests
  - [ ] JWT service tests
  - [ ] Pricing & BigDecimal calculations tests
  - [ ] Coupon engine rules & limits tests
  - [ ] Order state machine transition validator tests
- [ ] Backend Integration Tests:
  - [ ] `CheckoutConcurrencyIT`: 2 concurrent customer threads racing for the last item (stock = 1)
    - Verifies: Exactly 1 succeeds, exactly 1 fails, final stock = 0, no negative stock
  - [ ] `IdempotencyIT`: Repeated checkout requests with identical Idempotency-Key
    - Verifies: Exactly 1 order created, same order returned, stock deducted only once
  - [ ] `CouponConcurrencyIT`: Concurrent coupon usage up to limit
    - Verifies: Usage limit is strictly respected
  - [ ] `OrderWorkflowIT`: Full lifecycle from PLACED to DELIVERED, and failed payment stock restoration
- [ ] Frontend Automated Tests:
  - [ ] Authentication form validation tests
  - [ ] Cart state & calculations tests
  - [ ] Product catalog filter tests
  - [ ] Order timeline render tests
- [ ] Execute `mvn test` and `npm run test` and verify 100% pass rate

---

## Phase 6: Docker, CI/CD, & DevOps
- [ ] Create `backend/Dockerfile`
- [ ] Create `frontend/Dockerfile` (multi-stage build with Nginx)
- [ ] Create `docker-compose.yml` (MySQL 8, Backend, Frontend, healthchecks, networks, volumes)
- [ ] Create `Jenkinsfile` with 7 stages (Checkout, Backend Build, Backend Test, Frontend Install, Frontend Test, Frontend Build, Docker Build)
- [ ] Verify Docker configurations and scripts

---

## Phase 7: Documentation & Engineering Reports
- [ ] Root `README.md` (overview, architecture, quickstart, API documentation, development credentials, concurrency design)
- [ ] `docs/architecture.md`
- [ ] `docs/database-design.md`
- [ ] `docs/api-documentation.md`
- [ ] `docs/demo-script.md`
- [ ] Mermaid diagrams:
  - [ ] `docs/diagrams/system-architecture.mmd`
  - [ ] `docs/diagrams/database-erd.mmd`
  - [ ] `docs/diagrams/checkout-flow.mmd`
  - [ ] `docs/diagrams/order-state-machine.mmd`
- [ ] Engineering deep-dives:
  - [ ] `docs/engineering/checkout-invariants.md`
  - [ ] `docs/engineering/concurrency-design.md`
  - [ ] `docs/engineering/security-design.md`
  - [ ] `docs/engineering/technical-decisions.md`

---

## Phase 8: Final Review & Acceptance Sign-off
- [ ] All 28 acceptance checklist items verified
- [ ] Final demonstration script tested
- [ ] Status report presented

