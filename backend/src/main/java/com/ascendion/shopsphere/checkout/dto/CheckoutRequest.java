package com.ascendion.shopsphere.checkout.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CheckoutRequest {

    @NotBlank(message = "Shipping address is required")
    private String shippingAddress;

    private String couponCode;

    // Optional: if null or empty, checkout proceeds with items from the user's persistent cart
    private List<CheckoutItemRequest> items;
}

