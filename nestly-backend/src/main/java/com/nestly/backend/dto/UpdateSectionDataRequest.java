package com.nestly.backend.dto;

import jakarta.validation.constraints.NotNull;

import java.util.Map;

public record UpdateSectionDataRequest(@NotNull Map<String, Object> data) {
}