package com.ascendion.shopsphere.admin.controller;

import com.ascendion.shopsphere.auth.service.AuthService;
import com.ascendion.shopsphere.catalog.category.CategoryDto;
import com.ascendion.shopsphere.catalog.category.CategoryService;
import com.ascendion.shopsphere.catalog.product.ProductCreateRequest;
import com.ascendion.shopsphere.catalog.product.ProductDto;
import com.ascendion.shopsphere.catalog.product.ProductSearchCriteria;
import com.ascendion.shopsphere.catalog.product.ProductService;
import com.ascendion.shopsphere.common.response.ApiResponse;
import com.ascendion.shopsphere.coupon.dto.CouponDto;
import com.ascendion.shopsphere.coupon.service.CouponService;
import com.ascendion.shopsphere.orders.dto.OrderDto;
import com.ascendion.shopsphere.orders.dto.UpdateOrderStatusRequest;
import com.ascendion.shopsphere.orders.service.OrderService;
import com.ascendion.shopsphere.user.entity.User;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/admin")
@RequiredArgsConstructor
@PreAuthorize("hasAuthority('ROLE_ADMIN')")
@Tag(name = "Administration", description = "Privileged administrator operations for catalog, orders, and promotions")
public class AdminController {

    private final ProductService productService;
    private final CategoryService categoryService;
    private final OrderService orderService;
    private final CouponService couponService;
    private final AuthService authService;
    private final com.ascendion.shopsphere.admin.service.AdminAnalyticsService analyticsService;

    // --- Executive Analytics & Intelligence ---

    @GetMapping("/analytics/dashboard")
    @Operation(summary = "Admin: Executive Sales & Inventory Intelligence Dashboard")
    public ResponseEntity<ApiResponse<com.ascendion.shopsphere.admin.dto.DashboardAnalyticsDto>> getDashboardAnalytics() {
        return ResponseEntity.ok(ApiResponse.success(analyticsService.getDashboardAnalytics()));
    }

    // --- User & Customer Directory Management ---

    @GetMapping("/users")
    @Operation(summary = "Admin: View customer directory with order activity metrics")
    public ResponseEntity<ApiResponse<List<com.ascendion.shopsphere.admin.dto.AdminUserDto>>> getAllUsers() {
        return ResponseEntity.ok(ApiResponse.success(analyticsService.getAllUsers()));
    }

