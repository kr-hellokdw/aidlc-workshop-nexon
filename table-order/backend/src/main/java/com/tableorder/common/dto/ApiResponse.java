package com.tableorder.common.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ApiResponse<T> {

    private final boolean success;
    private final T data;
    private final ErrorDetail error;
    private final LocalDateTime timestamp;

    public static <T> ApiResponse<T> success(T data) {
        return ApiResponse.<T>builder()
                .success(true)
                .data(data)
                .timestamp(LocalDateTime.now())
                .build();
    }

    public static ApiResponse<?> error(String code, String message) {
        return ApiResponse.builder()
                .success(false)
                .error(ErrorDetail.of(code, message))
                .timestamp(LocalDateTime.now())
                .build();
    }

    public static ApiResponse<?> validationError(String code, String message, java.util.List<FieldError> fields) {
        return ApiResponse.builder()
                .success(false)
                .error(ErrorDetail.validation(code, message, fields))
                .timestamp(LocalDateTime.now())
                .build();
    }

    @Getter
    @Builder
    @JsonInclude(JsonInclude.Include.NON_NULL)
    public static class ErrorDetail {
        private final String code;
        private final String message;
        private final java.util.List<FieldError> fields;

        public static ErrorDetail of(String code, String message) {
            return ErrorDetail.builder().code(code).message(message).build();
        }

        public static ErrorDetail validation(String code, String message, java.util.List<FieldError> fields) {
            return ErrorDetail.builder().code(code).message(message).fields(fields).build();
        }
    }

    @Getter
    @Builder
    public static class FieldError {
        private final String field;
        private final String message;
    }
}
