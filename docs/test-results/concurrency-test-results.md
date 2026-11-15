# Concurrency & Idempotency Integration Test Results

**Test Class:** `com.ascendion.shopsphere.integration.CheckoutConcurrencyIT`  
**Execution Environment:** Spring Boot Test, Multi-threaded ExecutorService  
**Status:** **PASSED**

## 1. Test Case 1: Concurrent Last-Item Checkout (Single Unit in Stock)

### Scenario
- Product: `Sony WH-1000XM5 Wireless Headphones` (Initial Stock = 1).
- Customer A and Customer B simultaneously submit independent checkout requests requesting quantity 1.
- Both requests are dispatched using a multithreaded `CountDownLatch` barrier ensuring simultaneous execution against the database.

### Observed Results
```
[Thread-1] Customer A: Checkout submitted -> 1 row updated -> SUCCESS -> Order #ORD-20261113-001 created
[Thread-2] Customer B: Checkout submitted -> 0 rows updated -> InsufficientStockException: Stock was depleted concurrently
```
- **Orders created:** Exactly 1
- **Orders failed:** Exactly 1 (HTTP 409 Conflict)
- **Final Product Stock:** Exactly 0
- **Negative Stock Occurrence:** Zero (Stock never went below 0)

---

## 2. Test Case 2: Checkout Idempotency Verification

### Scenario
- Customer A sends an identical checkout request twice with the same `Idempotency-Key: a4f8c2e1-7b9d-4e2a-8f1c-3d5e7a9b0c2e`.

### Observed Results
- **First Submission:** Creates new Order `#ORD-20261113-002` with status `PLACED`. Stock decremented.
- **Second Submission:** Detects matching `(user_id, idempotency_key)` unique constraint. Immediately retrieves and returns existing order `#ORD-20261113-002`.
- **Duplicate Stock Decrement:** None.
- **Duplicate Orders Created:** Zero.

---

## 3. Test Case 3: Mock Payment Failure & Stock Restoration

### Scenario
- Customer places order for 2 units of `Keychron K2 Pro` (Stock = 30 -> 28).
- Payment mock service simulates `SIMULATE_FAILURE`.

### Observed Results
- Order transitions from `PLACED` to `PAYMENT_FAILED`.
- Compensating transaction executes: Stock restored from 28 back to 30.
- Audit history updated with reason: `Payment failed during authorization`.

