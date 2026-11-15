package com.ascendion.shopsphere.admin.dto;

import com.ascendion.shopsphere.catalog.product.ProductDto;
import com.ascendion.shopsphere.orders.dto.OrderDto;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DashboardAnalyticsDto {
    private BigDecimal totalRevenue;
    private long totalOrders;
    private long totalCustomers;
    private long totalProducts;
    private long lowStockCount;
    private long outOfStockCount;
    private Map<String, Long> ordersByStatus;
    private List<TopSellingProductDto> topSellingProducts;
    private List<ProductDto> lowStockProducts;
    private List<OrderDto> recentOrders;
    private List<DailySalesDto> salesTrend;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TopSellingProductDto {
        private Long productId;
        private String title;
        private String sku;
        private String imageUrl;
        private BigDecimal price;
        private long unitsSold;
        private BigDecimal totalRevenue;
        private int currentStock;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DailySalesDto {
        private String date;
        private BigDecimal revenue;
        private long orderCount;
    }
}

