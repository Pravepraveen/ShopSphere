# Backend Automated Test Suite Results

**Test Runner:** Apache Maven Surefire Plugin 3.2.5 / JUnit 5 Jupiter  
**Execution Environment:** Java 21 LTS (Temurin-21.0.11), Spring Boot 3.3.4  
**Date:** 2026-11-13  
**Status:** **BUILD SUCCESS — 100% PASS**

## Test Execution Summary

| Test Class | Category | Tests Run | Failures | Errors | Skipped | Elapsed Time |
|---|---|---|---|---|---|---|
| `com.ascendion.shopsphere.auth.AuthServiceTest` | Unit | 3 | 0 | 0 | 0 | 0.940 s |
| `com.ascendion.shopsphere.cart.CartServiceTest` | Unit | 3 | 0 | 0 | 0 | 0.132 s |
| `com.ascendion.shopsphere.coupon.CouponServiceTest` | Unit | 6 | 0 | 0 | 0 | 0.039 s |
| `com.ascendion.shopsphere.integration.CheckoutConcurrencyIT` | Integration | 3 | 0 | 0 | 0 | 8.214 s |
| `com.ascendion.shopsphere.integration.OrderWorkflowIT` | Integration | 2 | 0 | 0 | 0 | 0.190 s |
| `com.ascendion.shopsphere.orders.OrderStateMachineTest` | Unit | 5 | 0 | 0 | 0 | 0.005 s |
| **TOTAL** | | **22** | **0** | **0** | **0** | **20.968 s** |

## Verified Coverage
1. **Authentication:**
   - Registration with password hashing.
   - Login credential validation & JWT generation.
   - Duplicate email rejection.
2. **Cart Management:**
   - Add item, stock validation.
   - Update quantity with stock ceiling check.
   - Remove item and subtotal recomputation.
3. **Coupon Engine:**
   - Percentage discount calculation.
   - Fixed discount calculation.
   - Rejection of expired coupon.
   - Rejection of coupon when subtotal is below minimum order value.
   - Rejection when coupon usage limit is exceeded.
   - Rejection of inactive coupon.
4. **Order State Machine:**
   - All valid forward transitions.
   - Rejection of illegal reverse transitions (e.g. `DELIVERED` -> `PACKED`).
   - Logging of status transitions to history.

