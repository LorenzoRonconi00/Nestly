package com.nestly.backend.dto;

import java.util.List;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Pattern;

public record UpdateStructureTemplateRequest(
        @NotEmpty
        List<@Valid SectionItem> sections,
        Boolean confirmDataLoss) {

    public record SectionItem(
            @NotBlank
            @Pattern(regexp = "expenses|checklist|mood|freetext|appointments")
            String type,
            int order) {

    }
}
