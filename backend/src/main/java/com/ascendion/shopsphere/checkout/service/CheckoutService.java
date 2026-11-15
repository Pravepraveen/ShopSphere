package com.ascendion.shopsphere.checkout.service;

import com.ascendion.shopsphere.cart.entity.Cart;
import com.ascendion.shopsphere.cart.entity.CartItem;
import com.ascendion.shopsphere.cart.repository.CartItemRepository;
import com.ascendion.shopsphere.cart.repository.CartRepository;
import com.ascendion.shopsphere.catalog.product.Product;
import com.ascendion.shopsphere.catalog.product.ProductRepository;
import com.ascendion.shopsphere.checkout.dto.CheckoutItemRequest;
import com.ascendion.shopsphere.checkout.dto.CheckoutRequest;
import com.ascendion.shopsphere.checkout.dto.MockPaymentRequest;
import com.ascendion.shopsphere.checkout.dto.MockPaymentResponse;
import com.ascendion.shopsphere.common.exception.BadRequestException;
import com.ascendion.shopsphere.common.exception.InsufficientStockException;
import com.ascendion.shopsphere.common.exception.InvalidCouponException;
import com.ascendion.shopsphere.common.exception.ResourceNotFoundException;
import com.ascendion.shopsphere.coupon.entity.Coupon;
import com.ascendion.shopsphere.coupon.repository.CouponRepository;
import com.ascendion.shopsphere.coupon.service.CouponService;
import com.ascendion.shopsphere.orders.dto.OrderDto;
import com.ascendion.shopsphere.orders.dto.UpdateOrderStatusRequest;
import com.ascendion.shopsphere.orders.entity.Order;
import com.ascendion.shopsphere.orders.entity.OrderItem;
import com.ascendion.shopsphere.orders.entity.OrderStatus;
import com.ascendion.shopsphere.orders.entity.OrderStatusHistory;
import com.ascendion.shopsphere.orders.repository.OrderItemRepository;
import com.ascendion.shopsphere.orders.repository.OrderRepository;
import com.ascendion.shopsphere.orders.repository.OrderStatusHistoryRepository;
import com.ascendion.shopsphere.orders.service.OrderService;
import com.ascendion.shopsphere.user.entity.User;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Isolation;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CheckoutService {

    private final ProductRepository productRepository;
    private final CouponRepository couponRepository;
    private final CouponService couponService;
    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;
    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final OrderStatusHistoryRepository statusHistoryRepository;
    private final OrderService orderService;

    /**
     * ATOMIC IDEMPOTENT CHECKOUT EXECUTION
     * Guarantees:
     * 1. No overselling via atomic conditional stock decrements.
     * 2. Deadlock prevention through deterministic product sorting.
     * 3. Authoritative server-side pricing from database snapshots.
     * 4. Strict coupon validation and atomic usage limiting.
     * 5. Idempotent order creation using unique (user_id, idempotency_key).
     */
    @Transactional(isolation = Isolation.READ_COMMITTED)
    public OrderDto executeCheckout(User user, String idempotencyKey, CheckoutRequest request) {
        if (idempotencyKey == null || idempotencyKey.trim().isBlank()) {
            throw new BadRequestException("Header 'Idempotency-Key' is required for checkout requests");
        }
        String cleanIdempotencyKey = idempotencyKey.trim();

        // 1. Idempotency Check: Return existing order if key was already processed for this user
        Optional<Order> existingOrder = orderRepository.findByUserIdAndIdempotencyKey(user.getId(), cleanIdempotencyKey);
        if (existingOrder.isPresent()) {
            return OrderDto.fromEntity(existingOrder.get());
        }

        // 2. Resolve items to checkout
        List<CheckoutItemRequest> itemRequests = resolveCheckoutItems(user, request);
        if (itemRequests.isEmpty()) {
            throw new BadRequestException("No items available to checkout");
        }

        // 3. Deterministic Sorting by Product ID to prevent database deadlocks across concurrent threads
        List<CheckoutItemRequest> sortedItems = itemRequests.stream()
                .sorted(Comparator.comparing(CheckoutItemRequest::getProductId))
                .toList();

        // 4. Reserve stock and compute authoritative server-side prices
        BigDecimal subtotal = BigDecimal.ZERO;
        List<OrderItemDraft> itemDrafts = new ArrayList<>();

        for (CheckoutItemRequest itemReq : sortedItems) {
            Product product = productRepository.findById(itemReq.getProductId())
                    .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + itemReq.getProductId()));

            if (!product.isActive()) {
                throw new BadRequestException("Product is inactive and cannot be purchased: " + product.getTitle());
            }

            // ATOMIC CONDITIONAL UPDATE:
            // Deducts stock ONLY IF available stock >= requested quantity and product is active.
            // If another thread already took the last unit, this updates 0 rows and fails immediately!
            int updatedRows = productRepository.decrementStockConditionally(product.getId(), itemReq.getQuantity());
            if (updatedRows == 0) {
                throw new InsufficientStockException("Insufficient stock available for product: " + product.getTitle() +
                        ". Requested: " + itemReq.getQuantity() + ", Available: " + product.getStock());
            }

            // Calculate authoritative price strictly from database entity
            BigDecimal unitPrice = product.getPrice().setScale(2, RoundingMode.HALF_UP);
            BigDecimal itemSubtotal = unitPrice.multiply(BigDecimal.valueOf(itemReq.getQuantity())).setScale(2, RoundingMode.HALF_UP);
            subtotal = subtotal.add(itemSubtotal);

            itemDrafts.add(new OrderItemDraft(product, unitPrice, itemReq.getQuantity(), itemSubtotal));
        }

        // 5. Coupon Validation and Reservation
        Coupon coupon = null;
        BigDecimal discountAmount = BigDecimal.ZERO;
        if (request.getCouponCode() != null && !request.getCouponCode().trim().isBlank()) {
            String code = request.getCouponCode().trim().toUpperCase();
            coupon = couponRepository.findByCodeIgnoreCase(code)
                    .orElseThrow(() -> new InvalidCouponException("Coupon '" + code + "' not found"));

            if (!coupon.isActive()) {
                throw new InvalidCouponException("Coupon '" + code + "' is inactive");
            }
            if (coupon.isExpired()) {
                throw new InvalidCouponException("Coupon '" + code + "' has expired");
            }
            if (coupon.isExhausted()) {
                throw new InvalidCouponException("Coupon '" + code + "' has reached its usage limit");
            }
            if (subtotal.compareTo(coupon.getMinOrderValue()) < 0) {
                throw new InvalidCouponException("Order subtotal of $" + subtotal +
                        " does not meet minimum order value of $" + coupon.getMinOrderValue());
            }

            // Atomically reserve coupon usage limit
            couponService.reserveCouponUsage(coupon);
            discountAmount = couponService.calculateDiscount(coupon, subtotal);
        }

        BigDecimal totalAmount = subtotal.subtract(discountAmount).max(BigDecimal.ZERO).setScale(2, RoundingMode.HALF_UP);

        // 6. Build and save Order
        String orderNumber = "ORD-" + System.currentTimeMillis() + "-" + UUID.randomUUID().toString().substring(0, 6).toUpperCase();

        Order order = Order.builder()
                .orderNumber(orderNumber)
                .user(user)
                .status(OrderStatus.PLACED)
                .subtotal(subtotal)
                .discountAmount(discountAmount)
                .totalAmount(totalAmount)
                .coupon(coupon)
                .idempotencyKey(cleanIdempotencyKey)
                .shippingAddress(request.getShippingAddress().trim())
                .items(new ArrayList<>())
                .statusHistory(new ArrayList<>())
                .build();

        Order savedOrder;
        try {
            savedOrder = orderRepository.save(order);
        } catch (DataIntegrityViolationException ex) {
            // Concurrent duplicate idempotency key race: return existing order
            return orderRepository.findByUserIdAndIdempotencyKey(user.getId(), cleanIdempotencyKey)
                    .map(OrderDto::fromEntity)
                    .orElseThrow(() -> ex);
        }

        // Save order items
        for (OrderItemDraft draft : itemDrafts) {
            OrderItem orderItem = OrderItem.builder()
                    .order(savedOrder)
                    .product(draft.product)
                    .productTitle(draft.product.getTitle())
                    .unitPrice(draft.unitPrice)
                    .quantity(draft.quantity)
                    .subtotal(draft.subtotal)
                    .build();
            OrderItem savedItem = orderItemRepository.save(orderItem);
            savedOrder.getItems().add(savedItem);
        }

        // 7. Audit History
        OrderStatusHistory history = OrderStatusHistory.builder()
                .order(savedOrder)
                .previousStatus(null)
                .newStatus(OrderStatus.PLACED)
                .changedBy(user.getEmail())
                .reason("Order created successfully via checkout")
                .build();
        statusHistoryRepository.save(history);
        savedOrder.getStatusHistory().add(history);

        // 8. Clear customer's persistent shopping cart if items came from cart
        if (request.getItems() == null || request.getItems().isEmpty()) {
            cartRepository.findByUserId(user.getId()).ifPresent(cart -> {
                cart.getItems().clear();
                cartItemRepository.deleteByCartId(cart.getId());
            });
        }

        return OrderDto.fromEntity(savedOrder);
    }

    private List<CheckoutItemRequest> resolveCheckoutItems(User user, CheckoutRequest request) {
        if (request.getItems() != null && !request.getItems().isEmpty()) {
            return request.getItems();
        }

        // Fallback: Read items from user's persistent cart
        Cart cart = cartRepository.findByUserIdWithItems(user.getId()).orElse(null);
        if (cart == null || cart.getItems().isEmpty()) {
            return Collections.emptyList();
        }

        return cart.getItems().stream()
                .map(item -> CheckoutItemRequest.builder()
                        .productId(item.getProduct().getId())
                        .quantity(item.getQuantity())
                        .build())
                .collect(Collectors.toList());
    }

    /**
     * MOCK PAYMENT EXECUTION
     * Demonstrates reliable state transition and inventory compensation.
     */
    @Transactional
    public MockPaymentResponse processMockPayment(User user, MockPaymentRequest request) {
        Order order = orderRepository.findByIdWithDetails(request.getOrderId())
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with id: " + request.getOrderId()));

        if (!order.getUser().getId().equals(user.getId()) && user.getRole() != com.ascendion.shopsphere.user.entity.Role.ROLE_ADMIN) {
            throw new org.springframework.security.access.AccessDeniedException("You do not have permission to pay for this order");
        }

        if (order.getStatus() != OrderStatus.PLACED) {
            throw new BadRequestException("Order is currently in " + order.getStatus() + " status and cannot be paid");
        }

        if (request.getAction() == MockPaymentRequest.PaymentSimulationAction.SIMULATE_SUCCESS) {
            UpdateOrderStatusRequest updateReq = UpdateOrderStatusRequest.builder()
                    .newStatus(OrderStatus.PAID)
                    .reason("Mock payment simulated successfully")
                    .build();
            OrderDto updatedOrder = orderService.updateOrderStatus(order.getId(), updateReq, user.getEmail());
            return MockPaymentResponse.builder()
                    .paymentSuccessful(true)
                    .orderId(order.getId())
                    .orderNumber(order.getOrderNumber())
                    .orderStatus(OrderStatus.PAID)
                    .message("Payment completed successfully. Order moved to PAID status.")
                    .order(updatedOrder)
                    .build();
        } else {
            UpdateOrderStatusRequest updateReq = UpdateOrderStatusRequest.builder()
                    .newStatus(OrderStatus.PAYMENT_FAILED)
                    .reason("Mock payment simulation triggered failure. Stock restored.")
                    .build();
            OrderDto updatedOrder = orderService.updateOrderStatus(order.getId(), updateReq, user.getEmail());
            return MockPaymentResponse.builder()
                    .paymentSuccessful(false)
                    .orderId(order.getId())
                    .orderNumber(order.getOrderNumber())
                    .orderStatus(OrderStatus.PAYMENT_FAILED)
                    .message("Payment failed. Reserved stock and coupon usage have been safely restored.")
                    .order(updatedOrder)
                    .build();
        }
    }

    private record OrderItemDraft(Product product, BigDecimal unitPrice, int quantity, BigDecimal subtotal) {}
}

