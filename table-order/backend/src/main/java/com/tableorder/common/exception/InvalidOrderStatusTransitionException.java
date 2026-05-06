package com.tableorder.common.exception;

public class InvalidOrderStatusTransitionException extends BusinessException {

    public InvalidOrderStatusTransitionException(String currentStatus, String targetStatus) {
        super("INVALID_ORDER_STATUS_TRANSITION",
                String.format("Cannot transition from %s to %s", currentStatus, targetStatus));
    }
}
