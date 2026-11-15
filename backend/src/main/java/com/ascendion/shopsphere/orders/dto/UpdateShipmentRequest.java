package com.ascendion.shopsphere.orders.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdateShipmentRequest {
    private String carrier;
    private String trackingNumber;
    private String estimatedDelivery;
    private String shippingNotes;
    private String shippingAddress;
}

