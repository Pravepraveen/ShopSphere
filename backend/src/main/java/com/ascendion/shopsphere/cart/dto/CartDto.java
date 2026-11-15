package com.ascendion.shopsphere.cart.dto;

import com.ascendion.shopsphere.cart.entity.Cart;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CartDto {
    private Long id;
    private Long userId;
    @Builder.Default
    private List<CartItemDto> items = new ArrayList<>();
    private int totalItems;
    private BigDecimal subtotal;

    public static CartDto fromEntity(Cart cart) {
        if (cart == null) {
            return CartDto.builder()
                    .items(new ArrayList<>())
                    .totalItems(0)
                    .subtotal(BigDecimal.ZERO)
                    .build();
        }

        List<CartItemDto> itemDtos = cart.getItems() != null
                ? cart.getItems().stream().map(CartItemDto::fromEntity).collect(Collectors.toList())
                : new ArrayList<>();

        int totalCount = itemDtos.stream().mapToInt(CartItemDto::getQuantity).sum();
        BigDecimal totalSum = itemDtos.stream()
                .map(CartItemDto::getItemSubtotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        return CartDto.builder()
                .id(cart.getId())
                .userId(cart.getUser() != null ? cart.getUser().getId() : null)
                .items(itemDtos)
                .totalItems(totalCount)
                .subtotal(totalSum)
                .build();
    }
}

