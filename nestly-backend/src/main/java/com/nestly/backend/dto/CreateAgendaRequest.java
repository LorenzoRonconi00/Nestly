package com.nestly.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record CreateAgendaRequest(
        @NotBlank
        @Size(max = 255)
        String name,
        @NotBlank
        @Pattern(regexp = "notebook|standard|diary")
        String baseTemplate,
        @Pattern(regexp = "solid:#[0-9a-fA-F]{6}")
        String coverTheme) {

}
