# ShopSphere — High-Concurrency Full-Stack E-Commerce Platform

[![Java 21](https://img.shields.io/badge/Java-21-orange.svg)](https://adoptium.net)
[![Spring Boot 3.3.4](https://img.shields.io/badge/Spring%20Boot-3.3.4-brightgreen.svg)](https://spring.io/projects/spring-boot)
[![React 18](https://img.shields.io/badge/React-18.3.1-blue.svg)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue.svg)](https://www.typescriptlang.org)
[![MySQL 8](https://img.shields.io/badge/MySQL-8.0-blue.svg)](https://www.mysql.com)
[![Docker](https://img.shields.io/badge/Docker-Multi--stage-2496ED.svg)](https://www.docker.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

---

## 1. Executive Summary & Problem Statement

**ShopSphere** is an enterprise-grade commercial e-commerce platform engineered specifically to address the most challenging failure modes of distributed retail applications:
- **Race conditions & stock overselling** under simultaneous purchase spikes of high-demand items.
- **Client-side price tampering** where malicious actors attempt to submit lower prices via browser dev tools.
- **Duplicate charges & phantom orders** resulting from client retries, double-clicks, and network timeouts.
- **Inconsistent multi-product transactions** causing deadlocks and partial stock reservations.
- **Silent inventory leaks** when payment gateways reject transactions without reliable rollback semantics.

ShopSphere enforces **mathematical concurrency safety**, **authoritative server-side pricing with high-precision arithmetic (BigDecimal)**, **idempotent checkout keys**, and a **strictly audited finite order state machine**.

---

## 2. System Architecture & Tech Stack

```
+-------------------------------------------------------------------------+
|                              Client Browser                             |
|       (React 18, TypeScript, Context API, Lucide Icons, Responsive CSS)  |
+-------------------------------------------------------------------------+
                                    |
                         HTTP / JSON | (Port 8080)
                                    v
+-------------------------------------------------------------------------+
|                               Nginx Proxy                               |
|       - Serves optimized static assets (Vite production build)           |
|       - Reverse-proxies /api/ requests to Spring Boot backend           |
+-------------------------------------------------------------------------+
                                    |
                                    v
+-------------------------------------------------------------------------+
|                       Spring Boot 3.3.4 Backend                         |
|   - Spring Security 6 + Stateless JWT Authentication & BCrypt Hashing   |
|   - Controller -> Service -> Repository Layered Architecture             |
|   - Concurrency Engine: Atomic Conditional Row Updates                  |
|   - Server-Side Pricing Engine with BigDecimal Precision                |
|   - Coupon & Promotion Engine with Multi-Tenant Usage Limits            |
|   - Finite State Machine with Audit History Recording                   |
|   - Spring Boot Actuator Health & Metrics (/actuator/health)             |
|   - OpenAPI 3.0 / Swagger UI Documentation                              |
+-------------------------------------------------------------------------+
                                    |
                               JDBC | (Port 3306)
                                    v
+-------------------------------------------------------------------------+
|                             MySQL 8.0 Engine                            |
|   - Flyway Versioned Migrations (V1 to V8)                              |
|   - ACID Transactions with InnoDB Row-Level Locks                       |
|   - Strict Foreign Keys, Unique Idempotency Constraints, DECIMAL fields |
+-------------------------------------------------------------------------+
```

### Technology Matrix
- **Backend:** Java 21 LTS, Spring Boot 3.3.4, Spring Security, Spring Data JPA, Hibernate ORM, Flyway 10, JJWT 0.12.6, Springdoc OpenAPI 2.6.0, Actuator.
- **Frontend:** React 18.3.1, TypeScript 5.6, Vite 5.4, React Router 6.26, Axios, Lucide React, Vitest 2.1, React Testing Library.
- **Database:** MySQL 8.0, Flyway migrations, H2 in-memory (for isolated fast unit/integration testing).
- **DevOps:** Multi-stage Dockerfile builds, Docker Compose orchestration, Jenkinsfile declarative pipeline, Nginx reverse proxy.
- **Currency & Market:** Standard Indian Rupee (`₹` / INR) formatting formatted via `Intl.NumberFormat('en-IN')`.

---

## 3. Quick Start & Execution Commands

### Prerequisites
- Docker & Docker Compose (or Java 21, Maven 3.9+, Node.js 20+)

### The Primary Command — Run Everything via Docker Compose
From the root `ShopSphere/` repository directory:

```bash
docker compose up --build
```

To run in detached background mode:
```bash
docker compose up --build -d
```

### Target Service Endpoints & Sharing Links

| Component | Target URL | Description |
|---|---|---|
| **ShopSphere Storefront (Local)** | [http://localhost:8080](http://localhost:8080) | Complete customer shopping journey & Admin console |
| **Share with Friend (Same Wi-Fi)** | `http://192.168.1.112:8080/` | Open directly on any phone, tablet, or friend's laptop on the same network |
| **Share Globally (Over Internet)** | Run `npx localtunnel --port 8080` | Generates a live public HTTPS URL accessible worldwide |
| **Spring Boot Backend** | [http://localhost:8081](http://localhost:8081) | Direct REST API endpoints (`/api/v1`) |
| **Backend Health Check** | [http://localhost:8081/actuator/health](http://localhost:8081/actuator/health) | Actuator health monitoring (`UP`) |
| **OpenAPI / Swagger UI** | [http://localhost:8081/swagger-ui/index.html](http://localhost:8081/swagger-ui/index.html) | Interactive API documentation |

### Inspect Containers & Logs
```bash
# View active container status
docker compose ps

# Follow application logs
docker compose logs -f

# Gracefully stop containers (preserves database volume)
docker compose down
```

---

## 4. Development Accounts & Demo Credentials

Pre-configured accounts seeded automatically in development mode:

| Role | Email | Password | Permissions |
|---|---|---|---|
| **Customer** | `customer@shopsphere.com` | `customer123` | Browse catalog, manage cart, apply coupons, checkout, track orders, profile |
| **Administrator** | `admin@shopsphere.com` | `admin123` | Full admin privileges: manage products, stock levels, orders, status transitions, coupons |

*(One-click quick-fill buttons are integrated on the Sign In page for rapid panel demonstration).*

### Available Demo Coupons

| Code | Type | Value | Minimum Order | Usage Limit | Purpose |
|---|---|---|---|---|---|
| `WELCOME10` | Percentage | 10% | ₹500.00 | 1,000 uses | Standard welcome discount |
| `FLAT50` | Fixed | ₹500.00 | ₹2,000.00 | 500 uses | High-value order incentive |
| `FLASH1` | Percentage | 50% | ₹1,000.00 | 1 use | High-concurrency single-use coupon test |
| `EXPIRED20` | Percentage | 20% | ₹500.00 | Expired | Rejection verification |
| `INACTIVE15` | Percentage | 15% | ₹500.00 | Disabled | Inactive status verification |

---

## 5. Core Engineering Invariants & Verified Solutions

### 1. Atomic Conditional Inventory Decrements (Zero Overselling)
Instead of checking stock in application memory and saving (`find -> check -> save`), which creates a critical race condition window, ShopSphere executes atomic conditional database row updates:
```sql
UPDATE products
SET stock = stock - :quantity,
    version = version + 1
WHERE id = :productId
  AND stock >= :quantity
  AND active = true;
```
If the affected row count is 0, an `InsufficientStockException` is thrown, aborting the transaction and releasing all acquired locks.

### 2. Multi-Item Deadlock Prevention
When orders contain multiple items, items are sorted deterministically by `productId` ascending before locking rows. This eliminates circular wait conditions and prevents database deadlocks.

### 3. Idempotent Checkout Engine
Every checkout submission requires an `Idempotency-Key` UUID header. A database unique constraint on `(user_id, idempotency_key)` guarantees that identical retry requests return the original order immediately without duplicate inventory deduction or multiple coupon decrements.

### 4. Authoritative Server-Side Financial Calculations
Prices provided by the client are strictly ignored. The backend retrieves unit prices directly from database entities, performs financial math using `BigDecimal` (`RoundingMode.HALF_UP`), and creates an immutable snapshot in `order_items` at purchase time.

### 5. Order State Machine with Compensation
Orders transition strictly through verified lifecycle states:
```
PLACED ──> PAID ──> PACKED ──> SHIPPED ──> DELIVERED
  │         │
  ▼         ▼
PAYMENT_FAILED CANCELLED
```
Simulated mock payment failure immediately triggers compensating transactions that restore reserved inventory exactly once.

---

## 6. Automated Testing Suite

### Running Backend Tests
```bash
mvn test -f backend/pom.xml
```
*Executes all 22 automated JUnit 5 / Spring Boot integration tests with 100% pass rate.*

### Running Frontend Tests
```bash
npm run test:run --prefix frontend
```
*Executes all Vitest / React Testing Library tests covering navigation, auth validation, catalog filtering, and cart workflows.*

---

## 7. Project Structure

```
ShopSphere/
├── README.md                          # Comprehensive project documentation
├── BUILD_CHECKLIST.md                 # Production build and verification tracker
├── docker-compose.yml                 # Multi-container orchestration (MySQL, Backend, Frontend)
├── Jenkinsfile                        # Declarative 9-stage CI/CD pipeline
├── .env.example                       # Environment variables template
├── docs/                              # Architectural and engineering specifications
│   ├── architecture.md                # System topology and component design
│   ├── database-design.md             # ER diagrams and database schema
│   ├── api-documentation.md           # REST API endpoints specification
│   ├── demo-script.md                 # Ascendion evaluation presentation script
│   ├── diagrams/                      # Mermaid architectural diagrams
│   ├── engineering/                   # Deep-dive invariant documentation
│   └── test-results/                  # Concrete test execution evidence
├── backend/                           # Java 21 / Spring Boot 3.3.4 service
│   ├── pom.xml
│   ├── Dockerfile
│   └── src/
└── frontend/                          # React 18 / TypeScript / Vite storefront
    ├── package.json
    ├── vite.config.ts
    ├── Dockerfile
    ├── nginx.conf
    └── src/
```

