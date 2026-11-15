package com.ascendion.shopsphere.checkout.controller;

import com.ascendion.shopsphere.auth.service.AuthService;
import com.ascendion.shopsphere.checkout.dto.CheckoutRequest;
import com.ascendion.shopsphere.checkout.dto.MockPaymentRequest;
import com.ascendion.shopsphere.checkout.dto.MockPaymentResponse;
import com.ascendion.shopsphere.checkout.service.CheckoutService;
import com.ascendion.shopsphere.common.response.ApiResponse;
import com.ascendion.shopsphere.orders.dto.OrderDto;
import com.ascendion.shopsphere.user.entity.User;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/checkout")
@RequiredArgsConstructor
@Tag(name = "Checkout & Payment", description = "High-concurrency checkout and mock payment processing")
public class CheckoutController {

    private final CheckoutService checkoutService;
    private final AuthService authService;

    @PostMapping
    @Operation(summary = "Execute atomic checkout with mandatory Idempotency-Key header")
    public ResponseEntity<ApiResponse<OrderDto>> checkout(
            @RequestHeader(value = "Idempotency-Key", required = false) String idempotencyKey,
            @Valid @RequestBody CheckoutRequest request
    ) {
        User currentUser = authService.getCurrentAuthenticatedUser();
        OrderDto order = checkoutService.executeCheckout(currentUser, idempotencyKey, request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Order placed successfully", order));
    }

    @PostMapping("/mock-payment")
    @Operation(summary = "Simulate payment outcome (Success or Failure with stock restoration)")
    public ResponseEntity<ApiResponse<MockPaymentResponse>> mockPayment(
            @Valid @RequestBody MockPaymentRequest request
    ) {
        User currentUser = authService.getCurrentAuthenticatedUser();
        MockPaymentResponse response = checkoutService.processMockPayment(currentUser, request);
        return ResponseEntity.ok(ApiResponse.success(response.getMessage(), response));
    }
}

