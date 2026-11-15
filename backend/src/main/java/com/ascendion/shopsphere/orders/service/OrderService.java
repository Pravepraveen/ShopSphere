package com.ascendion.shopsphere.orders.service;

import com.ascendion.shopsphere.catalog.product.ProductRepository;
import org.springframework.security.access.AccessDeniedException;
import com.ascendion.shopsphere.common.exception.ResourceNotFoundException;
import com.ascendion.shopsphere.coupon.service.CouponService;
import com.ascendion.shopsphere.orders.dto.OrderDto;
import com.ascendion.shopsphere.orders.dto.UpdateOrderStatusRequest;
import com.ascendion.shopsphere.orders.entity.Order;
import com.ascendion.shopsphere.orders.entity.OrderItem;
import com.ascendion.shopsphere.orders.entity.OrderStatus;
import com.ascendion.shopsphere.orders.entity.OrderStatusHistory;
import com.ascendion.shopsphere.orders.repository.OrderRepository;
import com.ascendion.shopsphere.orders.repository.OrderStatusHistoryRepository;
import com.ascendion.shopsphere.orders.state.OrderStateMachine;
import com.ascendion.shopsphere.user.entity.Role;
import com.ascendion.shopsphere.user.entity.User;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class OrderService {

    private final OrderRepository orderRepository;
    private final OrderStatusHistoryRepository statusHistoryRepository;
    private final ProductRepository productRepository;
    private final CouponService couponService;
    private final OrderStateMachine orderStateMachine;

    @Transactional(readOnly = true)
    public List<OrderDto> getCustomerOrders(User user) {
        return orderRepository.findByUserIdWithDetails(user.getId()).stream()
                .map(OrderDto::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public OrderDto getOrderById(Long orderId, User user) {
        Order order = orderRepository.findByIdWithDetails(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with id: " + orderId));

        // Enforce privacy: non-admin users can ONLY access their own orders
        if (user.getRole() != Role.ROLE_ADMIN && !order.getUser().getId().equals(user.getId())) {
            throw new org.springframework.security.access.AccessDeniedException("You do not have permission to view this order");
        }

        return OrderDto.fromEntity(order);
    }

    @Transactional(readOnly = true)
    public List<OrderDto> getAllOrdersForAdmin() {
        return orderRepository.findAllWithDetails().stream()
                .map(OrderDto::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional
    public OrderDto updateOrderStatus(Long orderId, UpdateOrderStatusRequest request, String changedBy) {
        Order order = orderRepository.findByIdWithDetails(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with id: " + orderId));

        OrderStatus currentStatus = order.getStatus();
        OrderStatus newStatus = request.getNewStatus();

        // Validate state machine transition
        orderStateMachine.validateTransition(currentStatus, newStatus);

        if (currentStatus == newStatus) {
            return OrderDto.fromEntity(order);
        }

        // If transitioning to failure or cancellation, restore reserved stock and coupon
        if (orderStateMachine.requiresStockRestoration(currentStatus, newStatus)) {
            restoreOrderStockAndCoupon(order);
        }

        order.setStatus(newStatus);
        Order savedOrder = orderRepository.save(order);

        // Record audit history
        OrderStatusHistory history = OrderStatusHistory.builder()
                .order(savedOrder)
                .previousStatus(currentStatus)
                .newStatus(newStatus)
                .changedBy(changedBy)
                .reason(request.getReason() != null ? request.getReason() : "Status updated to " + newStatus)
                .build();
        statusHistoryRepository.save(history);
        savedOrder.getStatusHistory().add(history);

        return OrderDto.fromEntity(savedOrder);
    }

    @Transactional
    public OrderDto cancelCustomerOrder(Long orderId, User user, String reason) {
        Order order = orderRepository.findByIdWithDetails(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with id: " + orderId));

        if (!order.getUser().getId().equals(user.getId()) && user.getRole() != Role.ROLE_ADMIN) {
            throw new AccessDeniedException("You do not have permission to cancel this order");
        }

        if (order.getStatus() != OrderStatus.PLACED && order.getStatus() != OrderStatus.PAID) {
            throw new com.ascendion.shopsphere.common.exception.BadRequestException(
                    "Orders in status '" + order.getStatus() + "' cannot be cancelled. Only PLACED or PAID orders can be cancelled.");
        }

        UpdateOrderStatusRequest req = new UpdateOrderStatusRequest();
        req.setNewStatus(OrderStatus.CANCELLED);
        req.setReason(reason != null && !reason.isBlank() ? reason : "Cancelled by customer");
        return updateOrderStatus(orderId, req, user.getEmail());
    }

    @Transactional
    public OrderDto updateShipmentDetails(Long orderId, com.ascendion.shopsphere.orders.dto.UpdateShipmentRequest request, String changedBy) {
        Order order = orderRepository.findByIdWithDetails(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with id: " + orderId));

        if (request.getCarrier() != null) order.setCarrier(request.getCarrier().trim());
        if (request.getTrackingNumber() != null) order.setTrackingNumber(request.getTrackingNumber().trim());
        if (request.getEstimatedDelivery() != null) order.setEstimatedDelivery(request.getEstimatedDelivery().trim());
        if (request.getShippingNotes() != null) order.setShippingNotes(request.getShippingNotes().trim());
        if (request.getShippingAddress() != null && !request.getShippingAddress().isBlank()) {
            order.setShippingAddress(request.getShippingAddress().trim());
        }

        Order saved = orderRepository.save(order);

        // Record audit trail event
        OrderStatusHistory history = OrderStatusHistory.builder()
                .order(saved)
                .previousStatus(saved.getStatus())
                .newStatus(saved.getStatus())
                .changedBy(changedBy)
                .reason("Shipment info updated: Carrier: " + saved.getCarrier() + ", Tracking: " + saved.getTrackingNumber())
                .build();
        statusHistoryRepository.save(history);
        saved.getStatusHistory().add(history);

        return OrderDto.fromEntity(saved);
    }

    @Transactional
    public void restoreOrderStockAndCoupon(Order order) {
        for (OrderItem item : order.getItems()) {
            productRepository.incrementStock(item.getProduct().getId(), item.getQuantity());
        }
        if (order.getCoupon() != null) {
            couponService.restoreCouponUsage(order.getCoupon().getId());
        }
    }
}
