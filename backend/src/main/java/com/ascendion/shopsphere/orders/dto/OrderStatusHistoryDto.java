package com.ascendion.shopsphere.orders.dto;

import com.ascendion.shopsphere.orders.entity.OrderStatus;
import com.ascendion.shopsphere.orders.entity.OrderStatusHistory;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrderStatusHistoryDto {
    private Long id;
    private OrderStatus previousStatus;
    private OrderStatus newStatus;
    private String changedBy;
    private String reason;
    private LocalDateTime createdAt;

    public static OrderStatusHistoryDto fromEntity(OrderStatusHistory history) {
        if (history == null) return null;
        return OrderStatusHistoryDto.builder()
                .id(history.getId())
                .previousStatus(history.getPreviousStatus())
                .newStatus(history.getNewStatus())
                .changedBy(history.getChangedBy())
                .reason(history.getReason())
                .createdAt(history.getCreatedAt())
                .build();
    }
}

