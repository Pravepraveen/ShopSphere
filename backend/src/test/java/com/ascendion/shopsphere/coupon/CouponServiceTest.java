package com.ascendion.shopsphere.coupon;

import com.ascendion.shopsphere.common.exception.InvalidCouponException;
import com.ascendion.shopsphere.coupon.dto.ApplyCouponRequest;
import com.ascendion.shopsphere.coupon.dto.CouponValidationResponse;
import com.ascendion.shopsphere.coupon.entity.Coupon;
import com.ascendion.shopsphere.coupon.entity.DiscountType;
import com.ascendion.shopsphere.coupon.repository.CouponRepository;
import com.ascendion.shopsphere.coupon.service.CouponService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class CouponServiceTest {

    @Mock
    private CouponRepository couponRepository;

    @InjectMocks
    private CouponService couponService;

    private Coupon percentageCoupon;
    private Coupon fixedCoupon;

    @BeforeEach
    void setUp() {
        percentageCoupon = Coupon.builder()
                .id(1L)
                .code("SAVE10")
                .discountType(DiscountType.PERCENTAGE)
                .discountValue(new BigDecimal("10.00"))
                .minOrderValue(new BigDecimal("50.00"))
                .usageLimit(100)
                .timesUsed(0)
                .expiresAt(LocalDateTime.now().plusDays(30))
                .active(true)
                .build();

        fixedCoupon = Coupon.builder()
                .id(2L)
                .code("FLAT25")
                .discountType(DiscountType.FIXED)
                .discountValue(new BigDecimal("25.00"))
                .minOrderValue(new BigDecimal("100.00"))
                .usageLimit(50)
                .timesUsed(0)
                .expiresAt(LocalDateTime.now().plusDays(30))
                .active(true)
                .build();
    }

    @Test
    @DisplayName("Calculate accurate percentage discount with BigDecimal rounding")
    void shouldCalculatePercentageDiscount() {
        BigDecimal subtotal = new BigDecimal("199.99");
        BigDecimal discount = couponService.calculateDiscount(percentageCoupon, subtotal);
        // 199.99 * 10% = 19.999 -> 20.00
        assertThat(discount).isEqualByComparingTo("20.00");
    }

    @Test
    @DisplayName("Fixed discount must not exceed order subtotal")
    void fixedDiscountShouldNotExceedSubtotal() {
        Coupon bigCoupon = Coupon.builder()
                .discountType(DiscountType.FIXED)
                .discountValue(new BigDecimal("500.00"))
                .build();
        BigDecimal subtotal = new BigDecimal("150.00");
        BigDecimal discount = couponService.calculateDiscount(bigCoupon, subtotal);
        assertThat(discount).isEqualByComparingTo("150.00");
    }

    @Test
    @DisplayName("Validate coupon successfully when criteria met")
    void shouldValidateCouponSuccessfully() {
        when(couponRepository.findByCodeIgnoreCase("SAVE10")).thenReturn(Optional.of(percentageCoupon));

        ApplyCouponRequest request = ApplyCouponRequest.builder()
                .code("SAVE10")
                .subtotal(new BigDecimal("100.00"))
                .build();

        CouponValidationResponse response = couponService.validateCoupon(request);

        assertThat(response.isValid()).isTrue();
        assertThat(response.getDiscountAmount()).isEqualByComparingTo("10.00");
        assertThat(response.getTotalAfterDiscount()).isEqualByComparingTo("90.00");
    }

    @Test
    @DisplayName("Reject coupon when subtotal is below minimum order value")
    void shouldRejectWhenBelowMinimumOrderValue() {
        when(couponRepository.findByCodeIgnoreCase("SAVE10")).thenReturn(Optional.of(percentageCoupon));

        ApplyCouponRequest request = ApplyCouponRequest.builder()
                .code("SAVE10")
                .subtotal(new BigDecimal("40.00")) // Min is 50.00
                .build();

        assertThatThrownBy(() -> couponService.validateCoupon(request))
                .isInstanceOf(InvalidCouponException.class)
                .hasMessageContaining("does not meet the minimum requirement");
    }

    @Test
    @DisplayName("Reject expired coupon")
    void shouldRejectExpiredCoupon() {
        percentageCoupon.setExpiresAt(LocalDateTime.now().minusDays(1));
        when(couponRepository.findByCodeIgnoreCase("SAVE10")).thenReturn(Optional.of(percentageCoupon));

        ApplyCouponRequest request = ApplyCouponRequest.builder()
                .code("SAVE10")
                .subtotal(new BigDecimal("100.00"))
                .build();

        assertThatThrownBy(() -> couponService.validateCoupon(request))
                .isInstanceOf(InvalidCouponException.class)
                .hasMessageContaining("expired");
    }

    @Test
    @DisplayName("Reject exhausted coupon exceeding usage limit")
    void shouldRejectExhaustedCoupon() {
        percentageCoupon.setUsageLimit(5);
        percentageCoupon.setTimesUsed(5);
        when(couponRepository.findByCodeIgnoreCase("SAVE10")).thenReturn(Optional.of(percentageCoupon));

        ApplyCouponRequest request = ApplyCouponRequest.builder()
                .code("SAVE10")
                .subtotal(new BigDecimal("100.00"))
                .build();

        assertThatThrownBy(() -> couponService.validateCoupon(request))
                .isInstanceOf(InvalidCouponException.class)
                .hasMessageContaining("maximum usage limit");
    }
}

