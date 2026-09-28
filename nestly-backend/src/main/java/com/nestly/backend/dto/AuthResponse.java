package com.nestly.backend.dto;

import java.util.UUID;

public record AuthResponse(UUID userId, String email) {
}