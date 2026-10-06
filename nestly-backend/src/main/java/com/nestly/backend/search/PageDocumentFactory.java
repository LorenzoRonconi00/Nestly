package com.nestly.backend.search;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.function.Function;

import org.springframework.stereotype.Component;

import com.nestly.backend.domain.Agenda;
import com.nestly.backend.domain.BaseTemplate;
import com.nestly.backend.domain.Page;
import com.nestly.backend.domain.Section;

@Component
public class PageDocumentFactory {

    public Optional<Map<String, Object>> build(Page page, Agenda agenda, List<Section> sections) {
        Map<String, Object> document = new LinkedHashMap<>();
        document.put("id", page.getId().toString());
        document.put("agendaId", agenda.getId().toString());
        document.put("userId", agenda.getUserId().toString());
        document.put("kind", agenda.getBaseTemplate() == BaseTemplate.NOTEBOOK ? "number" : "date");
        document.put("date", page.getPageDate() == null ? null : page.getPageDate().toString());
        document.put("pageNumber", page.getPageNumber());

        boolean hasText = false;
        for (Section section : sections) {
            String text = textOf(section);
            if (!text.isBlank()) {
                document.put(section.getType().getValue(), text);
                hasText = true;
            }
        }
        return hasText ? Optional.of(document) : Optional.empty();
    }

    private static String textOf(Section section) {
        Map<String, Object> data = section.getData();
        return switch (section.getType()) {
            case FREETEXT ->
                asText(data.get("text"));
            case CHECKLIST ->
                joinItems(data, item -> asText(item.get("text")));
            case APPOINTMENTS ->
                joinItems(data,
                item -> (asText(item.get("time")) + " " + asText(item.get("description"))).trim());
            case EXPENSES ->
                joinItems(data,
                item -> (asText(item.get("label")) + " " + asText(item.get("category"))).trim());
            case MOOD ->
                "";
        };
    }

    private static String joinItems(Map<String, Object> data, Function<Map<?, ?>, String> toText) {
        if (!(data.get("items") instanceof List<?> items)) {
            return "";
        }
        List<String> lines = new ArrayList<>();
        for (Object item : items) {
            if (item instanceof Map<?, ?> map) {
                String line = toText.apply(map);
                if (!line.isBlank()) {
                    lines.add(line);
                }
            }
        }
        return String.join("\n", lines);
    }

    private static String asText(Object value) {
        return value instanceof String text ? text : "";
    }
}
