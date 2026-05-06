package com.tableorder.order.entity;

public enum OrderStatus {
    PENDING,
    PREPARING,
    COMPLETED;

    public boolean canTransitionTo(OrderStatus target) {
        return switch (this) {
            case PENDING -> target == PREPARING;
            case PREPARING -> target == COMPLETED;
            case COMPLETED -> false;
        };
    }
}
