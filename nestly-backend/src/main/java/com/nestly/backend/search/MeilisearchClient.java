package com.nestly.backend.search;

import java.net.http.HttpClient;
import java.time.Duration;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.client.JdkClientHttpRequestFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestClient;

@Component
public class MeilisearchClient {

    private static final Duration CONNECT_TIMEOUT = Duration.ofSeconds(2);
    private static final Duration READ_TIMEOUT = Duration.ofSeconds(10);
    private static final Duration TASK_POLL_INTERVAL = Duration.ofMillis(100);
    private static final int TASK_POLL_ATTEMPTS = 100;

    private final RestClient http;
    private final String indexUid;

    public MeilisearchClient(
            @Value("${nestly.search.url}") String url,
            @Value("${nestly.search.api-key}") String apiKey,
            @Value("${nestly.search.index}") String indexUid) {
        JdkClientHttpRequestFactory requestFactory = new JdkClientHttpRequestFactory(
                HttpClient.newBuilder().connectTimeout(CONNECT_TIMEOUT).build());
        requestFactory.setReadTimeout(READ_TIMEOUT);
        this.http = RestClient.builder()
                .baseUrl(url)
                .requestFactory(requestFactory)
                .defaultHeader(HttpHeaders.AUTHORIZATION, "Bearer " + apiKey)
                .defaultHeader(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
                .build();
        this.indexUid = indexUid;
    }

    public boolean indexExists() {
        try {
            http.get().uri("/indexes/{uid}", indexUid).retrieve().toBodilessEntity();
            return true;
        } catch (HttpClientErrorException.NotFound ex) {
            return false;
        }
    }

    public void createIndex() {
        Map<String, Object> task = http.post().uri("/indexes")
                .body(Map.of("uid", indexUid, "primaryKey", "id"))
                .retrieve().body(new ParameterizedTypeReference<>() {
                });
        waitForTask(task);
    }

    public void configureIndex() {
        Map<String, Object> task = http.patch().uri("/indexes/{uid}/settings", indexUid)
                .body(Map.of(
                        "searchableAttributes", List.of("freetext", "checklist", "appointments", "expenses"),
                        "filterableAttributes", List.of("agendaId", "userId"),
                        "pagination", Map.of("maxTotalHits", 200)))
                .retrieve().body(new ParameterizedTypeReference<>() {
                });
        waitForTask(task);
    }

    public long documentCount() {
        Map<String, Object> stats = http.get().uri("/indexes/{uid}/stats", indexUid)
                .retrieve().body(new ParameterizedTypeReference<>() {
                });
        return ((Number) stats.get("numberOfDocuments")).longValue();
    }

    public void addDocuments(List<Map<String, Object>> documents) {
        if (documents.isEmpty()) {
            return;
        }
        http.post().uri("/indexes/{uid}/documents?primaryKey=id", indexUid)
                .body(documents)
                .retrieve().toBodilessEntity();
    }

    public void deleteDocuments(List<String> ids) {
        if (ids.isEmpty()) {
            return;
        }
        http.post().uri("/indexes/{uid}/documents/delete-batch", indexUid)
                .body(ids)
                .retrieve().toBodilessEntity();
    }

    public void deleteByFilter(String filter) {
        http.post().uri("/indexes/{uid}/documents/delete", indexUid)
                .body(Map.of("filter", filter))
                .retrieve().toBodilessEntity();
    }

    public List<Map<String, Object>> search(String query, String filter, int limit) {
        Map<String, Object> response = http.post().uri("/indexes/{uid}/search", indexUid)
                .body(Map.of("q", query, "filter", filter, "limit", limit))
                .retrieve().body(new ParameterizedTypeReference<>() {
                });
        @SuppressWarnings("unchecked")
        List<Map<String, Object>> hits = (List<Map<String, Object>>) response.get("hits");
        return hits;
    }

    // Meilisearch applies changes asynchronously; document updates are fire-and-forget, but index
    // creation and settings must be finished before anything depends on them
    private void waitForTask(Map<String, Object> task) {
        long uid = ((Number) task.get("taskUid")).longValue();
        for (int attempt = 0; attempt < TASK_POLL_ATTEMPTS; attempt++) {
            Map<String, Object> status = http.get().uri("/tasks/{uid}", uid)
                    .retrieve().body(new ParameterizedTypeReference<>() {
                    });
            String state = String.valueOf(status.get("status"));
            if ("succeeded".equals(state)) {
                return;
            }
            if ("failed".equals(state) || "canceled".equals(state)) {
                throw new IllegalStateException("Meilisearch task " + uid + " " + state + ": " + status.get("error"));
            }
            try {
                Thread.sleep(TASK_POLL_INTERVAL.toMillis());
            } catch (InterruptedException ex) {
                Thread.currentThread().interrupt();
                throw new IllegalStateException("Interrupted while waiting for Meilisearch", ex);
            }
        }
        throw new IllegalStateException("Meilisearch task " + uid + " did not finish in time");
    }
}
