package com.ascendion.shopsphere.catalog.product;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProductDto {
    private Long id;
    private String sku;
    private String title;
    private String description;
    private BigDecimal price;
    private int stock;
    private String imageUrl;
    private Long categoryId;
    private String categoryName;
    private boolean active;
    private Long version;

    public static ProductDto fromEntity(Product entity) {
        if (entity == null) return null;
        return ProductDto.builder()
                .id(entity.getId())
                .sku(entity.getSku())
                .title(entity.getTitle())
                .description(entity.getDescription())
                .price(entity.getPrice())
                .stock(entity.getStock())
                .imageUrl(entity.getImageUrl())
                .categoryId(entity.getCategory() != null ? entity.getCategory().getId() : null)
                .categoryName(entity.getCategory() != null ? entity.getCategory().getName() : null)
                .active(entity.isActive())
                .version(entity.getVersion())
                .build();
    }
}

