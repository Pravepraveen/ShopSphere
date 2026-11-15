package com.ascendion.shopsphere.coupon.dto;

import com.ascendion.shopsphere.coupon.entity.Coupon;
import com.ascendion.shopsphere.coupon.entity.DiscountType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CouponDto {
    private Long id;
    private String code;
    private DiscountType discountType;
    private BigDecimal discountValue;
    private BigDecimal minOrderValue;
    private int usageLimit;
    private int timesUsed;
    private LocalDateTime expiresAt;
    private boolean active;

    public static CouponDto fromEntity(Coupon coupon) {
        if (coupon == null) return null;
        return CouponDto.builder()
                .id(coupon.getId())
                .code(coupon.getCode())
                .discountType(coupon.getDiscountType())
                .discountValue(coupon.getDiscountValue())
                .minOrderValue(coupon.getMinOrderValue())
                .usageLimit(coupon.getUsageLimit())
                .timesUsed(coupon.getTimesUsed())
                .expiresAt(coupon.getExpiresAt())
                .active(coupon.isActive())
                .build();
    }
}

