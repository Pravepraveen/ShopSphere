package com.ascendion.shopsphere.integration;

import com.ascendion.shopsphere.catalog.category.Category;
import com.ascendion.shopsphere.catalog.category.CategoryRepository;
import com.ascendion.shopsphere.catalog.product.Product;
import com.ascendion.shopsphere.catalog.product.ProductRepository;
import com.ascendion.shopsphere.checkout.dto.CheckoutItemRequest;
import com.ascendion.shopsphere.checkout.dto.CheckoutRequest;
import com.ascendion.shopsphere.checkout.service.CheckoutService;
import com.ascendion.shopsphere.orders.dto.OrderDto;
import com.ascendion.shopsphere.orders.repository.OrderRepository;
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
public class IdempotencyIT {

    @Autowired
    private CheckoutService checkoutService;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private OrderRepository orderRepository;

    private User customer;
    private Product product;

    @BeforeEach
    void setUp() {
        Category category = categoryRepository.findAll().stream().findFirst().orElseGet(() ->
                categoryRepository.save(Category.builder().name("IdemCat").slug("idemcat").build())
        );

        customer = userRepository.findByEmail("idem_customer@test.com").orElseGet(() ->
                userRepository.save(User.builder()
                        .email("idem_customer@test.com")
                        .password("pass")
                        .firstName("Idem")
                        .lastName("Tester")
                        .role(Role.ROLE_CUSTOMER)
                        .build())
        );

        product = productRepository.save(Product.builder()
                .sku("IDEM-SKU-" + UUID.randomUUID().toString().substring(0, 8))
                .title("Mechanical Keyboard")
                .price(new BigDecimal("120.00"))
                .stock(10)
                .category(category)
                .active(true)
                .build());
    }

    @Test
    @DisplayName("IDEMPOTENCY INVARIANT: Repeating checkout with same Idempotency-Key returns existing order and does not deduct stock twice")
    void testRepeatedCheckoutWithSameKey() {
        String idempotencyKey = "IDEM-KEY-" + UUID.randomUUID();

        CheckoutRequest request = CheckoutRequest.builder()
                .shippingAddress("456 Market St, San Francisco, CA")
                .items(List.of(CheckoutItemRequest.builder().productId(product.getId()).quantity(2).build()))
                .build();

        // First attempt
        OrderDto firstOrder = checkoutService.executeCheckout(customer, idempotencyKey, request);
        assertThat(firstOrder).isNotNull();
        assertThat(firstOrder.getId()).isNotNull();

        // Check stock after first order (10 - 2 = 8)
        Product productAfterFirst = productRepository.findById(product.getId()).orElseThrow();
        assertThat(productAfterFirst.getStock()).isEqualTo(8);

        // Second attempt with exact same Idempotency-Key
        OrderDto secondOrder = checkoutService.executeCheckout(customer, idempotencyKey, request);
        assertThat(secondOrder).isNotNull();

        // Must return the identical order
        assertThat(secondOrder.getId()).isEqualTo(firstOrder.getId());
        assertThat(secondOrder.getOrderNumber()).isEqualTo(firstOrder.getOrderNumber());

        // Stock must STILL be 8 (NOT 6!)
        Product productAfterSecond = productRepository.findById(product.getId()).orElseThrow();
        assertThat(productAfterSecond.getStock()).as("Stock must not be deducted twice on idempotent repeats").isEqualTo(8);
    }
}

