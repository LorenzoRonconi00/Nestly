package com.nestly.backend.search;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClientException;
import org.springframework.web.server.ResponseStatusException;

import com.nestly.backend.domain.Agenda;
import com.nestly.backend.dto.SearchHitResponse;
import com.nestly.backend.service.AgendaService;

@Service
public class SearchService {

    private static final int MAX_QUERY_LENGTH = 200;
    private static final int LIMIT = 20;
    private static final int MAX_SNIPPETS = 3;

    private final AgendaService agendaService;
    private final MeilisearchClient client;

    public SearchService(AgendaService agendaService, MeilisearchClient client) {
        this.agendaService = agendaService;
        this.client = client;
    }

    public List<SearchHitResponse> search(UUID agendaId, UUID userId, String rawQuery) {
        Agenda agenda = agendaService.getForUser(agendaId, userId);
        String query = rawQuery.trim();
        if (query.isEmpty()) {
            return List.of();
        }
        if (query.length() > MAX_QUERY_LENGTH) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Search query is too long");
        }

        // The filter only contains identifiers produced by the server: the user's text goes to `q` alone
        String filter = "agendaId = \"" + agenda.getId() + "\" AND userId = \"" + agenda.getUserId() + "\"";
        List<Map<String, Object>> hits;
        try {
            hits = client.search(query, filter, LIMIT);
        } catch (RestClientException ex) {
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "Search is temporarily unavailable");
        }
        return hits.stream().map(SearchService::toResponse).toList();
    }

    private static SearchHitResponse toResponse(Map<String, Object> hit) {
        Integer pageNumber = hit.get("pageNumber") instanceof Number number ? number.intValue() : null;
        return new SearchHitResponse(
                (String) hit.get("id"),
                (String) hit.get("date"),
                pageNumber,
                snippetsOf(hit));
    }

    private static List<SearchHitResponse.Snippet> snippetsOf(Map<String, Object> hit) {
        List<SearchHitResponse.Snippet> matching = new ArrayList<>();
        List<SearchHitResponse.Snippet> others = new ArrayList<>();
        if (!(hit.get("_formatted") instanceof Map<?, ?> formatted)) {
            return matching;
        }

        for (String section : MeilisearchClient.SEARCHABLE_SECTIONS) {
            if (!(formatted.get(section) instanceof String text) || text.isBlank()) {
                continue;
            }
            SearchHitResponse.Snippet snippet = new SearchHitResponse.Snippet(section, toSegments(text));
            if (text.contains(MeilisearchClient.HIGHLIGHT_START)) {
                matching.add(snippet);
            } else {
                others.add(snippet);
            }
        }
        List<SearchHitResponse.Snippet> chosen = matching.isEmpty() ? others : matching;
        return chosen.subList(0, Math.min(chosen.size(), MAX_SNIPPETS));
    }

    static List<SearchHitResponse.Segment> toSegments(String formatted) {
        List<SearchHitResponse.Segment> segments = new ArrayList<>();
        int index = 0;
        while (index < formatted.length()) {
            int start = formatted.indexOf(MeilisearchClient.HIGHLIGHT_START, index);
            if (start < 0) {
                addSegment(segments, formatted.substring(index), false);
                break;
            }
            addSegment(segments, formatted.substring(index, start), false);
            int end = formatted.indexOf(MeilisearchClient.HIGHLIGHT_END, start + 1);
            if (end < 0) {
                addSegment(segments, formatted.substring(start + 1), true);
                break;
            }
            addSegment(segments, formatted.substring(start + 1, end), true);
            index = end + 1;
        }
        return segments;
    }

    private static void addSegment(List<SearchHitResponse.Segment> segments, String text, boolean match) {
        if (!text.isEmpty()) {
            segments.add(new SearchHitResponse.Segment(text, match));
        }
    }
}
