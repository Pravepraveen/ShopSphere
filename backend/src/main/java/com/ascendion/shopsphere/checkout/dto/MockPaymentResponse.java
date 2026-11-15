package com.ascendion.shopsphere.checkout.dto;

import com.ascendion.shopsphere.orders.dto.OrderDto;
import com.ascendion.shopsphere.orders.entity.OrderStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MockPaymentResponse {
    private boolean paymentSuccessful;
    private Long orderId;
    private String orderNumber;
    private OrderStatus orderStatus;
    private String message;
    private OrderDto order;
}

