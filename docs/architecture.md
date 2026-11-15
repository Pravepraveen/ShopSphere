# ShopSphere System Architecture

## 1. Overview
ShopSphere is built using a modern decoupled client-server architecture:
- **Client Tier:** A single-page application (SPA) built with React 18, TypeScript, and Vite.
- **Reverse Proxy / Static Server:** An Nginx web server serving compiled static assets and reverse-proxying API calls to backend services.
- **Application Tier:** Spring Boot 3.3.4 running on Java 21 LTS with stateless JWT authentication, Spring Data JPA, and Jakarta Bean Validation.
- **Data Tier:** MySQL 8.0 relational database with Flyway versioned migrations and transactional row locking.

## 2. Component Interactions
```
[ Browser / Client ]
        │  (HTTP / HTTPS)
        ▼
[ Nginx Reverse Proxy (Port 8080) ]
   ├── /          -> Static React SPA Build
   └── /api/v1/   -> Spring Boot REST API (Port 8081 / Internal 8080)
                             │
                             ▼
                    [ Spring Boot Application ]
                       ├── JwtAuthenticationFilter
                       ├── SecurityFilterChain (RBAC)
                       ├── Product / Category Service
                       ├── Cart Service
                       ├── Pricing Engine (BigDecimal)
                       ├── Concurrency Safe Stock Engine
                       ├── Idempotent Checkout Engine
                       ├── Order State Machine & Audit Service
                       └── Coupon Engine
                             │
                             ▼ (JDBC HikariCP)
                    [ MySQL 8.0 Database ]
```

## 3. High-Concurrency Principles
1. **Optimistic Row Versioning + Atomic Updates:** Database queries utilize conditional updates (`UPDATE products SET stock = stock - :qty, version = version + 1 WHERE id = :id AND stock >= :qty AND active = true`).
2. **Deterministic Locking Sequence:** When multiple products are ordered in a single checkout, the inventory engine locks products in order of ascending product ID to eliminate deadlock potential.
3. **Stateless Scalability:** JWT tokens carry authenticated principal claims, allowing horizontal scaling of backend instances without shared session state.

