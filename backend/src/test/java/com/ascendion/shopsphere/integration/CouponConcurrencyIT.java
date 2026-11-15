package com.ascendion.shopsphere.integration;

import com.ascendion.shopsphere.catalog.category.Category;
import com.ascendion.shopsphere.catalog.category.CategoryRepository;
import com.ascendion.shopsphere.catalog.product.Product;
import com.ascendion.shopsphere.catalog.product.ProductRepository;
import com.ascendion.shopsphere.checkout.dto.CheckoutItemRequest;
import com.ascendion.shopsphere.checkout.dto.CheckoutRequest;
import com.ascendion.shopsphere.checkout.service.CheckoutService;
import com.ascendion.shopsphere.common.exception.InvalidCouponException;
import com.ascendion.shopsphere.coupon.entity.Coupon;
import com.ascendion.shopsphere.coupon.entity.DiscountType;
import com.ascendion.shopsphere.coupon.repository.CouponRepository;
import com.ascendion.shopsphere.orders.dto.OrderDto;
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
public class CouponConcurrencyIT {

    @Autowired
    private CheckoutService checkoutService;

    @Autowired
    private CouponRepository couponRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private UserRepository userRepository;

    private User user1;
    private User user2;
    private Product product;
    private Coupon limitedCoupon;

    @BeforeEach
    void setUp() {
        Category category = categoryRepository.findAll().stream().findFirst().orElseGet(() ->
                categoryRepository.save(Category.builder().name("CouponCat").slug("couponcat").build())
        );

        user1 = userRepository.findByEmail("coupon_user1@test.com").orElseGet(() ->
                userRepository.save(User.builder()
                        .email("coupon_user1@test.com")
                        .password("pass")
                        .firstName("User")
                        .lastName("One")
                        .role(Role.ROLE_CUSTOMER)
                        .build())
        );

        user2 = userRepository.findByEmail("coupon_user2@test.com").orElseGet(() ->
                userRepository.save(User.builder()
                        .email("coupon_user2@test.com")
                        .password("pass")
                        .firstName("User")
                        .lastName("Two")
                        .role(Role.ROLE_CUSTOMER)
                        .build())
        );

        product = productRepository.save(Product.builder()
                .sku("COUPON-PROD-" + UUID.randomUUID().toString().substring(0, 8))
                .title("High Value Monitor")
                .price(new BigDecimal("500.00"))
                .stock(20) // Abundant product stock
                .category(category)
                .active(true)
                .build());

        String couponCode = "FLASH-" + UUID.randomUUID().toString().substring(0, 6).toUpperCase();
        limitedCoupon = couponRepository.save(Coupon.builder()
                .code(couponCode)
                .discountType(DiscountType.FIXED)
                .discountValue(new BigDecimal("50.00"))
                .minOrderValue(new BigDecimal("100.00"))
                .usageLimit(1) // STRICT LIMIT OF 1
                .timesUsed(0)
                .active(true)
                .build());
    }

    @Test
    @DisplayName("COUPON INVARIANT: Two concurrent checkouts with usage_limit=1 -> Exactly 1 gets coupon, times_used <= 1")
    void testConcurrentCouponLimitEnforcement() throws InterruptedException, ExecutionException {
        int numberOfThreads = 2;
        ExecutorService executor = Executors.newFixedThreadPool(numberOfThreads);
        CyclicBarrier barrier = new CyclicBarrier(numberOfThreads);

        AtomicInteger couponSuccessCount = new AtomicInteger(0);
        AtomicInteger couponFailureCount = new AtomicInteger(0);

        Callable<OrderDto> task1 = () -> {
            barrier.await();
            CheckoutRequest req = CheckoutRequest.builder()
                    .shippingAddress("1 Infinite Loop, Cupertino, CA")
                    .couponCode(limitedCoupon.getCode())
                    .items(List.of(CheckoutItemRequest.builder().productId(product.getId()).quantity(1).build()))
                    .build();
            try {
                OrderDto order = checkoutService.executeCheckout(user1, "KEY-U1-" + UUID.randomUUID(), req);
                couponSuccessCount.incrementAndGet();
                return order;
            } catch (InvalidCouponException ex) {
                couponFailureCount.incrementAndGet();
                return null;
            }
        };

        Callable<OrderDto> task2 = () -> {
            barrier.await();
            CheckoutRequest req = CheckoutRequest.builder()
                    .shippingAddress("1600 Amphitheatre Pkwy, Mountain View, CA")
                    .couponCode(limitedCoupon.getCode())
                    .items(List.of(CheckoutItemRequest.builder().productId(product.getId()).quantity(1).build()))
                    .build();
            try {
                OrderDto order = checkoutService.executeCheckout(user2, "KEY-U2-" + UUID.randomUUID(), req);
                couponSuccessCount.incrementAndGet();
                return order;
            } catch (InvalidCouponException ex) {
                couponFailureCount.incrementAndGet();
                return null;
            }
        };

        Future<OrderDto> f1 = executor.submit(task1);
        Future<OrderDto> f2 = executor.submit(task2);

        f1.get();
        f2.get();
        executor.shutdown();

        assertThat(couponSuccessCount.get()).as("Exactly 1 checkout should successfully apply the single-use coupon").isEqualTo(1);
        assertThat(couponFailureCount.get()).as("The losing thread must be rejected when coupon limit is exhausted").isEqualTo(1);

        Coupon reloadedCoupon = couponRepository.findById(limitedCoupon.getId()).orElseThrow();
        assertThat(reloadedCoupon.getTimesUsed()).as("Coupon times_used must equal exactly 1").isEqualTo(1);
    }
}

