package com.nestly.backend.dto;

import java.time.Instant;
import java.util.UUID;

public record AgendaResponse(
        UUID id,
        String name,
        String baseTemplate,
        String coverTheme,
        Instant createdAt) {
}