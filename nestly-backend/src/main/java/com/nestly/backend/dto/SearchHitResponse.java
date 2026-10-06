package com.nestly.backend.dto;

import java.util.List;

public record SearchHitResponse(String pageId, String date, Integer pageNumber, List<Snippet> snippets) {

    public record Snippet(String section, List<Segment> segments) {

    }

    public record Segment(String text, boolean match) {

    }
}
