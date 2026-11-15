package com.ascendion.shopsphere.admin.service;

import com.ascendion.shopsphere.admin.dto.AdminUserDto;
import com.ascendion.shopsphere.admin.dto.DashboardAnalyticsDto;
import com.ascendion.shopsphere.catalog.product.Product;
import com.ascendion.shopsphere.catalog.product.ProductDto;
import com.ascendion.shopsphere.catalog.product.ProductRepository;
import com.ascendion.shopsphere.orders.dto.OrderDto;
import com.ascendion.shopsphere.orders.entity.Order;
import com.ascendion.shopsphere.orders.entity.OrderItem;
import com.ascendion.shopsphere.orders.entity.OrderStatus;
import com.ascendion.shopsphere.orders.repository.OrderItemRepository;
import com.ascendion.shopsphere.orders.repository.OrderRepository;
import com.ascendion.shopsphere.user.entity.Role;
import com.ascendion.shopsphere.user.entity.User;
import com.ascendion.shopsphere.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AdminAnalyticsService {

    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public DashboardAnalyticsDto getDashboardAnalytics() {
        List<Order> allOrders = orderRepository.findAllWithDetails();

        // 1. Total Revenue: Sum totalAmount of all valid completed/paid orders
        Set<OrderStatus> paidStatuses = Set.of(
                OrderStatus.PAID,
                OrderStatus.PACKED,
                OrderStatus.SHIPPED,
                OrderStatus.DELIVERED
        );

        BigDecimal totalRevenue = allOrders.stream()
                .filter(o -> paidStatuses.contains(o.getStatus()))
                .map(Order::getTotalAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        // 2. Order counts by status
        Map<String, Long> ordersByStatus = new HashMap<>();
        for (OrderStatus status : OrderStatus.values()) {
            ordersByStatus.put(status.name(), 0L);
        }
        for (Order o : allOrders) {
            ordersByStatus.compute(o.getStatus().name(), (k, v) -> (v == null) ? 1L : v + 1L);
        }

        // 3. User & Product Counts
        long totalCustomers = userRepository.countByRole(Role.ROLE_CUSTOMER);
        long totalProducts = productRepository.count();
        long lowStockCount = productRepository.countByStockLessThanEqual(5);
        long outOfStockCount = productRepository.countByStock(0);

        // 4. Low stock products (stock <= 10)
        List<ProductDto> lowStockProducts = productRepository.findByStockLessThanEqualOrderByStockAsc(10).stream()
                .limit(10)
                .map(ProductDto::fromEntity)
                .collect(Collectors.toList());

        // 5. Recent orders (latest 8)
        List<OrderDto> recentOrders = allOrders.stream()
                .limit(8)
                .map(OrderDto::fromEntity)
                .collect(Collectors.toList());

        // 6. Top Selling Products
        List<OrderItem> allItems = orderItemRepository.findAll();
        Map<Long, List<OrderItem>> itemsByProduct = allItems.stream()
                .collect(Collectors.groupingBy(item -> item.getProduct().getId()));

        List<DashboardAnalyticsDto.TopSellingProductDto> topSellingProducts = itemsByProduct.entrySet().stream()
                .map(entry -> {
                    Long prodId = entry.getKey();
                    List<OrderItem> items = entry.getValue();
                    Product prod = items.get(0).getProduct();
                    long unitsSold = items.stream().mapToLong(OrderItem::getQuantity).sum();
                    BigDecimal productRevenue = items.stream()
                            .map(OrderItem::getSubtotal)
                            .reduce(BigDecimal.ZERO, BigDecimal::add);

                    return DashboardAnalyticsDto.TopSellingProductDto.builder()
                            .productId(prodId)
                            .title(prod.getTitle())
                            .sku(prod.getSku())
                            .imageUrl(prod.getImageUrl())
                            .price(prod.getPrice())
                            .unitsSold(unitsSold)
                            .totalRevenue(productRevenue)
                            .currentStock(prod.getStock())
                            .build();
                })
                .sorted((a, b) -> Long.compare(b.getUnitsSold(), a.getUnitsSold()))
                .limit(5)
                .collect(Collectors.toList());

        // 7. Daily sales trend (last 7 days)
        Map<LocalDate, List<Order>> ordersByDate = allOrders.stream()
                .filter(o -> paidStatuses.contains(o.getStatus()) && o.getCreatedAt() != null)
                .collect(Collectors.groupingBy(o -> o.getCreatedAt().toLocalDate()));

        DateTimeFormatter dtf = DateTimeFormatter.ofPattern("MMM dd");
        List<DashboardAnalyticsDto.DailySalesDto> salesTrend = new ArrayList<>();
        LocalDate today = LocalDate.now();
        for (int i = 6; i >= 0; i--) {
            LocalDate d = today.minusDays(i);
            List<Order> dayOrders = ordersByDate.getOrDefault(d, Collections.emptyList());
            BigDecimal dayRev = dayOrders.stream().map(Order::getTotalAmount).reduce(BigDecimal.ZERO, BigDecimal::add);
            salesTrend.add(DashboardAnalyticsDto.DailySalesDto.builder()
                    .date(d.format(dtf))
                    .revenue(dayRev)
                    .orderCount(dayOrders.size())
                    .build());
        }

        return DashboardAnalyticsDto.builder()
                .totalRevenue(totalRevenue)
                .totalOrders(allOrders.size())
                .totalCustomers(totalCustomers)
                .totalProducts(totalProducts)
                .lowStockCount(lowStockCount)
                .outOfStockCount(outOfStockCount)
                .ordersByStatus(ordersByStatus)
                .topSellingProducts(topSellingProducts)
                .lowStockProducts(lowStockProducts)
                .recentOrders(recentOrders)
                .salesTrend(salesTrend)
                .build();
    }

    @Transactional(readOnly = true)
    public List<AdminUserDto> getAllUsers() {
        List<User> users = userRepository.findAll();
        List<Order> orders = orderRepository.findAllWithDetails();

        Map<Long, List<Order>> ordersByUser = orders.stream()
                .collect(Collectors.groupingBy(o -> o.getUser().getId()));

        return users.stream().map(u -> {
            List<Order> userOrders = ordersByUser.getOrDefault(u.getId(), Collections.emptyList());
            BigDecimal totalSpent = userOrders.stream()
                    .filter(o -> o.getStatus() != OrderStatus.CANCELLED && o.getStatus() != OrderStatus.PAYMENT_FAILED)
                    .map(Order::getTotalAmount)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);

            return AdminUserDto.builder()
                    .id(u.getId())
                    .email(u.getEmail())
                    .firstName(u.getFirstName())
                    .lastName(u.getLastName())
                    .role(u.getRole())
                    .enabled(u.isEnabled())
                    .createdAt(u.getCreatedAt())
                    .orderCount(userOrders.size())
                    .totalSpent(totalSpent)
                    .build();
        }).collect(Collectors.toList());
    }

    @Transactional
    public AdminUserDto toggleUserStatus(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new com.ascendion.shopsphere.common.exception.ResourceNotFoundException("User not found with id: " + userId));

        if (user.getRole() == Role.ROLE_ADMIN) {
            throw new com.ascendion.shopsphere.common.exception.BadRequestException("Cannot disable administrator accounts");
        }

        user.setEnabled(!user.isEnabled());
        User saved = userRepository.save(user);

        return AdminUserDto.builder()
                .id(saved.getId())
                .email(saved.getEmail())
                .firstName(saved.getFirstName())
                .lastName(saved.getLastName())
                .role(saved.getRole())
                .enabled(saved.isEnabled())
                .createdAt(saved.getCreatedAt())
                .build();
    }
}

