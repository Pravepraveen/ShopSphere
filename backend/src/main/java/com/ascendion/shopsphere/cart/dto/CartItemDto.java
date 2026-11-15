package com.ascendion.shopsphere.cart.dto;

import com.ascendion.shopsphere.cart.entity.CartItem;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CartItemDto {
    private Long id;
    private Long productId;
    private String productSku;
    private String productTitle;
    private String productImageUrl;
    private BigDecimal unitPrice;
    private int quantity;
    private BigDecimal itemSubtotal;
    private int availableStock;

    public static CartItemDto fromEntity(CartItem item) {
        if (item == null) return null;
        BigDecimal price = item.getProduct().getPrice();
        BigDecimal subtotal = price.multiply(BigDecimal.valueOf(item.getQuantity()));
        return CartItemDto.builder()
                .id(item.getId())
                .productId(item.getProduct().getId())
                .productSku(item.getProduct().getSku())
                .productTitle(item.getProduct().getTitle())
                .productImageUrl(item.getProduct().getImageUrl())
                .unitPrice(price)
                .quantity(item.getQuantity())
                .itemSubtotal(subtotal)
                .availableStock(item.getProduct().getStock())
                .build();
    }
}

