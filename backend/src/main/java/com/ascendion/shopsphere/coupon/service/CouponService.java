package com.ascendion.shopsphere.coupon.service;

import com.ascendion.shopsphere.common.exception.BadRequestException;
import com.ascendion.shopsphere.common.exception.InvalidCouponException;
import com.ascendion.shopsphere.common.exception.ResourceNotFoundException;
import com.ascendion.shopsphere.coupon.dto.ApplyCouponRequest;
import com.ascendion.shopsphere.coupon.dto.CouponDto;
import com.ascendion.shopsphere.coupon.dto.CouponValidationResponse;
import com.ascendion.shopsphere.coupon.entity.Coupon;
import com.ascendion.shopsphere.coupon.entity.DiscountType;
import com.ascendion.shopsphere.coupon.repository.CouponRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CouponService {

    private final CouponRepository couponRepository;

    @Transactional(readOnly = true)
    public CouponValidationResponse validateCoupon(ApplyCouponRequest request) {
        String code = request.getCode().trim().toUpperCase();
        Coupon coupon = couponRepository.findByCodeIgnoreCase(code)
                .orElseThrow(() -> new InvalidCouponException("Coupon code '" + code + "' is not recognized"));

        if (!coupon.isActive()) {
            throw new InvalidCouponException("Coupon '" + code + "' is inactive");
        }

        if (coupon.isExpired()) {
            throw new InvalidCouponException("Coupon '" + code + "' has expired on " + coupon.getExpiresAt());
        }

        if (coupon.isExhausted()) {
            throw new InvalidCouponException("Coupon '" + code + "' has reached its maximum usage limit");
        }

        BigDecimal subtotal = request.getSubtotal();
        if (subtotal.compareTo(coupon.getMinOrderValue()) < 0) {
            throw new InvalidCouponException("Order subtotal of $" + subtotal +
                    " does not meet the minimum requirement of $" + coupon.getMinOrderValue() + " for coupon " + code);
        }

        BigDecimal discountAmount = calculateDiscount(coupon, subtotal);
        BigDecimal totalAfterDiscount = subtotal.subtract(discountAmount).max(BigDecimal.ZERO).setScale(2, RoundingMode.HALF_UP);

        return CouponValidationResponse.builder()
                .valid(true)
                .code(coupon.getCode())
                .discountType(coupon.getDiscountType())
                .discountValue(coupon.getDiscountValue())
                .discountAmount(discountAmount)
                .subtotal(subtotal)
                .totalAfterDiscount(totalAfterDiscount)
                .message("Coupon applied successfully")
                .build();
    }

    public BigDecimal calculateDiscount(Coupon coupon, BigDecimal subtotal) {
        BigDecimal discount;
        if (coupon.getDiscountType() == DiscountType.PERCENTAGE) {
            discount = subtotal.multiply(coupon.getDiscountValue())
                    .divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
        } else {
            discount = coupon.getDiscountValue().setScale(2, RoundingMode.HALF_UP);
        }
        // Discount cannot exceed subtotal
        if (discount.compareTo(subtotal) > 0) {
            discount = subtotal;
        }
        return discount.max(BigDecimal.ZERO).setScale(2, RoundingMode.HALF_UP);
    }

    @Transactional
    public void reserveCouponUsage(Coupon coupon) {
        int updated = couponRepository.incrementTimesUsedConditionally(coupon.getId());
        if (updated == 0) {
            throw new InvalidCouponException("Coupon '" + coupon.getCode() + "' usage limit exceeded or coupon no longer active");
        }
    }

    @Transactional
    public void restoreCouponUsage(Long couponId) {
        if (couponId != null) {
            couponRepository.decrementTimesUsed(couponId);
        }
    }

    @Transactional(readOnly = true)
    public List<CouponDto> getAllCoupons() {
        return couponRepository.findAll().stream()
                .map(CouponDto::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional
    public CouponDto createCoupon(CouponDto dto) {
        if (couponRepository.existsByCodeIgnoreCase(dto.getCode().trim())) {
            throw new BadRequestException("Coupon with code '" + dto.getCode() + "' already exists");
        }

        Coupon coupon = Coupon.builder()
                .code(dto.getCode().trim().toUpperCase())
                .discountType(dto.getDiscountType())
                .discountValue(dto.getDiscountValue())
                .minOrderValue(dto.getMinOrderValue() != null ? dto.getMinOrderValue() : BigDecimal.ZERO)
                .usageLimit(dto.getUsageLimit() > 0 ? dto.getUsageLimit() : 1)
                .timesUsed(0)
                .expiresAt(dto.getExpiresAt())
                .active(dto.isActive())
                .build();

        return CouponDto.fromEntity(couponRepository.save(coupon));
    }

    @Transactional
    public CouponDto updateCoupon(Long id, CouponDto dto) {
        Coupon coupon = couponRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Coupon not found with id: " + id));

        coupon.setDiscountType(dto.getDiscountType());
        coupon.setDiscountValue(dto.getDiscountValue());
        coupon.setMinOrderValue(dto.getMinOrderValue());
        coupon.setUsageLimit(dto.getUsageLimit());
        coupon.setExpiresAt(dto.getExpiresAt());
        coupon.setActive(dto.isActive());

        return CouponDto.fromEntity(couponRepository.save(coupon));
    }
}

