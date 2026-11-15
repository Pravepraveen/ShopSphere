package com.ascendion.shopsphere.coupon.repository;

import com.ascendion.shopsphere.coupon.entity.Coupon;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CouponRepository extends JpaRepository<Coupon, Long> {

    Optional<Coupon> findByCodeIgnoreCase(String code);

    boolean existsByCodeIgnoreCase(String code);

    /**
     * ATOMIC COUPON USAGE INCREMENT
     * Guarantees coupon usage cannot exceed its configured limit, even under high concurrency.
     * Returns 1 if usage was successfully incremented, or 0 if limit was reached or coupon inactive.
     */
    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query("UPDATE Coupon c SET c.timesUsed = c.timesUsed + 1, c.version = c.version + 1 " +
           "WHERE c.id = :couponId AND c.timesUsed < c.usageLimit AND c.active = true")
    int incrementTimesUsedConditionally(@Param("couponId") Long couponId);

    /**
     * ATOMIC COUPON RESTORATION
     * Decrements usage count when payment fails or order is cancelled.
     */
    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query("UPDATE Coupon c SET c.timesUsed = c.timesUsed - 1, c.version = c.version + 1 " +
           "WHERE c.id = :couponId AND c.timesUsed > 0")
    int decrementTimesUsed(@Param("couponId") Long couponId);
}

