package com.ascendion.shopsphere.coupon.controller;

import com.ascendion.shopsphere.common.response.ApiResponse;
import com.ascendion.shopsphere.coupon.dto.ApplyCouponRequest;
import com.ascendion.shopsphere.coupon.dto.CouponValidationResponse;
import com.ascendion.shopsphere.coupon.service.CouponService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/coupons")
@RequiredArgsConstructor
@Tag(name = "Coupons", description = "Coupon validation endpoints")
public class CouponController {

    private final CouponService couponService;

    @PostMapping("/validate")
    @Operation(summary = "Validate a coupon against a shopping cart subtotal")
    public ResponseEntity<ApiResponse<CouponValidationResponse>> validateCoupon(
            @Valid @RequestBody ApplyCouponRequest request
    ) {
        return ResponseEntity.ok(ApiResponse.success(couponService.validateCoupon(request)));
    }
}

