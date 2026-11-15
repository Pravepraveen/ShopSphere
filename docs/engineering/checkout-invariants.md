# Checkout Invariants Specification

## Mathematical & System Invariants

### Invariant 1: Non-Negative Inventory
$$\forall p \in \text{Products}, \quad \text{stock}(p) \ge 0$$
- **Enforcement Mechanism:** At the database level, an atomic conditional update is executed:
  `UPDATE products SET stock = stock - :qty WHERE id = :id AND stock >= :qty AND active = true`.
- If affected rows $= 0$, an `InsufficientStockException` is raised, rolling back the entire transactional unit of work.

### Invariant 2: Server-Side Authoritative Pricing
$$\text{Subtotal} = \sum_{i=1}^{n} (\text{db\_price}(p_i) \times q_i)$$
$$\text{Discount} = \text{validate\_coupon}(\text{coupon}, \text{Subtotal})$$
$$\text{Total} = \max(0, \text{Subtotal} - \text{Discount})$$
- **Enforcement Mechanism:** The backend completely disregards any prices, subtotals, or totals transmitted in the request payload. Prices are read directly from authoritative database records during transaction execution. All arithmetic operations are executed using Java `BigDecimal` with `RoundingMode.HALF_UP`.

### Invariant 3: Idempotent Order Creation
$$\text{Order}(u, k) \text{ is unique } \forall (u \in \text{Users}, k \in \text{IdempotencyKeys})$$
- **Enforcement Mechanism:** A compound unique database constraint `uk_orders_user_idempotency` on `(user_id, idempotency_key)`.
- If an existing key is presented by the same customer, the backend returns the previously constructed order representation with HTTP 200 without creating a duplicate order or decrementing inventory twice.

### Invariant 4: Zero Orphan Reservations (Compensating Transactions)
$$\text{OrderState} \in \{\text{PAYMENT\_FAILED}, \text{CANCELLED}\} \implies \text{Inventory Restored Exactly Once}$$
- **Enforcement Mechanism:** When transitioning an order to `PAYMENT_FAILED` or `CANCELLED`, compensating SQL updates increment stock for all line items (`UPDATE products SET stock = stock + :qty WHERE id = :id`) and record the state change in `order_status_history`. Re-running cancellation on a cancelled order is rejected by the finite state machine.

