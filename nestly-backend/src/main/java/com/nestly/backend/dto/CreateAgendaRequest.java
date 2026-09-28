package com.nestly.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public record CreateAgendaRequest(
        @NotBlank String name,
        @NotBlank @Pattern(regexp = "notebook|standard|diary") String baseTemplate) {
}