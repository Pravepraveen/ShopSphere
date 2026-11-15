# Concurrency Design & Deadlock Prevention

## 1. Concurrency Problem Definition
In high-traffic retail systems, multiple concurrent client threads attempt to reserve the final remaining units of stock simultaneously.
Naive implementations that perform:
1. `Product p = repository.findById(id);`
2. `if (p.getStock() >= qty) { p.setStock(p.getStock() - qty); repository.save(p); }`
suffer from the classic **Check-Then-Act Race Condition**. Two threads can simultaneously observe stock = 1, pass the check, decrement, and produce a negative inventory of -1.

## 2. ShopSphere's Concurrency Architecture
ShopSphere employs **Atomic Conditional Execution** inside database row locks:
```sql
UPDATE products
SET stock = stock - :quantity,
    version = version + 1
WHERE id = :productId
  AND stock >= :quantity
  AND active = true;
```

### Affected Rows Check
- If affected rows $= 1$: Reservation succeeded.
- If affected rows $= 0$: Either stock was insufficient or product was deactivated concurrently. The service immediately throws `InsufficientStockException`, rolling back the Spring `@Transactional` boundary.

## 3. Multi-Item Deadlock Prevention
When an order contains multiple products $\{P_1, P_3, P_7\}$, concurrent transactions reserving overlapping items in different orders can create a circular lock dependency:
- Transaction A locks $P_1$, waits for $P_3$.
- Transaction B locks $P_3$, waits for $P_1$.
**Solution:**
ShopSphere enforces **Deterministic Resource Ordering**. Before acquiring any database row locks or issuing update statements, the checkout service sorts all items in ascending order of `productId`. Because all transactions acquire locks in identical sequential order, circular wait conditions cannot form.

