package com.tableorder.common.exception;

public class DuplicateResourceException extends BusinessException {

    public DuplicateResourceException(String resource, String field, Object value) {
        super("DUPLICATE_RESOURCE", String.format("%s already exists with %s: %s", resource, field, value));
    }
}
