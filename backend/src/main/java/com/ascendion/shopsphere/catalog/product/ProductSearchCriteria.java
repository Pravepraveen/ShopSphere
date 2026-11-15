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
public class ProductSearchCriteria {
    private String query;
    private Long categoryId;
    private BigDecimal minPrice;
    private BigDecimal maxPrice;
    @Builder.Default
    private Boolean activeOnly = true;
    @Builder.Default
    private int page = 0;
    @Builder.Default
    private int size = 12;
    @Builder.Default
    private String sortBy = "id";
    @Builder.Default
    private String sortDirection = "ASC";
}

