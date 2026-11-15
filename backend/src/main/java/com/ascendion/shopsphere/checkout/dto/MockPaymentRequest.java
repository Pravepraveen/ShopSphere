package com.ascendion.shopsphere.checkout.dto;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MockPaymentRequest {

    @NotNull(message = "Order ID is required")
    private Long orderId;

    @NotNull(message = "Payment action is required (SIMULATE_SUCCESS or SIMULATE_FAILURE)")
    private PaymentSimulationAction action;

    public enum PaymentSimulationAction {
        SIMULATE_SUCCESS,
        SIMULATE_FAILURE
    }
}

