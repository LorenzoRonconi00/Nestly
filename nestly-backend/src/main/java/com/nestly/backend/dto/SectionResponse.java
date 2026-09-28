package com.nestly.backend.dto;

import java.util.Map;
import java.util.UUID;

public record SectionResponse(UUID id, String type, int order, Map<String, Object> data) {
}