# Security Architecture & Authorization Design

## 1. Authentication Layer
- **Stateless Bearer Tokens:** Authentication utilizes JSON Web Tokens (JJWT 0.12.6) with HMAC-SHA256 signatures (`HS256`).
- **Cryptographic Storage:** User passwords are never stored in plaintext. They are salted and hashed using `BCryptPasswordEncoder` with strength factor 10.
- **Principal Claims:** Token payloads carry `sub` (user email), `id`, `role`, and expiration timestamp (`exp`).

## 2. Authorization & Role-Based Access Control (RBAC)
ShopSphere defines two core security roles:
- `ROLE_CUSTOMER`: Access to personal cart, order submission, personal order tracking, and account profile.
- `ROLE_ADMIN`: Administrative privileges covering product catalog management, inventory adjustments, coupon configuration, and order status transitions.

### Defense in Depth:
1. **URL Authorization Filters:** Defined in `SecurityConfig.java`:
   - `/api/v1/auth/**`, `/api/v1/products/**` (GET), `/actuator/**` -> Public.
   - `/api/v1/cart/**`, `/api/v1/checkout/**`, `/api/v1/orders/**` -> Authenticated users.
   - `/api/v1/admin/**` -> Must have authority `ROLE_ADMIN`.
2. **Method-Level Security:** `@PreAuthorize("hasRole('ADMIN')")` protects sensitive service invocations.
3. **Ownership Verification:** Customers cannot view or manipulate other customers' orders. Queries strictly filter by authenticated principal ID (`order.getUser().getId().equals(currentUser.getId())`).

## 3. CORS & CSRF
- Stateless REST architecture with bearer token header authentication eliminates traditional session-fixation and ambient CSRF vectors.
- Whitelisted CORS configuration allows authorized origins (`http://localhost:8080`, `http://localhost:8081`, `http://localhost:5173`).