    @PatchMapping("/users/{id}/toggle-status")
    @Operation(summary = "Admin: Enable or disable customer account access")
    public ResponseEntity<ApiResponse<com.ascendion.shopsphere.admin.dto.AdminUserDto>> toggleUserStatus(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success("User status toggled successfully", analyticsService.toggleUserStatus(id)));
    }

    // --- Product Management ---

    @GetMapping("/products")
    @Operation(summary = "Admin: View all products including inactive ones")
    public ResponseEntity<ApiResponse<Page<ProductDto>>> getAllProducts(
            @RequestParam(required = false) String query,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size
    ) {
        ProductSearchCriteria criteria = ProductSearchCriteria.builder()
                .query(query)
                .categoryId(categoryId)
                .activeOnly(false)
                .page(page)
                .size(size)
                .build();
        return ResponseEntity.ok(ApiResponse.success(productService.searchProducts(criteria)));
    }

    @PostMapping("/products")
    @Operation(summary = "Admin: Create a new catalog product")
    public ResponseEntity<ApiResponse<ProductDto>> createProduct(@Valid @RequestBody ProductCreateRequest request) {
        ProductDto created = productService.createProduct(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Product created successfully", created));
    }

    @PutMapping("/products/{id}")
    @Operation(summary = "Admin: Update an existing product")
    public ResponseEntity<ApiResponse<ProductDto>> updateProduct(
            @PathVariable Long id,
            @Valid @RequestBody ProductCreateRequest request
    ) {
        ProductDto updated = productService.updateProduct(id, request);
        return ResponseEntity.ok(ApiResponse.success("Product updated successfully", updated));
    }

    @DeleteMapping("/products/{id}")
    @Operation(summary = "Admin: Deactivate a product")
    public ResponseEntity<ApiResponse<String>> deactivateProduct(@PathVariable Long id) {
        productService.deleteOrDeactivateProduct(id);
        return ResponseEntity.ok(ApiResponse.success("Product deactivated successfully", "Product ID " + id + " is now inactive"));
    }

    @PatchMapping("/products/{id}/stock")
    @Operation(summary = "Admin: Quick update or adjust product stock inventory")
    public ResponseEntity<ApiResponse<ProductDto>> adjustStock(
            @PathVariable Long id,
            @RequestParam(required = false) Integer delta,
            @RequestParam(required = false) Integer stock
    ) {
        ProductDto updated;
        if (stock != null) {
            updated = productService.setStock(id, stock);
        } else if (delta != null) {
            updated = productService.adjustStock(id, delta);
        } else {
            throw new com.ascendion.shopsphere.common.exception.BadRequestException("Either 'stock' or 'delta' parameter must be provided");
        }
        return ResponseEntity.ok(ApiResponse.success("Stock inventory updated successfully", updated));
    }

    // --- Category Management ---

    @GetMapping("/categories")
    @Operation(summary = "Admin: View all categories")
    public ResponseEntity<ApiResponse<List<CategoryDto>>> getAllCategories() {
        return ResponseEntity.ok(ApiResponse.success(categoryService.getAllCategories()));
    }

    @PostMapping("/categories")
    @Operation(summary = "Admin: Create a product category")
    public ResponseEntity<ApiResponse<CategoryDto>> createCategory(@Valid @RequestBody CategoryDto request) {
        CategoryDto created = categoryService.createCategory(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Category created successfully", created));
    }

    // --- Order Management ---

    @GetMapping("/orders")
    @Operation(summary = "Admin: View all customer orders")
    public ResponseEntity<ApiResponse<List<OrderDto>>> getAllOrders() {
        return ResponseEntity.ok(ApiResponse.success(orderService.getAllOrdersForAdmin()));
    }

    @PatchMapping("/orders/{id}/status")
    @Operation(summary = "Admin: Advance order status through verified state machine transitions")
    public ResponseEntity<ApiResponse<OrderDto>> updateOrderStatus(
            @PathVariable Long id,
            @Valid @RequestBody UpdateOrderStatusRequest request
    ) {
        User adminUser = authService.getCurrentAuthenticatedUser();
        OrderDto updated = orderService.updateOrderStatus(id, request, adminUser.getEmail());
        return ResponseEntity.ok(ApiResponse.success("Order status transitioned to " + request.getNewStatus(), updated));
    }

    @PatchMapping("/orders/{id}/shipment")
    @Operation(summary = "Admin: Update courier tracking number, carrier name and dispatch details")
    public ResponseEntity<ApiResponse<OrderDto>> updateShipmentDetails(
            @PathVariable Long id,
            @RequestBody com.ascendion.shopsphere.orders.dto.UpdateShipmentRequest request
    ) {
        User adminUser = authService.getCurrentAuthenticatedUser();
        OrderDto updated = orderService.updateShipmentDetails(id, request, adminUser.getEmail());
        return ResponseEntity.ok(ApiResponse.success("Shipment tracking details saved successfully", updated));
    }

    // --- Coupon Management ---

    @GetMapping("/coupons")
    @Operation(summary = "Admin: View all coupons and usage statistics")
    public ResponseEntity<ApiResponse<List<CouponDto>>> getAllCoupons() {
        return ResponseEntity.ok(ApiResponse.success(couponService.getAllCoupons()));
    }

    @PostMapping("/coupons")
    @Operation(summary = "Admin: Create a promotional coupon")
    public ResponseEntity<ApiResponse<CouponDto>> createCoupon(@Valid @RequestBody CouponDto request) {
        CouponDto created = couponService.createCoupon(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Coupon created successfully", created));
    }

    @PutMapping("/coupons/{id}")
    @Operation(summary = "Admin: Update coupon rules and limits")
    public ResponseEntity<ApiResponse<CouponDto>> updateCoupon(
            @PathVariable Long id,
            @Valid @RequestBody CouponDto request
    ) {
        CouponDto updated = couponService.updateCoupon(id, request);
        return ResponseEntity.ok(ApiResponse.success("Coupon updated successfully", updated));
    }
}

