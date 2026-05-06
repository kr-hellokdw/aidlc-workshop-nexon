package com.tableorder.sse;

public enum SseEventType {
    NEW_ORDER,
    ORDER_STATUS_CHANGED,
    ORDER_DELETED,
    SESSION_COMPLETED,
    HEARTBEAT
}
