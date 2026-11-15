package com.ascendion.shopsphere.orders.dto;

import com.ascendion.shopsphere.orders.entity.Order;
import com.ascendion.shopsphere.orders.entity.OrderStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrderDto {
    private Long id;
    private String orderNumber;
    private Long userId;
    private String customerEmail;
    private String customerName;
    private OrderStatus status;
    private BigDecimal subtotal;
    private BigDecimal discountAmount;
    private BigDecimal totalAmount;
    private String couponCode;
    private String idempotencyKey;
    private String shippingAddress;
    private String carrier;
    private String trackingNumber;
    private String estimatedDelivery;
    private String shippingNotes;
    @Builder.Default
    private List<OrderItemDto> items = new ArrayList<>();
    @Builder.Default
    private List<OrderStatusHistoryDto> statusHistory = new ArrayList<>();
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static OrderDto fromEntity(Order order) {
        if (order == null) return null;

        List<OrderItemDto> itemDtos = order.getItems() != null
                ? order.getItems().stream().map(OrderItemDto::fromEntity).collect(Collectors.toList())
                : new ArrayList<>();

        List<OrderStatusHistoryDto> historyDtos = order.getStatusHistory() != null
                ? order.getStatusHistory().stream().map(OrderStatusHistoryDto::fromEntity).collect(Collectors.toList())
                : new ArrayList<>();

        return OrderDto.builder()
                .id(order.getId())
                .orderNumber(order.getOrderNumber())
                .userId(order.getUser() != null ? order.getUser().getId() : null)
                .customerEmail(order.getUser() != null ? order.getUser().getEmail() : null)
                .customerName(order.getUser() != null ? (order.getUser().getFirstName() + " " + order.getUser().getLastName()) : null)
                .status(order.getStatus())
                .subtotal(order.getSubtotal())
                .discountAmount(order.getDiscountAmount())
                .totalAmount(order.getTotalAmount())
                .couponCode(order.getCoupon() != null ? order.getCoupon().getCode() : null)
                .idempotencyKey(order.getIdempotencyKey())
                .shippingAddress(order.getShippingAddress())
                .carrier(order.getCarrier())
                .trackingNumber(order.getTrackingNumber())
                .estimatedDelivery(order.getEstimatedDelivery())
                .shippingNotes(order.getShippingNotes())
                .items(itemDtos)
                .statusHistory(historyDtos)
                .createdAt(order.getCreatedAt())
                .updatedAt(order.getUpdatedAt())
                .build();
    }
}

