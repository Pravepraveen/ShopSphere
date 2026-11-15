package com.ascendion.shopsphere.orders.state;

import com.ascendion.shopsphere.common.exception.InvalidStateTransitionException;
import com.ascendion.shopsphere.orders.entity.OrderStatus;
import org.springframework.stereotype.Component;

import java.util.Collections;
import java.util.EnumMap;
import java.util.EnumSet;
import java.util.Map;
import java.util.Set;

@Component
public class OrderStateMachine {

    private static final Map<OrderStatus, Set<OrderStatus>> VALID_TRANSITIONS = new EnumMap<>(OrderStatus.class);

    static {
        VALID_TRANSITIONS.put(OrderStatus.PLACED, EnumSet.of(OrderStatus.PAID, OrderStatus.PAYMENT_FAILED, OrderStatus.CANCELLED));
        VALID_TRANSITIONS.put(OrderStatus.PAID, EnumSet.of(OrderStatus.PACKED, OrderStatus.CANCELLED));
        VALID_TRANSITIONS.put(OrderStatus.PACKED, EnumSet.of(OrderStatus.SHIPPED, OrderStatus.CANCELLED));
        VALID_TRANSITIONS.put(OrderStatus.SHIPPED, EnumSet.of(OrderStatus.DELIVERED));
        VALID_TRANSITIONS.put(OrderStatus.DELIVERED, Collections.emptySet());
        VALID_TRANSITIONS.put(OrderStatus.PAYMENT_FAILED, Collections.emptySet());
        VALID_TRANSITIONS.put(OrderStatus.CANCELLED, Collections.emptySet());
    }

    public void validateTransition(OrderStatus currentStatus, OrderStatus newStatus) {
        if (currentStatus == null || newStatus == null) {
            throw new InvalidStateTransitionException("Current and new order statuses cannot be null");
        }

        if (currentStatus == newStatus) {
            return; // Idempotent same-state call
        }

        Set<OrderStatus> allowed = VALID_TRANSITIONS.getOrDefault(currentStatus, Collections.emptySet());
        if (!allowed.contains(newStatus)) {
            throw new InvalidStateTransitionException(
                    "Invalid order state transition from " + currentStatus + " to " + newStatus +
                    ". Allowed transitions: " + (allowed.isEmpty() ? "None (Terminal State)" : allowed)
            );
        }
    }

    public boolean isTerminal(OrderStatus status) {
        return status == OrderStatus.DELIVERED ||
               status == OrderStatus.PAYMENT_FAILED ||
               status == OrderStatus.CANCELLED;
    }

    public boolean requiresStockRestoration(OrderStatus previousStatus, OrderStatus newStatus) {
        // If an order fails payment or is cancelled before delivery, its deducted stock must be restored
        boolean isCancellationOrFailure = (newStatus == OrderStatus.PAYMENT_FAILED || newStatus == OrderStatus.CANCELLED);
        boolean wasReserved = (previousStatus == OrderStatus.PLACED || previousStatus == OrderStatus.PAID || previousStatus == OrderStatus.PACKED);
        return isCancellationOrFailure && wasReserved;
    }
}

