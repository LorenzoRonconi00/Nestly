package com.nestly.backend.dto;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

public record PageResponse(UUID id, LocalDate date, Integer pageNumber, List<SectionResponse> sections) {
}