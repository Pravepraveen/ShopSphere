package com.ascendion.shopsphere.orders;

import com.ascendion.shopsphere.common.exception.InvalidStateTransitionException;
import com.ascendion.shopsphere.orders.entity.OrderStatus;
import com.ascendion.shopsphere.orders.state.OrderStateMachine;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class OrderStateMachineTest {

    private OrderStateMachine stateMachine;

    @BeforeEach
    void setUp() {
        stateMachine = new OrderStateMachine();
    }

    @Test
    @DisplayName("Valid normal progression: PLACED -> PAID -> PACKED -> SHIPPED -> DELIVERED")
    void shouldAllowNormalProgression() {
        stateMachine.validateTransition(OrderStatus.PLACED, OrderStatus.PAID);
        stateMachine.validateTransition(OrderStatus.PAID, OrderStatus.PACKED);
        stateMachine.validateTransition(OrderStatus.PACKED, OrderStatus.SHIPPED);
        stateMachine.validateTransition(OrderStatus.SHIPPED, OrderStatus.DELIVERED);
    }

    @Test
    @DisplayName("Should reject illegal transition skipping steps: PLACED -> SHIPPED")
    void shouldRejectSkippingSteps() {
        assertThatThrownBy(() -> stateMachine.validateTransition(OrderStatus.PLACED, OrderStatus.SHIPPED))
                .isInstanceOf(InvalidStateTransitionException.class)
                .hasMessageContaining("Invalid order state transition");
    }

    @Test
    @DisplayName("Should reject rollback from DELIVERED to PACKED")
    void shouldRejectRollbackFromDelivered() {
        assertThatThrownBy(() -> stateMachine.validateTransition(OrderStatus.DELIVERED, OrderStatus.PACKED))
                .isInstanceOf(InvalidStateTransitionException.class)
                .hasMessageContaining("Terminal State");
    }

    @Test
    @DisplayName("Should identify terminal states accurately")
    void shouldIdentifyTerminalStates() {
        assertThat(stateMachine.isTerminal(OrderStatus.DELIVERED)).isTrue();
        assertThat(stateMachine.isTerminal(OrderStatus.PAYMENT_FAILED)).isTrue();
        assertThat(stateMachine.isTerminal(OrderStatus.CANCELLED)).isTrue();
        assertThat(stateMachine.isTerminal(OrderStatus.PLACED)).isFalse();
        assertThat(stateMachine.isTerminal(OrderStatus.PAID)).isFalse();
    }

    @Test
    @DisplayName("Should flag stock restoration when moving from PLACED/PAID to PAYMENT_FAILED or CANCELLED")
    void shouldFlagStockRestoration() {
        assertThat(stateMachine.requiresStockRestoration(OrderStatus.PLACED, OrderStatus.PAYMENT_FAILED)).isTrue();
        assertThat(stateMachine.requiresStockRestoration(OrderStatus.PAID, OrderStatus.CANCELLED)).isTrue();
        assertThat(stateMachine.requiresStockRestoration(OrderStatus.PLACED, OrderStatus.PAID)).isFalse();
        assertThat(stateMachine.requiresStockRestoration(OrderStatus.SHIPPED, OrderStatus.DELIVERED)).isFalse();
    }
}

