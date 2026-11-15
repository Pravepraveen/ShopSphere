# Technical Decisions Record (ADR)

## ADR 01: Atomic Conditional Updates vs Distributed Redis Locks
- **Context:** Ensuring zero overselling under simultaneous customer purchases.
- **Decision:** Utilize native relational database atomic conditional updates (`UPDATE products SET stock = stock - :qty WHERE stock >= :qty`) rather than external distributed lock managers (e.g. Redisson / Redis locks).
- **Rationale:** Minimizes operational complexity and infrastructure failure points. MySQL InnoDB row-level locking provides ACID transactional guarantees with zero distributed split-brain risk.

## ADR 02: BigDecimal vs Float/Double for Currency
- **Context:** Accurate financial calculation of order subtotals, coupon percentage deductions, and final totals.
- **Decision:** All monetary fields (`price`, `subtotal`, `discountAmount`, `totalAmount`) are strictly typed as `java.math.BigDecimal` with database type `DECIMAL(10,2)`.
- **Rationale:** Floating-point data types (IEEE 754) introduce rounding anomalies (e.g. `0.1 + 0.2 = 0.30000000000000004`), which are unacceptable in commercial financial software.

## ADR 03: Idempotency Key Header on Checkout
- **Context:** Preventing duplicate orders from network timeouts and double-clicks.
- **Decision:** Require client to generate a unique UUID v4 header `Idempotency-Key` for every checkout submission, backed by a unique database constraint on `(user_id, idempotency_key)`.
- **Rationale:** Provides guaranteed at-most-once order creation semantics without requiring client session state or cache expiration heuristics.

## ADR 04: Finite State Machine for Order Lifecycle
- **Context:** Ensuring orderly fulfillment and preventing illegal business transitions.
- **Decision:** Implement strict status transitions (`PLACED` -> `PAID` -> `PACKED` -> `SHIPPED` -> `DELIVERED`). Terminal states: `PAYMENT_FAILED` and `CANCELLED`.
- **Rationale:** Prevents illogical operational errors (e.g., attempting to un-deliver an order or cancel a shipped package) and ensures compliance audits via `order_status_history`.

