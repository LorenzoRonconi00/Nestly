package com.nestly.backend.dto;

import java.util.List;

public record ValidationErrorResponse(List<FieldViolation> errors) {

    public record FieldViolation(String field, String message) {

    }
}
