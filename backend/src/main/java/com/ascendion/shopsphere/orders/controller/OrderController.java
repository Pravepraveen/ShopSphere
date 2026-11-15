package com.ascendion.shopsphere.orders.controller;

import com.ascendion.shopsphere.auth.service.AuthService;
import com.ascendion.shopsphere.common.response.ApiResponse;
import com.ascendion.shopsphere.orders.dto.OrderDto;
import com.ascendion.shopsphere.orders.service.OrderService;
import com.ascendion.shopsphere.user.entity.User;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/orders")
@RequiredArgsConstructor
@Tag(name = "Orders", description = "Customer order history and tracking")
public class OrderController {

    private final OrderService orderService;
    private final AuthService authService;

    @GetMapping("/me")
    @Operation(summary = "View order history for current customer")
    public ResponseEntity<ApiResponse<List<OrderDto>>> getMyOrders() {
        User currentUser = authService.getCurrentAuthenticatedUser();
        return ResponseEntity.ok(ApiResponse.success(orderService.getCustomerOrders(currentUser)));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get order details and status timeline by order ID")
    public ResponseEntity<ApiResponse<OrderDto>> getOrderById(@PathVariable Long id) {
        User currentUser = authService.getCurrentAuthenticatedUser();
        return ResponseEntity.ok(ApiResponse.success(orderService.getOrderById(id, currentUser)));
    }

    @PostMapping("/{id}/cancel")
    @Operation(summary = "Customer: Cancel an order that is in PLACED or PAID state")
    public ResponseEntity<ApiResponse<OrderDto>> cancelOrder(
            @PathVariable Long id,
            @RequestParam(required = false) String reason
    ) {
        User currentUser = authService.getCurrentAuthenticatedUser();
        OrderDto cancelled = orderService.cancelCustomerOrder(id, currentUser, reason);
        return ResponseEntity.ok(ApiResponse.success("Order cancelled successfully", cancelled));
    }
}

