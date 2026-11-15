package com.ascendion.shopsphere.catalog.product;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long>, JpaSpecificationExecutor<Product> {

    Optional<Product> findBySku(String sku);

    boolean existsBySku(String sku);

    java.util.List<Product> findByStockLessThanEqualOrderByStockAsc(int threshold);

    long countByStockLessThanEqual(int threshold);

    long countByStock(int stock);

    /**
     * ATOMIC CONDITIONAL STOCK RESERVATION
     * Guarantees atomic decrements and optimistic concurrency control without race conditions.
     * Returns 1 if stock was successfully decremented, or 0 if available stock was insufficient or product inactive.
     */
    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query("UPDATE Product p SET p.stock = p.stock - :quantity, p.version = p.version + 1 " +
           "WHERE p.id = :productId AND p.stock >= :quantity AND p.active = true")
    int decrementStockConditionally(@Param("productId") Long productId, @Param("quantity") int quantity);

    /**
     * ATOMIC STOCK RESTORATION
     * Used upon payment failure or order cancellation to return reserved stock back into available inventory.
     */
    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query("UPDATE Product p SET p.stock = p.stock + :quantity, p.version = p.version + 1 " +
           "WHERE p.id = :productId")
    int incrementStock(@Param("productId") Long productId, @Param("quantity") int quantity);
}

