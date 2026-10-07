package com.nestly.backend.service;

import java.util.List;
import java.util.Map;
import java.util.Set;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ResponseStatusException;

import com.nestly.backend.domain.SectionType;

@Component
public class SectionDataValidator {

    private enum Kind {
        SHORT_TEXT, LONG_TEXT, BOOLEAN, NUMBER
    }

    private static final int MAX_ITEMS = 100;
    private static final int MAX_SHORT_TEXT = 500;
    private static final int MAX_LONG_TEXT = 50_000;
    private static final double MAX_AMOUNT = 1_000_000_000_000d;
    private static final int MIN_MOOD = 1;
    private static final int MAX_MOOD = 5;

    private static final Map<String, Kind> FREETEXT_FIELDS = Map.of("text", Kind.LONG_TEXT, "confirmed", Kind.BOOLEAN);
    private static final Map<String, Kind> MOOD_FIELDS = Map.of("value", Kind.NUMBER);
    private static final Map<String, Kind> CHECKLIST_ITEM = Map.of(
            "id", Kind.SHORT_TEXT, "text", Kind.SHORT_TEXT, "done", Kind.BOOLEAN);
    private static final Map<String, Kind> EXPENSE_ITEM = Map.of(
            "id", Kind.SHORT_TEXT, "label", Kind.SHORT_TEXT, "amount", Kind.NUMBER, "category", Kind.SHORT_TEXT);
    private static final Map<String, Kind> APPOINTMENT_ITEM = Map.of(
            "id", Kind.SHORT_TEXT, "time", Kind.SHORT_TEXT, "description", Kind.SHORT_TEXT);

    public void validate(SectionType type, Map<String, Object> data) {
        switch (type) {
            case FREETEXT ->
                checkFields("data", data, FREETEXT_FIELDS);
            case MOOD -> {
                checkFields("data", data, MOOD_FIELDS);
                checkMood(data.get("value"));
            }
            case CHECKLIST ->
                checkItemList(data, CHECKLIST_ITEM);
            case EXPENSES ->
                checkItemList(data, EXPENSE_ITEM);
            case APPOINTMENTS ->
                checkItemList(data, APPOINTMENT_ITEM);
        }
    }

    private void checkItemList(Map<String, Object> data, Map<String, Kind> itemFields) {
        checkKeys("data", data.keySet(), Set.of("items", "confirmed"));
        if (data.containsKey("confirmed")) {
            checkValue("data.confirmed", data.get("confirmed"), Kind.BOOLEAN);
        }
        if (!data.containsKey("items")) {
            return;
        }
        if (!(data.get("items") instanceof List<?> items)) {
            throw invalid("data.items must be a list");
        }
        if (items.size() > MAX_ITEMS) {
            throw invalid("data.items can hold at most " + MAX_ITEMS + " entries");
        }
        for (int index = 0; index < items.size(); index++) {
            String path = "data.items[" + index + "]";
            if (!(items.get(index) instanceof Map<?, ?> item)) {
                throw invalid(path + " must be an object");
            }
            checkFields(path, item, itemFields);
        }
    }

    private void checkFields(String path, Map<?, ?> values, Map<String, Kind> fields) {
        checkKeys(path, values.keySet(), fields.keySet());
        for (Map.Entry<?, ?> entry : values.entrySet()) {
            checkValue(path + "." + entry.getKey(), entry.getValue(), fields.get(entry.getKey()));
        }
    }

    private void checkKeys(String path, Set<?> actual, Set<String> allowed) {
        for (Object key : actual) {
            if (!allowed.contains(key)) {
                throw invalid(path + " has an unknown field: " + key);
            }
        }
    }

    private void checkValue(String path, Object value, Kind kind) {
        switch (kind) {
            case SHORT_TEXT ->
                checkText(path, value, MAX_SHORT_TEXT);
            case LONG_TEXT ->
                checkText(path, value, MAX_LONG_TEXT);
            case BOOLEAN -> {
                if (!(value instanceof Boolean)) {
                    throw invalid(path + " must be true or false");
                }
            }
            case NUMBER -> {
                if (!(value instanceof Number number) || !Double.isFinite(number.doubleValue())
                        || Math.abs(number.doubleValue()) > MAX_AMOUNT) {
                    throw invalid(path + " must be a number between -" + (long) MAX_AMOUNT + " and " + (long) MAX_AMOUNT);
                }
            }
        }
    }

    private void checkText(String path, Object value, int maxLength) {
        if (!(value instanceof String text) || text.length() > maxLength) {
            throw invalid(path + " must be text of at most " + maxLength + " characters");
        }
    }

    private void checkMood(Object value) {
        if (value == null) {
            return;
        }
        double number = ((Number) value).doubleValue();
        if (number != Math.rint(number) || number < MIN_MOOD || number > MAX_MOOD) {
            throw invalid("data.value must be a whole number from " + MIN_MOOD + " to " + MAX_MOOD);
        }
    }

    private static ResponseStatusException invalid(String message) {
        return new ResponseStatusException(HttpStatus.BAD_REQUEST, message);
    }
}
