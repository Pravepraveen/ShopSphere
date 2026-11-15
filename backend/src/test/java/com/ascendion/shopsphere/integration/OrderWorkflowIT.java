package com.ascendion.shopsphere.integration;

import com.ascendion.shopsphere.catalog.category.Category;
import com.ascendion.shopsphere.catalog.category.CategoryRepository;
import com.ascendion.shopsphere.catalog.product.Product;
import com.ascendion.shopsphere.catalog.product.ProductRepository;
import com.ascendion.shopsphere.checkout.dto.CheckoutItemRequest;
import com.ascendion.shopsphere.checkout.dto.CheckoutRequest;
import com.ascendion.shopsphere.checkout.dto.MockPaymentRequest;
import com.ascendion.shopsphere.checkout.dto.MockPaymentResponse;
import com.ascendion.shopsphere.checkout.service.CheckoutService;
import com.ascendion.shopsphere.orders.dto.OrderDto;
import com.ascendion.shopsphere.orders.dto.UpdateOrderStatusRequest;
import com.ascendion.shopsphere.orders.entity.OrderStatus;
import com.ascendion.shopsphere.orders.service.OrderService;
import com.ascendion.shopsphere.user.entity.Role;
import com.ascendion.shopsphere.user.entity.User;
import com.ascendion.shopsphere.user.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
@ActiveProfiles("test")
public class OrderWorkflowIT {

    @Autowired
    private CheckoutService checkoutService;

    @Autowired
    private OrderService orderService;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private UserRepository userRepository;

    private User customer;
    private User admin;
    private Product product;

    @BeforeEach
    void setUp() {
        Category category = categoryRepository.findAll().stream().findFirst().orElseGet(() ->
                categoryRepository.save(Category.builder().name("WorkflowCat").slug("workflowcat").build())
        );

        customer = userRepository.findByEmail("workflow_cust@test.com").orElseGet(() ->
                userRepository.save(User.builder()
                        .email("workflow_cust@test.com")
                        .password("pass")
                        .firstName("Workflow")
                        .lastName("Customer")
                        .role(Role.ROLE_CUSTOMER)
                        .build())
        );

        admin = userRepository.findByEmail("workflow_admin@test.com").orElseGet(() ->
                userRepository.save(User.builder()
                        .email("workflow_admin@test.com")
                        .password("pass")
                        .firstName("Admin")
                        .lastName("Boss")
                        .role(Role.ROLE_ADMIN)
                        .build())
        );

        product = productRepository.save(Product.builder()
                .sku("WORKFLOW-SKU-" + UUID.randomUUID().toString().substring(0, 8))
                .title("Smart Fitness Tracker")
                .price(new BigDecimal("89.99"))
                .stock(5)
                .category(category)
                .active(true)
                .build());
    }

    @Test
    @DisplayName("Complete Order Lifecycle: PLACED -> PAID -> PACKED -> SHIPPED -> DELIVERED")
    void testCompleteOrderLifecycle() {
        // 1. Checkout
        CheckoutRequest req = CheckoutRequest.builder()
                .shippingAddress("789 Pine St, Seattle, WA")
                .items(List.of(CheckoutItemRequest.builder().productId(product.getId()).quantity(1).build()))
                .build();

        OrderDto order = checkoutService.executeCheckout(customer, "IDEM-WF-" + UUID.randomUUID(), req);
        assertThat(order.getStatus()).isEqualTo(OrderStatus.PLACED);

        // 2. Mock Payment Success
        MockPaymentRequest payReq = MockPaymentRequest.builder()
                .orderId(order.getId())
                .action(MockPaymentRequest.PaymentSimulationAction.SIMULATE_SUCCESS)
                .build();
        MockPaymentResponse payRes = checkoutService.processMockPayment(customer, payReq);
        assertThat(payRes.isPaymentSuccessful()).isTrue();
        assertThat(payRes.getOrderStatus()).isEqualTo(OrderStatus.PAID);

        // 3. Admin advances to PACKED
        OrderDto packedOrder = orderService.updateOrderStatus(order.getId(),
                UpdateOrderStatusRequest.builder().newStatus(OrderStatus.PACKED).reason("Items boxed in warehouse").build(),
                admin.getEmail());
        assertThat(packedOrder.getStatus()).isEqualTo(OrderStatus.PACKED);

        // 4. Admin advances to SHIPPED
        OrderDto shippedOrder = orderService.updateOrderStatus(order.getId(),
                UpdateOrderStatusRequest.builder().newStatus(OrderStatus.SHIPPED).reason("Dispatched via express freight").build(),
                admin.getEmail());
        assertThat(shippedOrder.getStatus()).isEqualTo(OrderStatus.SHIPPED);

        // 5. Admin advances to DELIVERED
        OrderDto deliveredOrder = orderService.updateOrderStatus(order.getId(),
                UpdateOrderStatusRequest.builder().newStatus(OrderStatus.DELIVERED).reason("Delivered to customer front door").build(),
                admin.getEmail());
        assertThat(deliveredOrder.getStatus()).isEqualTo(OrderStatus.DELIVERED);

        // Check audit trail
        OrderDto reloaded = orderService.getOrderById(order.getId(), customer);
        assertThat(reloaded.getStatusHistory()).hasSize(5); // PLACED, PAID, PACKED, SHIPPED, DELIVERED
    }

    @Test
    @DisplayName("Mock Payment Failure Compensation: Stock is safely restored to original count")
    void testPaymentFailureStockRestoration() {
        int initialStock = product.getStock(); // 5

        CheckoutRequest req = CheckoutRequest.builder()
                .shippingAddress("321 Elm St, Austin, TX")
                .items(List.of(CheckoutItemRequest.builder().productId(product.getId()).quantity(2).build()))
                .build();

        OrderDto order = checkoutService.executeCheckout(customer, "IDEM-FAIL-" + UUID.randomUUID(), req);
        assertThat(order.getStatus()).isEqualTo(OrderStatus.PLACED);

        // Verify stock was decremented (5 - 2 = 3)
        Product decremented = productRepository.findById(product.getId()).orElseThrow();
        assertThat(decremented.getStock()).isEqualTo(initialStock - 2);

        // Simulate payment failure
        MockPaymentRequest payReq = MockPaymentRequest.builder()
                .orderId(order.getId())
                .action(MockPaymentRequest.PaymentSimulationAction.SIMULATE_FAILURE)
                .build();
        MockPaymentResponse payRes = checkoutService.processMockPayment(customer, payReq);

        assertThat(payRes.isPaymentSuccessful()).isFalse();
        assertThat(payRes.getOrderStatus()).isEqualTo(OrderStatus.PAYMENT_FAILED);

        // Verify stock has been fully and safely restored (3 + 2 = 5)
        Product restoredProduct = productRepository.findById(product.getId()).orElseThrow();
        assertThat(restoredProduct.getStock()).as("Stock must be restored back to initial level after payment failure")
                .isEqualTo(initialStock);
    }
}

