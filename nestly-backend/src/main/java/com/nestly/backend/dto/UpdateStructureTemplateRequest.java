package com.nestly.backend.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Pattern;

import java.util.List;

public record UpdateStructureTemplateRequest(
        @NotEmpty List<@Valid SectionItem> sections) {
    public record SectionItem(
            @NotBlank @Pattern(regexp = "expenses|checklist|mood|freetext|appointments") String type,
            int order) {
    }
}