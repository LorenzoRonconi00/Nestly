package com.nestly.backend.dto;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

public record AgendaResponse(
                UUID id,
                String name,
                String baseTemplate,
                String coverTheme,
                List<SectionTemplateItem> sections,
                Instant createdAt) {
        public record SectionTemplateItem(String type, int order) {
        }
}