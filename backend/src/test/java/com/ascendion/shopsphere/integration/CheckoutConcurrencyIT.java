package com.ascendion.shopsphere.integration;

import com.ascendion.shopsphere.catalog.category.Category;
import com.ascendion.shopsphere.catalog.category.CategoryRepository;
import com.ascendion.shopsphere.catalog.product.Product;
import com.ascendion.shopsphere.catalog.product.ProductRepository;
import com.ascendion.shopsphere.checkout.dto.CheckoutItemRequest;
import com.ascendion.shopsphere.checkout.dto.CheckoutRequest;
import com.ascendion.shopsphere.checkout.service.CheckoutService;
import com.ascendion.shopsphere.common.exception.InsufficientStockException;
import com.ascendion.shopsphere.orders.dto.OrderDto;
import com.ascendion.shopsphere.orders.entity.Order;
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
import java.util.concurrent.*;
import java.util.concurrent.atomic.AtomicInteger;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
@ActiveProfiles("test")
public class CheckoutConcurrencyIT {

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

    @Autowired
    private com.ascendion.shopsphere.orders.repository.OrderItemRepository orderItemRepository;

    private User customerA;
    private User customerB;
    private Product scarceProduct;

    @BeforeEach
    void setUp() {
        Category category = categoryRepository.findAll().stream().findFirst().orElseGet(() ->
                categoryRepository.save(Category.builder().name("TestCat").slug("testcat").build())
        );

        customerA = userRepository.findByEmail("customer_a@test.com").orElseGet(() ->
                userRepository.save(User.builder()
                        .email("customer_a@test.com")
                        .password("pass")
                        .firstName("Alice")
                        .lastName("Smith")
                        .role(Role.ROLE_CUSTOMER)
                        .build())
        );

        customerB = userRepository.findByEmail("customer_b@test.com").orElseGet(() ->
                userRepository.save(User.builder()
                        .email("customer_b@test.com")
                        .password("pass")
                        .firstName("Bob")
                        .lastName("Jones")
                        .role(Role.ROLE_CUSTOMER)
                        .build())
        );

        // Create product with EXACTLY ONE unit in stock
        String uniqueSku = "CONCUR-" + UUID.randomUUID().toString().substring(0, 8);
        scarceProduct = productRepository.save(Product.builder()
                .sku(uniqueSku)
                .title("Last Unit Wireless Headphones")
                .description("Special concurrency test product")
                .price(new BigDecimal("299.99"))
                .stock(1) // Only 1 available!
                .category(category)
                .active(true)
                .build());
    }

    @Test
    @DisplayName("CONCURRENCY INVARIANT: Two simultaneous checkouts for 1 available unit -> Exactly 1 succeeds, 1 fails, final stock = 0")
    void testConcurrentCheckoutForLastItem() throws InterruptedException, ExecutionException {
        int numberOfThreads = 2;
        ExecutorService executor = Executors.newFixedThreadPool(numberOfThreads);
        CyclicBarrier barrier = new CyclicBarrier(numberOfThreads);

        AtomicInteger successCount = new AtomicInteger(0);
        AtomicInteger failureCount = new AtomicInteger(0);

        Callable<OrderDto> taskA = () -> {
            barrier.await(); // Synchronize thread start to ensure true simultaneous execution
            String keyA = "IDEM-A-" + UUID.randomUUID();
            CheckoutRequest req = CheckoutRequest.builder()
                    .shippingAddress("100 Main St, New York")
                    .items(List.of(CheckoutItemRequest.builder().productId(scarceProduct.getId()).quantity(1).build()))
                    .build();
            try {
                OrderDto order = checkoutService.executeCheckout(customerA, keyA, req);
                successCount.incrementAndGet();
                return order;
            } catch (InsufficientStockException ex) {
                failureCount.incrementAndGet();
                return null;
            }
        };

        Callable<OrderDto> taskB = () -> {
            barrier.await(); // Synchronize thread start to ensure true simultaneous execution
            String keyB = "IDEM-B-" + UUID.randomUUID();
            CheckoutRequest req = CheckoutRequest.builder()
                    .shippingAddress("200 Broadway, New York")
                    .items(List.of(CheckoutItemRequest.builder().productId(scarceProduct.getId()).quantity(1).build()))
                    .build();
            try {
                OrderDto order = checkoutService.executeCheckout(customerB, keyB, req);
                successCount.incrementAndGet();
                return order;
            } catch (InsufficientStockException ex) {
                failureCount.incrementAndGet();
                return null;
            }
        };

        Future<OrderDto> futureA = executor.submit(taskA);
        Future<OrderDto> futureB = executor.submit(taskB);

        futureA.get();
        futureB.get();
        executor.shutdown();

        // Verification of checkout invariants
        assertThat(successCount.get()).as("Exactly 1 checkout must succeed").isEqualTo(1);
        assertThat(failureCount.get()).as("Exactly 1 checkout must fail due to stock depletion").isEqualTo(1);

        // Check authoritative product stock in database
        Product reloadedProduct = productRepository.findById(scarceProduct.getId()).orElseThrow();
        assertThat(reloadedProduct.getStock()).as("Final database stock must equal zero").isEqualTo(0);
        assertThat(reloadedProduct.getStock()).as("Stock must never become negative").isNotNegative();

        // Check orders created for this product
        List<com.ascendion.shopsphere.orders.entity.OrderItem> orderItems = orderItemRepository.findByProductId(scarceProduct.getId());
        assertThat(orderItems).as("Exactly one order item must exist for this product").hasSize(1);
    }
}
